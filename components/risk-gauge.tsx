"use client"

import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function getRiskColor(value: number): string {
  if (value >= 80) return "#ef4444" // red-500
  if (value >= 60) return "#f97316" // orange-500
  if (value >= 40) return "#eab308" // yellow-500
  return "#22c55e" // green-500
}

function getRiskLabel(value: number, t: (key: string) => string): string {
  if (value >= 80) return t("risk.critical")
  if (value >= 60) return t("risk.high")
  if (value >= 40) return t("risk.medium")
  return t("risk.low")
}

export function RiskGauge({ value, animated }: { value: number; animated?: boolean }) {
  const { t } = useI18n()
  const displayValue = Number(value.toFixed(1))
  const color = getRiskColor(displayValue)
  const label = getRiskLabel(displayValue, t)

  // Semi-circle gauge calculations - Optimizing for centered horizontal layout
  const radius = 85
  const strokeWidth = 14
  const cx = 100
  const cy = 110 // Centered more vertically to prevent clipping
  const startAngle = Math.PI + 0.35 // Slightly further out
  const endAngle = -0.35
  const totalAngle = startAngle - endAngle

  // Background arc path
  const bgStartX = cx + radius * Math.cos(startAngle)
  const bgStartY = cy - radius * Math.sin(startAngle)
  const bgEndX = cx + radius * Math.cos(endAngle)
  const bgEndY = cy - radius * Math.sin(endAngle)

  const bgPath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 0 1 ${bgEndX} ${bgEndY}`

  // Value arc
  const valuePercent = Math.min(Math.max(displayValue, 0), 100)
  const valueAngle = startAngle - (valuePercent / 100) * totalAngle
  const valEndX = cx + radius * Math.cos(valueAngle)
  const valEndY = cy - radius * Math.sin(valueAngle)
  const largeArc = (valuePercent / 100) * totalAngle > Math.PI ? 1 : 0

  const valuePath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 ${largeArc} 1 ${valEndX} ${valEndY}`

  // Tick marks
  const ticks = [0, 20, 40, 60, 80, 100]

  return (
    <div className="flex flex-col items-center select-none w-full">
      <div className="relative w-full max-w-[320px] aspect-[1.6/1]">
        <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Soft Shadow for the arc */}
            <filter id="gauge-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feOffset dx="0" dy="2" result="offsetBlur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Premium Gradient */}
            <linearGradient id="premium-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getRiskColor(Math.max(0, displayValue - 30))} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>

            {/* Inner Glow */}
            <filter id="inner-glow">
              <feFlood floodColor={color} />
              <feComposite in2="SourceGraphic" operator="out" />
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in2="SourceGraphic" operator="atop" />
            </filter>
          </defs>

          {/* Background Track - Subtle Glassmorphism style */}
          <path
            d={bgPath}
            fill="none"
            stroke="currentColor"
            className="text-secondary/50"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          {displayValue > 0 && (
            <path
              d={valuePath}
              fill="none"
              stroke="url(#premium-gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#gauge-shadow)"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Ticks & Labels */}
          {ticks.map((tick) => {
            const angle = startAngle - (tick / 100) * totalAngle
            const innerR = radius - strokeWidth - 5
            const outerR = radius - strokeWidth + 2
            const x1 = cx + innerR * Math.cos(angle)
            const y1 = cy - innerR * Math.sin(angle)
            const x2 = cx + outerR * Math.cos(angle)
            const y2 = cy - outerR * Math.sin(angle)

            const labelR = radius + strokeWidth + 12
            const lx = cx + labelR * Math.cos(angle)
            const ly = cy - labelR * Math.sin(angle)

            return (
              <g key={tick}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-muted-foreground/40"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground font-mono font-medium"
                  style={{ fontSize: '8px' }}
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Center Score & Label */}
          <g transform={`translate(${cx}, ${cy - 10})`}>
            <text
              textAnchor="middle"
              className="font-mono font-black tracking-tighter"
              style={{ fontSize: displayValue >= 100 ? '42px' : '48px', fill: color }}
            >
              {displayValue}
            </text>
            <text
              y="28"
              textAnchor="middle"
              className="fill-muted-foreground font-sans font-bold uppercase tracking-[0.2em]"
              style={{ fontSize: '7px' }}
            >
              {t("scanner.risk")}
            </text>
            <text
              y="42"
              textAnchor="middle"
              className="font-sans font-extrabold uppercase"
              style={{ fontSize: '10px', fill: color }}
            >
              {label}
            </text>
          </g>
        </svg>
      </div>

      {/* Modern Status Badge / Legend item */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase">
          {label} Analysis
        </span>
      </div>
    </div>
  )
}
