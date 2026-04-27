import { useAirQuality } from '../context/AirQualityContext'
import FavoritesList from '../components/favorites/FavoritesList'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const { favorites } = useAirQuality()

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Saved Cities
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-body mt-1">
              {favorites.length > 0
                ? `${favorites.length} city${favorites.length > 1 ? ' cities' : ''} saved to your watchlist`
                : 'Your personal air quality watchlist'}
            </p>
          </div>
          {favorites.length > 0 && (
            <Link to="/" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add City
            </Link>
          )}
        </div>
      </div>

      <FavoritesList />

      {favorites.length > 0 && (
        <p className="text-center text-xs font-mono text-slate-300 dark:text-slate-700 mt-8">
          Saved cities persist via localStorage · Click any city to view live data
        </p>
      )}
    </div>
  )
}
