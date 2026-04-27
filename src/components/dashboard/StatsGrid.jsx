import { useMemo } from 'react'
import { useAirQuality } from '../../context/AirQualityContext'
import { getAQICategory } from '../../services/api'

export default function StatsGrid() {
  const { cities, lastUpdated } = useAirQuality()

  const stats = useMemo(() => {
    if (!cities.length) return null
    const aqiValues = cities.map(c => c.aqi).filter(Boolean)
    const avg = aqiValues.length ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) : 0
    const max = Math.max(...aqiValues)
    const min = Math.min(...aqiValues)
    const maxCity = cities.find(c => c.aqi === max)
    const minCity = cities.find(c => c.aqi === min)

    const breakdown = {
      good: cities.filter(c => (c.aqi ?? 0) <= 50).length,
      moderate: cities.filter(c => (c.aqi ?? 0) > 50 && (c.aqi ?? 0) <= 100).length,
      unhealthy: cities.filter(c => (c.aqi ?? 0) > 100).length,
    }

    return { avg, max, min, maxCity, minCity, total: cities.length, breakdown }
  }, [cities])

  if (!stats) return null

  const avgCategory = getAQICategory(stats.avg)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {[
        {
          label: 'Avg AQI',
          value: stats.avg,
          sub: avgCategory.label,
          color: avgCategory.color,
          icon: '📊',
        },
        {
          label: 'Worst City',
          value: stats.maxCity?.city ?? '—',
          sub: `AQI ${stats.max}`,
          color: getAQICategory(stats.max).color,
          icon: '⚠️',
        },
        {
          label: 'Cleanest City',
          value: stats.minCity?.city ?? '—',
          sub: `AQI ${stats.min}`,
          color: getAQICategory(stats.min).color,
          icon: '✅',
        },
        {
          label: 'Cities Tracked',
          value: stats.total,
          sub: `${stats.breakdown.good} good · ${stats.breakdown.unhealthy} poor`,
          color: '#64748b',
          icon: '🌍',
        },
      ].map((s, i) => (
        <div key={i} className="card p-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {s.label}
            </span>
            <span className="text-base">{s.icon}</span>
          </div>
          <div
            className="font-display text-xl font-bold mb-0.5 truncate"
            style={{ color: s.color }}
          >
            {s.value}
          </div>
          <div className="text-xs font-mono text-slate-400 dark:text-slate-500 truncate">
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
