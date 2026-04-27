import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAirQuality } from '../../context/AirQualityContext'
import { getAQICategory } from '../../services/api'

export default function FavoritesList() {
  const { favorites, removeFavorite } = useAirQuality()
  const navigate = useNavigate()

  const handleRemove = useCallback((e, cityName) => {
    e.stopPropagation()
    removeFavorite(cityName)
  }, [removeFavorite])

  if (!favorites.length) {
    return (
      <div className="card p-12 text-center animate-fade-in">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-2xl">
          ⭐
        </div>
        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2">No saved cities yet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
          Click the star icon on any city card to save it here for quick access.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {favorites.map((city, i) => {
        const cat = getAQICategory(city.aqi)
        return (
          <div
            key={city.city}
            className="card card-hover p-5 cursor-pointer group animate-slide-up flex items-center gap-4"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => navigate(`/city/${encodeURIComponent(city.city)}`)}
          >
            {/* AQI indicator */}
            <div
              className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0"
              style={{ backgroundColor: `${cat.color}18` }}
            >
              <span className="font-display font-bold text-lg leading-none" style={{ color: cat.color }}>
                {city.aqi ?? '?'}
              </span>
              <span className="text-[9px] font-mono" style={{ color: cat.color }}>AQI</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-display font-bold text-slate-900 dark:text-white truncate">
                  {city.city}
                </span>
                <span className="text-xs font-mono text-slate-400">{city.country}</span>
              </div>
              <span className={`badge ${cat.cls}`}>{cat.label}</span>
            </div>

            {/* Pollutants */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {(city.measurements ?? []).slice(0, 3).map(m => (
                <div key={m.parameter} className="text-center">
                  <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    {m.value?.toFixed(1)}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">{m.parameter}</div>
                </div>
              ))}
            </div>

            {/* Remove & navigate */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={(e) => handleRemove(e, city.city)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                aria-label="Remove from saved"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
