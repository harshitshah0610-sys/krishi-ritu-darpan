import React, { useState, useEffect } from 'react'
import { getMetrics } from '../utils/api'
import { TrendingDown, Activity, RefreshCw, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const VARS = [
  { key: 'temperature', label: 'Temperature', unit: '°C' },
  { key: 'humidity',    label: 'Humidity',    unit: '%' },
  { key: 'rainfall',    label: 'Rainfall',    unit: 'mm' },
  { key: 'wind_speed',  label: 'Wind Speed',  unit: 'km/h' },
]

function MetricCard({ title, data, unit }) {
  if (!data) return <div className="skeleton h-64 rounded-xl" />
  
  const chartData = [
    { name: 'Raw Block', RMSE: data.rmse_raw },
    { name: 'Downscaled', RMSE: data.rmse_downscaled },
  ]
  
  const imp = data.pct_improvement_rmse || 0
  const isGood = imp > 0

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[#0F172A] font-bold text-lg">{title}</h3>
          <p className="text-[#64748B] text-sm mt-0.5">Root Mean Square Error</p>
        </div>
        <div className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm",
          isGood ? "bg-[#F0FDF4] text-[#15803D]" : "bg-[#F1F5F9] text-[#475569]"
        )}>
          {isGood ? <TrendingDown size={16} /> : <Activity size={16} />}
          {imp > 0 ? `+${imp.toFixed(1)}%` : `${imp.toFixed(1)}%`}
        </div>
      </div>
      
      <div className="flex-1 min-h-[160px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
            <Tooltip
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="RMSE" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <cell key={`cell-${index}`} fill={index === 0 ? '#94A3B8' : '#1B4332'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-4 border-t border-[#F1F5F9]">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Mean Abs. Error (MAE)</span>
          <span className="font-semibold text-[#0F172A]">
            {data.mae_raw.toFixed(2)} → {data.mae_downscaled.toFixed(2)} <span className="text-xs font-normal text-[#94A3B8]">{unit}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Accuracy() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = () => {
    setLoading(true); setError(false)
    getMetrics()
      .then(r => setMetrics(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] flex items-center gap-3">
            <BarChart2 className="text-[#1B4332]" size={28} />
            Model Accuracy Report
          </h1>
          <p className="text-[#64748B] mt-2 max-w-3xl leading-relaxed">
            Validation results comparing raw block-level ERA5-Land historical data against the Krishi Ritu Darpan 
            downscaling pipeline (Lapse-Rate Correction + IDW Interpolation + LightGBM ML).
          </p>
        </div>

        {error ? (
          <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] text-center max-w-lg mx-auto">
            <p className="text-[#64748B] mb-4">Failed to load accuracy metrics. The backend may still be processing holdout data.</p>
            <button onClick={loadData} className="inline-flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#143425] transition-colors">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {VARS.map(v => (
                <MetricCard 
                  key={v.key} 
                  title={v.label} 
                  unit={v.unit}
                  data={metrics?.[v.key]} 
                />
              ))}
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Downscaling Methodology</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-[#1B4332] text-sm mb-2">1. Elevation Correction</h4>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Applies standard environmental lapse rate (-6.5°C per 1000m) for temperature and orographic enhancement factors for rainfall based on high-resolution DEM data.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B4332] text-sm mb-2">2. Spatial IDW</h4>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Inverse Distance Weighting (power=2) triangulates the exact coordinates using the three nearest block centroid weather stations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B4332] text-sm mb-2">3. ML Bias Correction</h4>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    LightGBM models trained on 30+ days of historical holdout data correct residual non-linear biases in humidity and wind speed.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            {metrics && (
              <div className="text-center text-xs text-[#94A3B8]">
                Evaluated on {metrics.n_holdout_panchayats || 8} holdout panchayats over {metrics.holdout_days || 30} days. 
                Last computed: {new Date(metrics.computed_at).toLocaleString()}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
