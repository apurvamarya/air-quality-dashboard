/**
 * SECTION 4 (continued) — useParams + Axios for city-specific data
 * Demonstrates: useParams, useNavigate, useEffect, useCallback, Axios
 */
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchCityMeasurements, getMockData, getAQICategory, calcAQI } from '../services/api'
import { useAirQuality } from '../context/AirQualityContext'
import AQIGauge from '../components/charts/AQIGauge'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const PARAMS = ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co']
const PARAM_COLORS = {
  pm25: '#ef4444', pm10: '#f97316', no2: '#a855f7',
  o3: '#3b82f6', co: '#eab308', so2: '#ec4899',
}
const PARAM_LABELS = {
  pm25: 'PM₂.₅', pm10: 'PM₁₀', no2: 'NO₂', o3: 'O₃', co: 'CO', so2: 'SO₂'
}
const PARAM_LIMITS = { pm25: 35, pm10: 150, no2: 100, o3: 100, co: 4, so2: 75 }
const PARAM_EFFECTS = {
  pm25: 'Fine particulate matter — penetrates deep into lungs. Key driver of AQI.',
  pm10: 'Coarse particles — irritate respiratory system.',
  no2: 'Nitrogen dioxide — from combustion. Can cause lung damage.',
  o3: 'Ground-level ozone — photochemical smog component.',
  co: 'Carbon monoxide — colorless toxic gas from incomplete combustion.',
  so2: 'Sulfur dioxide — from fossil fuel burning, causes acid rain.',
}

export default function CityDetail() {
  const { cityName } = useParams()
  const navigate = useNavigate()
  const { addFavorite, removeFavorite, isFavorite, rawCities } = useAirQuality()

  const decoded = decodeURIComponent(cityName)
  const favored = isFavorite(decoded)

  const [activeParam, setActiveParam] = useState('pm25')
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(false)

  // Get base city data from context or mock
  const cityData = useMemo(() => {
    return rawCities.find(c => c.city === decoded) || getMockData(decoded)[0]
  }, [rawCities, decoded])

  // Fetch 24h history for active param
  useEffect(() => {
    if (!decoded) return
    setHistLoading(true)
    fetchCityMeasurements(decoded, activeParam)
      .then(data => {
        setHistory(data.map((d, i) => ({
          label: new Date(d.date?.utc || Date.now() - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: d.value,
        })))
      })
      .finally(() => setHistLoading(false))
  }, [decoded, activeParam])

  const handleToggleFav = useCallback(() => {
    favored ? removeFavorite(decoded) : addFavorite(cityData)
  }, [favored, decoded, cityData, addFavorite, removeFavorite])

  const category = getAQICategory(cityData?.aqi)

  // Health advisory
  const advisory = useMemo(() => {
    const aqi = cityData?.aqi ?? 0
    if (aqi <= 50)  return { msg: 'Air quality is satisfactory. Enjoy outdoor activities.', icon: '😊', color: 'green' }
    if (aqi <= 100) return { msg: 'Acceptable quality. Unusually sensitive people should limit prolonged outdoor exertion.', icon: '😐', color: 'yellow' }
    if (aqi <= 150) return { msg: 'Members of sensitive groups may experience effects. General public not affected.', icon: '😷', color: 'orange' }
    if (aqi <= 200) return { msg: 'Everyone may experience health effects. Sensitive groups should avoid outdoor activity.', icon: '⚠️', color: 'red' }
    if (aqi <= 300) return { msg: 'Health alert — everyone may experience serious effects. Avoid outdoor activity.', icon: '🚨', color: 'purple' }
    return { msg: 'Emergency conditions. Entire population is likely to be affected. Stay indoors.', icon: '☠️', color: 'rose' }
  }, [cityData?.aqi])

  // Bar data for all pollutants
  const allPollutantBars = useMemo(() => {
    return (cityData?.measurements ?? []).map(m => ({
      label: PARAM_LABELS[m.parameter] ?? m.parameter,
      value: m.value,
      color: PARAM_COLORS[m.parameter] ?? '#64748b',
    }))
  }, [cityData])

  if (!cityData) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <LoadingSpinner size="lg" text="Loading city data..." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-mono text-slate-400 mb-6">
        <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{decoded}</span>
      </div>

      {/* Hero section */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Left: Gauge */}
          <div className="flex flex-col items-center gap-3">
            <AQIGauge aqi={cityData.aqi} size={150} />
            <button
              onClick={handleToggleFav}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all ${
                favored
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600'
              }`}
            >
              <svg className="w-4 h-4" fill={favored ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              {favored ? 'Saved' : 'Save City'}
            </button>
          </div>

          {/* Right: Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                  {decoded}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-body text-sm mt-0.5">
                  {cityData.country} · Real-time air quality
                </p>
              </div>
              <button onClick={() => navigate(-1)} className="btn-ghost">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>

            {/* Health advisory */}
            <div className={`rounded-xl p-4 mb-4 ${
              advisory.color === 'green' ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30' :
              advisory.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30' :
              advisory.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30' :
              advisory.color === 'red' ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30' :
              advisory.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30' :
              'bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-xl">{advisory.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-body">
                    Health Advisory
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-body mt-0.5">
                    {advisory.msg}
                  </p>
                </div>
              </div>
            </div>

            {/* Pollutant overview bar chart */}
            {allPollutantBars.length > 0 && (
              <div>
                <p className="text-xs font-mono text-slate-400 mb-1">All Pollutants Overview</p>
                <BarChart data={allPollutantBars} height={80} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 24h History Chart */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-slate-900 dark:text-white">
            24-Hour Trend
          </h2>
          <div className="flex gap-1.5 flex-wrap">
            {PARAMS.map(p => (
              <button
                key={p}
                onClick={() => setActiveParam(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeParam === p
                    ? 'text-white font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={activeParam === p ? { backgroundColor: PARAM_COLORS[p] } : {}}
              >
                {PARAM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {histLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner size="md" text="Loading trend data..." />
          </div>
        ) : (
          <>
            <LineChart
              data={history}
              height={180}
              color={PARAM_COLORS[activeParam]}
              unit=" µg/m³"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-mono text-slate-400">
                {PARAM_LABELS[activeParam]} over last 24 hours
              </p>
              <p className="text-xs font-mono text-slate-400">
                Safe limit: {PARAM_LIMITS[activeParam]} µg/m³
              </p>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600 font-body mt-1">
              {PARAM_EFFECTS[activeParam]}
            </p>
          </>
        )}
      </div>

      {/* Measurements table */}
      <div className="card p-5">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">
          Current Readings
        </h2>
        <div className="space-y-2">
          {(cityData.measurements ?? []).map(m => {
            const limit = PARAM_LIMITS[m.parameter]
            const pct = limit ? Math.min((m.value / limit) * 100, 100) : 50
            const exceeds = limit && m.value > limit
            return (
              <div key={m.parameter} className="flex items-center gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                <div className="w-16 shrink-0">
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: PARAM_COLORS[m.parameter] ?? '#64748b' }}
                  >
                    {PARAM_LABELS[m.parameter] ?? m.parameter}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PARAM_COLORS[m.parameter] ?? '#64748b',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-mono text-sm font-medium ${
                    exceeds ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {m.value?.toFixed(1)} {m.unit}
                  </span>
                  {exceeds && (
                    <span className="ml-1 text-[10px] font-mono text-red-400">↑ limit</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
