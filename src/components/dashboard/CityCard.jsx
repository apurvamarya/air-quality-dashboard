import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAirQuality } from '../../context/AirQualityContext'
import { getAQICategory } from '../../services/api'
import AQIGauge from '../charts/AQIGauge'
import BarChart from '../charts/BarChart'

// Pollutant color map
const PARAM_COLORS = {
  pm25: '#ef4444',
  pm10: '#f97316',
  no2:  '#a855f7',
  o3:   '#3b82f6',
  co:   '#eab308',
  so2:  '#ec4899',
}

const PARAM_LABELS = {
  pm25: 'PM₂.₅', pm10: 'PM₁₀', no2: 'NO₂', o3: 'O₃', co: 'CO', so2: 'SO₂'
}

export default function CityCard({ city }) {
  const navigate = useNavigate()
  const { addFavorite, removeFavorite, isFavorite } = useAirQuality()
  const favored = isFavorite(city.city)
  const category = getAQICategory(city.aqi)

  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation()
    favored ? removeFavorite(city.city) : addFavorite(city)
  }, [favored, city, addFavorite, removeFavorite])

  const handleViewDetail = useCallback(() => {
    navigate(`/city/${encodeURIComponent(city.city)}`)
  }, [navigate, city.city])

  // Prepare bar chart data
  const barData = (city.measurements ?? [])
    .filter(m => ['pm25', 'pm10', 'no2', 'o3'].includes(m.parameter))
    .map(m => ({
      label: PARAM_LABELS[m.parameter] ?? m.parameter,
      value: m.value,
      color: PARAM_COLORS[m.parameter] ?? '#64748b',
    }))

  return (
    <div
      className="card card-hover p-5 cursor-pointer group animate-slide-up"
      onClick={handleViewDetail}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              {city.city}
            </h3>
            {city.isMock && (
              <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px]">
                demo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {city.country}
            </span>
            <span className={`badge ${category.cls}`}>{category.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          {/* Favorite button — CRUD Section 5 */}
          <button
            onClick={handleToggleFavorite}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
              favored
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-amber-400'
            }`}
            aria-label={favored ? 'Remove from saved' : 'Save city'}
          >
            <svg className="w-4 h-4" fill={favored ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {/* Arrow */}
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Gauge */}
        <div className="shrink-0">
          <AQIGauge aqi={city.aqi} size={90} />
        </div>

        {/* Bar chart */}
        <div className="flex-1 min-w-0">
          {barData.length > 0 ? (
            <>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-1">Pollutants (µg/m³)</p>
              <BarChart data={barData} height={90} />
            </>
          ) : (
            <div className="h-20 flex items-center justify-center text-xs text-slate-400 font-mono">
              No measurement data
            </div>
          )}
        </div>
      </div>

      {/* Last updated */}
      {city.lastUpdated && (
        <p className="text-[10px] font-mono text-slate-300 dark:text-slate-700 mt-3 text-right">
          Updated: {new Date(city.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
