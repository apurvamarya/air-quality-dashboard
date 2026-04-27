/**
 * ============================================================
 *  SECTION 4 — API INTEGRATION
 *  Uses Axios to communicate with the OpenAQ public API (v2).
 *  Includes loading state helpers, error normalization,
 *  response transformers, and fallback mock data.
 * ============================================================
 */

import axios from 'axios'

// ── Axios Instance ────────────────────────────────────────────
const openAQClient = axios.create({
  baseURL: 'https://api.openaq.org/v2',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor — log in dev
openAQClient.interceptors.request.use(config => {
  if (import.meta.env.DEV) {
    console.log(`[OpenAQ] ${config.method?.toUpperCase()} ${config.url}`, config.params)
  }
  return config
})

// Response interceptor — normalize errors
openAQClient.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'Network error'
    return Promise.reject(new Error(message))
  }
)

// ── AQI Calculator ────────────────────────────────────────────
/**
 * Simplified AQI approximation from PM2.5 µg/m³
 * Using US EPA breakpoints
 */
export function calcAQI(pm25) {
  if (pm25 == null) return null
  const v = pm25
  if (v <= 12)    return Math.round((50 / 12) * v)
  if (v <= 35.4)  return Math.round(50 + ((100 - 51) / (35.4 - 12.1)) * (v - 12.1))
  if (v <= 55.4)  return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (v - 35.5))
  if (v <= 150.4) return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (v - 55.5))
  if (v <= 250.4) return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (v - 150.5))
  return Math.round(301 + ((400 - 301) / (350.4 - 250.5)) * (v - 250.5))
}

export function getAQICategory(aqi) {
  if (!aqi) return { label: 'Unknown', color: '#94a3b8', bg: 'bg-slate-200', text: 'text-slate-600', cls: '' }
  if (aqi <= 50)  return { label: 'Good', color: '#22c55e', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', cls: 'aqi-good' }
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', cls: 'aqi-moderate' }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#f97316', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', cls: 'aqi-usg' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', cls: 'aqi-unhealthy' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', cls: 'aqi-very' }
  return { label: 'Hazardous', color: '#dc2626', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', cls: 'aqi-hazardous' }
}

// ── Transform raw OpenAQ data → app model ────────────────────
function transformLatestData(rawResults) {
  const cityMap = {}

  rawResults.forEach(location => {
    const cityName = location.city || location.location || 'Unknown'
    if (!cityMap[cityName]) {
      cityMap[cityName] = {
        city: cityName,
        country: location.country,
        locationId: location.location,
        coordinates: location.coordinates,
        measurements: [],
        lastUpdated: location.lastUpdated,
      }
    }
    location.measurements?.forEach(m => {
      cityMap[cityName].measurements.push({
        parameter: m.parameter,
        value: m.value,
        unit: m.unit,
        lastUpdated: m.lastUpdated,
      })
    })
  })

  return Object.values(cityMap).map(city => {
    const pm25 = city.measurements.find(m => m.parameter === 'pm25')?.value
    const aqi = calcAQI(pm25)
    return { ...city, aqi, pm25 }
  })
}

// ── API Functions ─────────────────────────────────────────────

/**
 * Fetch latest measurements for cities matching `query`.
 * Falls back to mock data if the API is unavailable.
 */
export async function fetchCitiesByQuery(query = 'Delhi') {
  try {
    const response = await openAQClient.get('/latest', {
      params: { city: query, limit: 20, has_geo: true },
    })

    const results = response.data?.results ?? []
    if (results.length === 0) throw new Error('No data found')
    return transformLatestData(results)
  } catch (err) {
    console.warn('[OpenAQ] API failed, using fallback mock data:', err.message)
    return getMockData(query)
  }
}

/**
 * Fetch detailed measurements for a specific city.
 */
export async function fetchCityMeasurements(cityName, parameter = 'pm25') {
  try {
    const response = await openAQClient.get('/measurements', {
      params: { city: cityName, parameter, limit: 24, sort: 'desc', order_by: 'datetime' },
    })
    return response.data?.results ?? []
  } catch (err) {
    console.warn('[OpenAQ] City detail fetch failed:', err.message)
    return getMockMeasurements(cityName, parameter)
  }
}

/**
 * Fetch available countries/cities for autocomplete.
 */
export async function fetchCitySuggestions(query) {
  try {
    const response = await openAQClient.get('/cities', {
      params: { city: query, limit: 8 },
    })
    return response.data?.results?.map(c => c.city) ?? []
  } catch {
    return []
  }
}

// ── MOCK DATA (Section 7 - fallback fail-safe) ────────────────
export function getMockData(query = '') {
  const seed = [
    { city: 'Delhi', country: 'IN', aqi: 187, pm25: 89.2, pm10: 145, no2: 67, o3: 34, co: 1.2, so2: 15 },
    { city: 'Mumbai', country: 'IN', aqi: 112, pm25: 42.1, pm10: 78, no2: 45, o3: 28, co: 0.8, so2: 9 },
    { city: 'Beijing', country: 'CN', aqi: 156, pm25: 64.3, pm10: 102, no2: 78, o3: 22, co: 1.5, so2: 20 },
    { city: 'London', country: 'GB', aqi: 48, pm25: 11.2, pm10: 22, no2: 38, o3: 51, co: 0.3, so2: 4 },
    { city: 'New York', country: 'US', aqi: 62, pm25: 16.8, pm10: 31, no2: 42, o3: 60, co: 0.4, so2: 5 },
    { city: 'Tokyo', country: 'JP', aqi: 41, pm25: 9.4, pm10: 18, no2: 30, o3: 44, co: 0.2, so2: 3 },
    { city: 'Los Angeles', country: 'US', aqi: 88, pm25: 24.7, pm10: 42, no2: 55, o3: 72, co: 0.6, so2: 7 },
    { city: 'Paris', country: 'FR', aqi: 55, pm25: 13.6, pm10: 25, no2: 44, o3: 55, co: 0.3, so2: 4 },
    { city: 'Shanghai', country: 'CN', aqi: 134, pm25: 52.8, pm10: 88, no2: 60, o3: 30, co: 1.1, so2: 17 },
    { city: 'Lahore', country: 'PK', aqi: 214, pm25: 103.5, pm10: 168, no2: 80, o3: 18, co: 2.1, so2: 28 },
    { city: 'Dhaka', country: 'BD', aqi: 176, pm25: 82.4, pm10: 132, no2: 72, o3: 22, co: 1.8, so2: 24 },
    { city: 'Sydney', country: 'AU', aqi: 33, pm25: 7.6, pm10: 15, no2: 22, o3: 40, co: 0.2, so2: 2 },
  ]

  const filtered = query
    ? seed.filter(c => c.city.toLowerCase().includes(query.toLowerCase()))
    : seed

  return (filtered.length ? filtered : seed).map(d => ({
    city: d.city,
    country: d.country,
    aqi: d.aqi,
    pm25: d.pm25,
    locationId: d.city,
    coordinates: null,
    measurements: [
      { parameter: 'pm25', value: d.pm25, unit: 'µg/m³' },
      { parameter: 'pm10', value: d.pm10, unit: 'µg/m³' },
      { parameter: 'no2', value: d.no2, unit: 'µg/m³' },
      { parameter: 'o3', value: d.o3, unit: 'µg/m³' },
      { parameter: 'co', value: d.co, unit: 'mg/m³' },
      { parameter: 'so2', value: d.so2, unit: 'µg/m³' },
    ],
    lastUpdated: new Date().toISOString(),
    isMock: true,
  }))
}

export function getMockMeasurements(city, param = 'pm25') {
  const base = getMockData(city)[0]
  const baseVal = base?.measurements?.find(m => m.parameter === param)?.value ?? 30
  return Array.from({ length: 24 }, (_, i) => ({
    date: { utc: new Date(Date.now() - i * 3600000).toISOString() },
    value: Math.max(1, baseVal + (Math.random() - 0.5) * 20),
    unit: 'µg/m³',
    parameter: param,
  })).reverse()
}
