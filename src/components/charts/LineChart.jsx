/**
 * LineChart — Reusable SVG line/area chart.
 * Props: data ([{label, value}]), height, color, showArea
 */
import { useMemo, useState } from 'react'

export default function LineChart({ data = [], height = 160, color = '#1e293b', showArea = true, unit = '' }) {
  const [tooltip, setTooltip] = useState(null)

  const { points, areaPath, linePath, minVal, maxVal } = useMemo(() => {
    if (!data.length) return { points: [], areaPath: '', linePath: '', minVal: 0, maxVal: 1 }

    const W = 100
    const padT = 16
    const padB = 24
    const padH = 8
    const H = height - padT - padB
    const vals = data.map(d => d.value ?? 0)
    const minVal = Math.min(...vals) * 0.9
    const maxVal = Math.max(...vals) * 1.1 || 1

    const points = data.map((d, i) => ({
      x: padH + (i / Math.max(data.length - 1, 1)) * (W - padH * 2),
      y: padT + H - ((( d.value ?? 0) - minVal) / (maxVal - minVal)) * H,
      label: d.label,
      value: d.value,
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = linePath
      + ` L ${points[points.length - 1].x} ${padT + H}`
      + ` L ${points[0].x} ${padT + H}`
      + ' Z'

    return { points, areaPath, linePath, minVal, maxVal }
  }, [data, height])

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 116 ${height}`}
        className="w-full"
        style={{ overflow: 'visible' }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`area-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(frac => {
          const y = 16 + (height - 40) * (1 - frac)
          return (
            <line key={frac}
              x1={8} x2={108} y1={y} y2={y}
              stroke="currentColor" strokeWidth={0.5} strokeDasharray="3,3"
              className="text-slate-200 dark:text-slate-800"
            />
          )
        })}

        {/* Area fill */}
        {showArea && points.length > 1 && (
          <path
            d={areaPath}
            fill={`url(#area-grad-${color.replace('#', '')})`}
          />
        )}

        {/* Line */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tooltip?.i === i ? 4 : 2.5}
            fill={color}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setTooltip({ ...p, i })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(Math.max(tooltip.x - 18, 2), 80)}
              y={tooltip.y - 22}
              width={36} height={14}
              rx={3}
              fill="#1e293b"
            />
            <text
              x={Math.min(Math.max(tooltip.x, 20), 98)}
              y={tooltip.y - 13}
              textAnchor="middle"
              style={{ fontSize: 5.5, fontFamily: 'DM Mono, monospace', fill: 'white' }}
            >
              {typeof tooltip.value === 'number' ? tooltip.value.toFixed(1) : tooltip.value}{unit}
            </text>
          </g>
        )}

        {/* X-axis labels (first, mid, last) */}
        {points.length > 0 && [0, Math.floor(points.length / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map(i => (
            <text
              key={i}
              x={points[i].x}
              y={height - 6}
              textAnchor="middle"
              style={{ fontSize: 6, fontFamily: 'DM Mono, monospace', fill: '#94a3b8' }}
            >
              {points[i].label}
            </text>
          ))
        }
      </svg>
    </div>
  )
}
