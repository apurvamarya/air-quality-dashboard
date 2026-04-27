/**
 * BarChart — Reusable SVG bar chart.
 * Props: data ([{label, value, color?}]), height, showValues
 */
import { useMemo, useState } from 'react'

export default function BarChart({ data = [], height = 160, showValues = true, unit = '' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const { bars, maxVal } = useMemo(() => {
    const maxVal = Math.max(...data.map(d => d.value ?? 0), 1)
    return { bars: data, maxVal }
  }, [data])

  const padLeft = 8
  const padRight = 8
  const padTop = 24
  const padBottom = 28
  const chartWidth = 100 // percentages handled by SVG viewBox
  const chartHeight = height - padTop - padBottom
  const barWidth = bars.length > 0 ? (chartWidth / bars.length) * 0.55 : 8
  const gap = bars.length > 0 ? chartWidth / bars.length : 12

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${100 + padLeft + padRight} ${height}`}
        className="w-full"
        style={{ overflow: 'visible' }}
      >
        {bars.map((bar, i) => {
          const barHeight = ((bar.value ?? 0) / maxVal) * chartHeight
          const x = padLeft + i * gap + (gap - barWidth) / 2
          const y = padTop + chartHeight - barHeight
          const isHovered = hoveredIdx === i

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              {/* Background bar */}
              <rect
                x={x}
                y={padTop}
                width={barWidth}
                height={chartHeight}
                rx={3}
                className="fill-slate-100 dark:fill-slate-800"
              />
              {/* Value bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill={bar.color || '#1e293b'}
                opacity={isHovered ? 1 : 0.85}
                style={{ transition: 'all 0.3s ease', filter: isHovered ? `drop-shadow(0 0 4px ${bar.color || '#1e293b'}80)` : 'none' }}
              />
              {/* Value label on hover */}
              {isHovered && showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  style={{ fontSize: 7, fontFamily: 'DM Mono, monospace', fill: bar.color || '#1e293b', fontWeight: 600 }}
                >
                  {typeof bar.value === 'number' ? bar.value.toFixed(1) : bar.value}
                </text>
              )}
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={padTop + chartHeight + 14}
                textAnchor="middle"
                style={{ fontSize: 6.5, fontFamily: 'DM Mono, monospace', fill: '#94a3b8' }}
              >
                {bar.label}
              </text>
            </g>
          )
        })}

        {/* Y-axis grid lines */}
        {[0.25, 0.5, 0.75, 1].map(frac => {
          const y = padTop + chartHeight * (1 - frac)
          return (
            <line
              key={frac}
              x1={padLeft}
              x2={padLeft + 100}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="3,3"
              className="text-slate-200 dark:text-slate-800"
            />
          )
        })}
      </svg>
    </div>
  )
}
