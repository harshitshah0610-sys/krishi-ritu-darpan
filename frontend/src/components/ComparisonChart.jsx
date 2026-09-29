import React from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>{p.name}:</span>
          <span>{p.value != null ? Number(p.value).toFixed(1) : 'N/A'}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComparisonChart({ downscaledForecast, blockForecast, panchayat }) {
  const dDates   = downscaledForecast?.daily?.date || []
  const dTempMax = downscaledForecast?.daily?.temp_max || []
  const dRain    = downscaledForecast?.daily?.rainfall_sum || []
  const bTempMax = blockForecast?.daily?.temperature_2m_max || []
  const bRain    = blockForecast?.daily?.precipitation_sum || []

  const chartData = dDates.map((date, i) => ({
    date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    'Block centroid': bTempMax[i] != null ? Number(Number(bTempMax[i]).toFixed(1)) : null,
    'Panchayat':      dTempMax[i] != null ? Number(Number(dTempMax[i]).toFixed(1)) : null,
    block_rain:       bRain[i]    != null ? Number(Number(bRain[i]).toFixed(2))    : null,
    panchayat_rain:   dRain[i]    != null ? Number(Number(dRain[i]).toFixed(2))    : null,
  }))

  const avgTempDiff = dTempMax.length
    ? dTempMax.reduce((s, v, i) => s + (v - (bTempMax[i] || v)), 0) / dTempMax.length
    : 0
  const pElev = panchayat?.elevation || 60

  if (!chartData.length) {
    return <div className="skeleton h-48 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Temperature — Daily Maximum (°C)
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} unit="°" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Block centroid" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            <Line type="monotone" dataKey="Panchayat"      stroke="#1B4332" strokeWidth={2}   dot={{ r: 3, fill: '#1B4332' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Rainfall — Daily Total (mm)
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} unit="mm" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="block_rain"     name="Block"     fill="#93C5FD" radius={[2,2,0,0]} />
            <Bar dataKey="panchayat_rain" name="Panchayat" fill="#1D4ED8" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
        On average, this panchayat is <strong style={{ color: '#1B4332' }}>{Math.abs(avgTempDiff).toFixed(2)}°C {avgTempDiff < 0 ? 'cooler' : 'warmer'}</strong> than
        its block centroid, due to its elevation of <strong>{pElev}m ASL</strong> and spatial interpolation across block stations.
        The lapse-rate correction applies <strong>−0.0065°C per metre</strong> of elevation gain.
      </div>
    </div>
  )
}
