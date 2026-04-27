/**
 * AQI Gauge — SVG arc-based gauge chart.
 * Fully reusable functional component.
 * Props: aqi (number), size (number)
 */
import { useMemo } from 'react'
import { getAQICategory } from '../../services/api'

export default function AQIGauge({ aqi, size = 140 }) {
  const category = getAQICategory(aqi)
  const maxAQI = 500

  const { pathD, needleTransform, cx, cy, r } = useMemo(() => {
    const cx = size / 2
    const cy = size * 0.6
    const r = size * 0.38
    const startAngle = -200
    const endAngle = 20
    const totalAngle = endAngle - startAngle

    // Arc path helper
    function polarToCartesian(angle) {
      const rad = (angle * Math.PI) / 180
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
      }
    }

    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const pathD = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`

    // Needle angle
    const pct = Math.min(Math.max((aqi ?? 0) / maxAQI, 0), 1)
    const needleAngle = startAngle + pct * totalAngle
    const needleTransform = `rotate(${needleAngle}, ${cx}, ${cy})`

    return { pathD, needleTransform, cx, cy, r }
  }, [aqi, size])

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
        {/* Background arc */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          className="text-slate-100 dark:text-slate-800"
        />

        {/* Colored progress arc */}
        <path
          d={pathD}
          fill="none"
          stroke={category.color}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * r * 1.22 * Math.min((aqi ?? 0) / maxAQI, 1)} ${Math.PI * r * 2}`}
          style={{ filter: `drop-shadow(0 0 6px ${category.color}60)` }}
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - size * 0.05)}
          y2={cy}
          stroke={category.color}
          strokeWidth={2}
          strokeLinecap="round"
          transform={`rotate(${-200 + Math.min((aqi ?? 0) / maxAQI, 1) * 220}, ${cx}, ${cy})`}
        />
        <circle cx={cx} cy={cy} r={size * 0.04} fill={category.color} />

        {/* AQI value */}
        <text
          x={cx}
          y={cy - size * 0.12}
          textAnchor="middle"
          className="font-display font-bold"
          style={{ fontFamily: 'Syne, sans-serif', fontSize: size * 0.18, fill: category.color }}
        >
          {aqi ?? '—'}
        </text>
        <text
          x={cx}
          y={cy - size * 0.02}
          textAnchor="middle"
          style={{ fontFamily: 'DM Mono, monospace', fontSize: size * 0.08, fill: '#94a3b8' }}
        >
          AQI
        </text>
      </svg>
      <span className={`badge ${category.cls} text-xs mt-1`}>{category.label}</span>
    </div>
  )
}
