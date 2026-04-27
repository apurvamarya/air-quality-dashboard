import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useAirQuality } from '../../context/AirQualityContext'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { favorites, loadCities, searchQuery, loading } = useAirQuality()

  const handleRefresh = useCallback(() => {
    loadCities(searchQuery || 'Delhi')
  }, [loadCities, searchQuery])

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/favorites', label: `Saved (${favorites.length})` },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center transition-transform group-hover:scale-110">
              <svg className="w-4 h-4 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              AirLens
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 rounded-lg text-sm font-body font-medium transition-all duration-150 ${
                  location.pathname === link.to
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-ghost"
              title="Refresh data"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin-slow' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
