import { useAirQuality } from '../../context/AirQualityContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAirQuality()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${
        isDark ? 'bg-slate-700' : 'bg-amber-200'
      }`}
    >
      {/* Thumb — icon lives inside it */}
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center text-sm select-none ${
          isDark ? 'translate-x-7 bg-slate-900' : 'translate-x-0 bg-white'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}