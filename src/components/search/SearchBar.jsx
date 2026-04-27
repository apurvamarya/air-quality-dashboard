import { useCallback } from 'react'
import { useAirQuality } from '../../context/AirQualityContext'

const POLLUTANTS = [
  { value: 'all', label: 'All' },
  { value: 'pm25', label: 'PM₂.₅' },
  { value: 'pm10', label: 'PM₁₀' },
  { value: 'no2', label: 'NO₂' },
  { value: 'o3', label: 'O₃' },
  { value: 'so2', label: 'SO₂' },
  { value: 'co', label: 'CO' },
]

const SORT_OPTIONS = [
  { value: 'aqi_desc', label: 'AQI: Highest' },
  { value: 'aqi_asc',  label: 'AQI: Lowest' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'name_desc', label: 'Name: Z–A' },
]

export default function SearchBar() {
  const {
    searchQuery, setSearchQuery,
    selectedPollutant, setSelectedPollutant,
    sortBy, setSortBy,
    loading,
  } = useAirQuality()

  // useCallback to avoid re-creating handler on every render
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [setSearchQuery])

  const handleClear = useCallback(() => {
    setSearchQuery('')
  }, [setSearchQuery])

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 dark:border-t-slate-200 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search city — e.g. Delhi, London, Tokyo…"
          className="input-base pl-11 pr-10"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Pollutant filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mr-1">Filter:</span>
          {POLLUTANTS.map(p => (
            <button
              key={p.value}
              onClick={() => setSelectedPollutant(p.value)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all duration-150 ${
                selectedPollutant === p.value
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
