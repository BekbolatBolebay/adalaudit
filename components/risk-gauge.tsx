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
  const displayValue = Number(value?.toFixed(1) || 0)
  const color = getRiskColor(displayValue)
  const label = getRiskLabel(displayValue, t)

  // Semi-circle gauge calculations 
  const radius = 80
  const strokeWidth = 14
  const cx = 100
  const cy = 105
  const startAngle = Math.PI + 0.35
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
    <div className="flex flex-col items-center select-none w-full py-4">
      <div className="relative w-full max-w-[300px] aspect-[1.5/1]">
        <svg viewBox="0 0 200 135" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <filter id="gauge-shadow-v2" x="-20%" y="-20%" width="140%" height="140%">
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

            <linearGradient id="premium-gradient-v2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getRiskColor(Math.max(0, displayValue - 30))} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d={bgPath}
            fill="none"
            stroke="currentColor"
            className="text-muted/10"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          {displayValue > 0 && (
            <path
              d={valuePath}
              fill="none"
              stroke="url(#premium-gradient-v2)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#gauge-shadow-v2)"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Ticks & Labels */}
          {ticks.map((tick) => {
            const angle = startAngle - (tick / 100) * totalAngle
            const innerR = radius - strokeWidth - 5
            const outerR = radius - strokeWidth + 1
            const x1 = cx + innerR * Math.cos(angle)
            const y1 = cy - innerR * Math.sin(angle)
            const x2 = cx + outerR * Math.cos(angle)
            const y2 = cy - outerR * Math.sin(angle)

            const labelR = radius + 22
            const lx = cx + labelR * Math.cos(angle)
            const ly = cy - labelR * Math.sin(angle)

            return (
              <g key={tick}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-muted-foreground/20"
                  strokeWidth="0.8"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground/50 font-sans font-bold"
                  style={{ fontSize: '7px' }}
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Center Score & Label */}
          <g transform={`translate(${cx}, ${cy - 12})`}>
            <text
              textAnchor="middle"
              className="font-sans font-black tracking-tight"
              style={{ fontSize: displayValue >= 100 ? '40px' : '48px', fill: color }}
            >
              {displayValue}
            </text>
            <text
              y="24"
              textAnchor="middle"
              className="fill-muted-foreground/60 font-sans font-bold uppercase tracking-[0.2em]"
              style={{ fontSize: '6.5px' }}
            >
              {t("scanner.risk")}
            </text>
            <text
              y="38"
              textAnchor="middle"
              className="font-sans font-black uppercase tracking-wider"
              style={{ fontSize: '11px', fill: color }}
            >
              {label}
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-4 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] pt-0.5">
          {label} ANALYSIS
        </span>
      </div>
    </div>
  )
}
