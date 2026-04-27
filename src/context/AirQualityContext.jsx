/**
 * ============================================================
 *  SECTION 3 — STATE MANAGEMENT
 *  AirQualityContext manages:
 *    - theme (dark/light)
 *    - searchQuery + debounced search
 *    - cities data fetched from OpenAQ
 *    - selectedPollutant filter
 *    - sortBy preference
 *    - favorites list (persisted to localStorage)
 *    - loading / error states
 * ============================================================
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { fetchCityMeasurements, fetchCitiesByQuery } from '../services/api'
import useLocalStorage from '../hooks/useLocalStorage'
import useDebounce from '../hooks/useDebounce'

export const AirQualityContext = createContext(null)

export function AirQualityProvider({ children }) {
  /* ── Theme ──────────────────────────────────────────────── */
  const [theme, setTheme] = useLocalStorage('aq_theme', 'light')

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [setTheme])

  /* ── Search & Filters ───────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPollutant, setSelectedPollutant] = useState('all')
  const [sortBy, setSortBy] = useState('aqi_desc')

  // Debounced query — only fires API call after 450ms idle
  const debouncedQuery = useDebounce(searchQuery, 450)

  /* ── City Data ──────────────────────────────────────────── */
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  /* ── Favorites (CRUD) ──────────────────────────────────── */
  const [favorites, setFavorites] = useLocalStorage('aq_favorites', [])

  const addFavorite = useCallback((city) => {
    setFavorites(prev =>
      prev.find(f => f.city === city.city) ? prev : [...prev, city]
    )
  }, [setFavorites])

  const removeFavorite = useCallback((cityName) => {
    setFavorites(prev => prev.filter(f => f.city !== cityName))
  }, [setFavorites])

  const isFavorite = useCallback((cityName) => {
    return favorites.some(f => f.city === cityName)
  }, [favorites])

  /* ── API Fetch ──────────────────────────────────────────── */
  const loadCities = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCitiesByQuery(query || 'Delhi')
      setCities(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch air quality data.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on debounced query change
  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      loadCities(debouncedQuery)
    } else if (debouncedQuery.trim().length === 0) {
      loadCities('Delhi')
    }
  }, [debouncedQuery, loadCities])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadCities(debouncedQuery || 'Delhi')
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [debouncedQuery, loadCities])

  /* ── SECTION 6: useMemo for heavy filtering & sorting ───── */
  const filteredAndSortedCities = useMemo(() => {
    let result = [...cities]

    // Filter by pollutant
    if (selectedPollutant !== 'all') {
      result = result.filter(city =>
        city.measurements?.some(m => m.parameter === selectedPollutant)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'aqi_desc': return (b.aqi ?? 0) - (a.aqi ?? 0)
        case 'aqi_asc':  return (a.aqi ?? 0) - (b.aqi ?? 0)
        case 'name_asc': return a.city.localeCompare(b.city)
        case 'name_desc': return b.city.localeCompare(a.city)
        default: return 0
      }
    })

    return result
  }, [cities, selectedPollutant, sortBy])

  /* ── Context Value ──────────────────────────────────────── */
  const value = {
    // theme
    theme, toggleTheme,
    // search & filters
    searchQuery, setSearchQuery,
    selectedPollutant, setSelectedPollutant,
    sortBy, setSortBy,
    // data
    cities: filteredAndSortedCities,
    rawCities: cities,
    loading, error, lastUpdated,
    loadCities,
    // favorites
    favorites, addFavorite, removeFavorite, isFavorite,
  }

  return (
    <AirQualityContext.Provider value={value}>
      {children}
    </AirQualityContext.Provider>
  )
}

// Convenience hook
export function useAirQuality() {
  const ctx = useContext(AirQualityContext)
  if (!ctx) throw new Error('useAirQuality must be used within AirQualityProvider')
  return ctx
}
