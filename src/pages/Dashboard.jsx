import { useAirQuality } from '../context/AirQualityContext'
import SearchBar from '../components/search/SearchBar'
import StatsGrid from '../components/dashboard/StatsGrid'
import CityCard from '../components/dashboard/CityCard'
import { LoadingSkeleton } from '../components/ui/LoadingSpinner'

export default function Dashboard() {
  const { cities, loading, error, lastUpdated, loadCities, searchQuery } = useAirQuality()

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Air Quality Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-body mt-1">
              Real-time particulate matter &amp; pollutant monitoring via OpenAQ
            </p>
          </div>
          {lastUpdated && (
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Live</span>
              </div>
              <p className="text-xs font-mono text-slate-300 dark:text-slate-600">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats summary */}
      <StatsGrid />

      {/* Search & filters */}
      <div className="card p-4 mb-6">
        <SearchBar />
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="card p-4 mb-6 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-0.5 font-mono">
                Showing demo data as fallback — live API unavailable.
              </p>
            </div>
            <button
              onClick={() => loadCities(searchQuery || 'Delhi')}
              className="text-xs font-mono text-red-600 dark:text-red-400 hover:underline shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* City grid */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : cities.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2">
            No cities found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
            Try searching a different city name.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cities.map((city, i) => (
            <CityCard key={`${city.city}-${i}`} city={city} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs font-mono text-slate-300 dark:text-slate-700 mt-10">
        Data sourced from OpenAQ · Auto-refreshes every 5 min · Debounced search (450ms)
      </p>
    </div>
  )
}
