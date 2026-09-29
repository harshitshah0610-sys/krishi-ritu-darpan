import React from 'react'
import { Sun, Cloud, CloudRain, CloudLightning, Thermometer, Droplets, Wind } from 'lucide-react'

function getWeatherIcon(rain, tempMax) {
  if (rain > 15) return { Icon: CloudLightning, color: '#7C3AED' }
  if (rain > 2)  return { Icon: CloudRain,      color: '#2563EB' }
  if (tempMax > 37) return { Icon: Sun,          color: '#D97706' }
  return             { Icon: Cloud,              color: '#64748B' }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDay(dateStr, index) {
  if (index === 0) return 'Today'
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' })
}

export default function ForecastCards({ downscaledForecast, blockForecast }) {
  const daily = downscaledForecast?.daily || {}
  const blockDaily = blockForecast?.daily || {}
  const dates = daily.date || []

  if (!dates.length) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton min-w-[120px] h-40 rounded-lg shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {dates.map((date, i) => {
        const tempMax  = daily.temp_max?.[i] ?? '--'
        const tempMin  = daily.temp_min?.[i] ?? '--'
        const rain     = daily.rainfall_sum?.[i] ?? 0
        const wind     = daily.wind_max?.[i] ?? '--'
        const humidity = daily.humidity_avg?.[i] ?? '--'
        const blockTempMax = blockDaily.temperature_2m_max?.[i] ?? null
        const tempDiff = blockTempMax != null && tempMax !== '--' ? (tempMax - blockTempMax) : null
        const { Icon, color } = getWeatherIcon(rain, tempMax)

        const rainBarWidth = Math.min(100, (rain / 30) * 100)
        const isHot  = tempMax > 37
        const isRainy = rain > 10

        return (
          <div
            key={date}
            className="shrink-0 min-w-[128px] rounded-lg border p-3 flex flex-col gap-1 cursor-default transition-all hover:shadow-md hover:border-[#40916C]/40"
            style={{
              background: isHot ? '#FFF7ED' : isRainy ? '#EFF6FF' : '#FFFFFF',
              borderColor: isHot ? '#FED7AA' : isRainy ? '#BFDBFE' : '#E2E8F0',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{formatDay(date, i)}</div>
                <div style={{ fontSize: 10, color: '#94A3B8' }}>{formatDate(date)}</div>
              </div>
              <Icon size={20} color={color} strokeWidth={1.8} />
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', lineHeight: 1 }}>
                {tempMax !== '--' ? Number(tempMax).toFixed(1) : '--'}
              </span>
              <span style={{ fontSize: 11, color: '#64748B' }}>°C</span>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              {tempMin !== '--' ? `${Number(tempMin).toFixed(1)}° min` : ''}
            </div>

            {tempDiff !== null && Math.abs(tempDiff) >= 0.2 && (
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '1px 5px',
                borderRadius: 3, background: tempDiff < 0 ? '#DBEAFE' : '#FEE2E2',
                color: tempDiff < 0 ? '#1D4ED8' : '#B91C1C', alignSelf: 'flex-start'
              }}>
                {tempDiff > 0 ? '+' : ''}{tempDiff.toFixed(1)}° vs block
              </span>
            )}

            <div className="mt-1.5">
              <div className="flex justify-between mb-0.5">
                <span style={{ fontSize: 10, color: '#64748B' }}>Rain</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#2563EB' }}>{Number(rain).toFixed(1)} mm</span>
              </div>
              <div style={{ height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rainBarWidth}%`, background: '#3B82F6', borderRadius: 2 }} />
              </div>
            </div>

            <div className="flex justify-between mt-1">
              <div className="flex items-center gap-0.5">
                <Droplets size={10} color="#64748B" />
                <span style={{ fontSize: 10, color: '#64748B' }}>{humidity !== '--' ? `${Math.round(humidity)}%` : '--'}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Wind size={10} color="#64748B" />
                <span style={{ fontSize: 10, color: '#64748B' }}>{wind !== '--' ? `${Number(wind).toFixed(0)}` : '--'}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
