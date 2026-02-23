"use client"

import { useI18n } from "@/lib/i18n"

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
  const displayValue = value // Disable count-up animation for stability
  const color = getRiskColor(displayValue)
  const label = getRiskLabel(displayValue, t)

  // Semi-circle gauge calculations
  const radius = 82
  const strokeWidth = 12
  const cx = 100
  const cy = 100
  const startAngle = Math.PI + 0.2
  const endAngle = -0.2
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
  const largeArc = valuePercent > 50 ? 1 : 0

  const valuePath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 ${largeArc} 1 ${valEndX} ${valEndY}`

  // Tick marks
  const ticks = [0, 20, 40, 60, 80, 100]

  return (
    <div className="flex flex-col items-center select-none">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
        <defs>
          {/* Main Glow Filter - More subtle for monochrome */}
          <filter id="gauge-glow-premium" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur1" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for the value arc - potentially keep it or make it monochrome? 
              User said "change bluish", so we keep red/green for logic but refine the look */}
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getRiskColor(Math.max(0, displayValue - 20))} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Background arc with subtle depth */}
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc with gradient */}
        {displayValue > 0 && (
          <path
            d={valuePath}
            fill="none"
            stroke={`url(#gauge-gradient)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Tick marks - Refined */}
        {ticks.map((tick) => {
          const angle = startAngle - (tick / 100) * totalAngle
          const innerR = radius - strokeWidth - 4
          const outerR = radius - strokeWidth + 2
          const x1 = cx + innerR * Math.cos(angle)
          const y1 = cy - innerR * Math.sin(angle)
          const x2 = cx + outerR * Math.cos(angle)
          const y2 = cy - outerR * Math.sin(angle)

          const labelR = radius - strokeWidth - 14
          const lx = cx + labelR * Math.cos(angle)
          const ly = cy - labelR * Math.sin(angle)

          const isMainTick = tick % 20 === 0

          return (
            <g key={tick} className="opacity-60">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="text-muted-foreground"
                strokeWidth={isMainTick ? "1.5" : "0.5"}
              />
              {isMainTick && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  className="text-muted-foreground fill-current"
                  fontSize="6.5"
                  fontWeight="500"
                  fontFamily="var(--font-mono)"
                >
                  {tick}
                </text>
              )}
            </g>
          )
        })}

        {/* Center content - Improved hierarchy and stability */}
        <g transform={`translate(${cx}, ${cy - 10})`}>
          <text
            textAnchor="middle"
            fill={color}
            fontSize="44"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            className="tabular-nums"
          >
            {displayValue}
          </text>
          <text
            y="22"
            textAnchor="middle"
            fill={color}
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            className="uppercase tracking-[0.2em] opacity-90"
          >
            {label}
          </text>
          <text
            y="42"
            textAnchor="middle"
            fill="currentColor"
            fontSize="8"
            fontWeight="700"
            className="text-muted-foreground/60 uppercase tracking-widest fill-current"
          >
            {t("scanner.risk")}
          </text>
        </g>
      </svg>
    </div>
  )
}

