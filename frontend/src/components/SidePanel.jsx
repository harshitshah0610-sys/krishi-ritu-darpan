import React, { useState, useContext } from 'react'
import { X, Share2 } from 'lucide-react'
import clsx from 'clsx'
import ForecastCards from './ForecastCards'
import AlertBadges from './AlertBadges'
import AdvisoryCard from './AdvisoryCard'
import ComparisonChart from './ComparisonChart'
import { AppContext } from '../App'

const CROPS = [
  { id: 'cotton',    label: 'Cotton' },
  { id: 'wheat',     label: 'Wheat' },
  { id: 'bajra',     label: 'Bajra' },
  { id: 'groundnut', label: 'Groundnut' },
]

export default function SidePanel({
  panchayat, forecast, loading,
  crop, onCropChange,
  onClose
}) {
  const { lang, setLang, t } = useContext(AppContext)
  const [tab, setTab] = useState('forecast')

  if (!panchayat) return null

  function handleShare() {
    if (!forecast) return
    const text = forecast.advisory?.[lang] || forecast.advisory?.en || ''
    const msg = `Weather Advisory for ${panchayat.name}, ${panchayat.block} block:\n\n${text}\n\n- Krishi Ritu Darpan`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const currentCrop = crop || panchayat.primary_crop?.toLowerCase() || 'cotton'

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-start bg-[#F8FAFC]">
        <div>
          <h2 className="text-[22px] font-bold text-[#0F172A] leading-none mb-2">{panchayat.name}</h2>
          <div className="flex gap-2 items-center">
            <span className="px-2 py-0.5 bg-[#E2E8F0] text-[#475569] text-xs rounded font-medium">
              {panchayat.block} {lang === 'hi' ? 'ब्लॉक' : lang === 'gu' ? 'બ્લોક' : 'Block'}
            </span>
            <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide uppercase">
              {t('elevation')}: {panchayat.elevation || 60}m
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded transition">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] px-2 pt-2 bg-[#F8FAFC]">
        {[
          { key: 'forecast', label: lang === 'hi' ? 'पूर्वानुमान' : lang === 'gu' ? 'આગાહી' : 'Forecast' },
          { key: 'advisory', label: lang === 'hi' ? 'सलाह' : lang === 'gu' ? 'સલાહ' : 'Advisory' },
          { key: 'compare',  label: lang === 'hi' ? 'तुलना' : lang === 'gu' ? 'સરખામણી' : 'Compare' }
        ].map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              tab === tabItem.key
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-20 rounded-lg"></div>
            <div className="skeleton h-40 rounded-lg"></div>
            <div className="skeleton h-24 rounded-lg"></div>
          </div>
        ) : !forecast ? (
          <div className="h-full flex items-center justify-center text-[#94A3B8] text-sm">
            Data unavailable
          </div>
        ) : (
          <div className="space-y-6">
            {tab === 'forecast' && (
              <>
                <AlertBadges alerts={forecast.alerts} lang={lang} />
                <ForecastCards
                  downscaledForecast={forecast.downscaled_forecast}
                  blockForecast={forecast.block_forecast}
                />
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#CBD5E1] hover:border-[#1B4332] hover:text-[#1B4332] text-[#475569] font-medium rounded-md transition-colors shadow-sm text-sm"
                >
                  <Share2 size={16} /> Share Advisory
                </button>
              </>
            )}

            {tab === 'advisory' && (
              <>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg space-y-4 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Crop</span>
                    <div className="flex gap-1">
                      {CROPS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => onCropChange(c.id)}
                          className={clsx(
                            'px-2.5 py-1 rounded text-xs font-medium transition-colors border',
                            currentCrop === c.id
                              ? 'bg-[#1B4332] border-[#1B4332] text-white'
                              : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Language</span>
                    <div className="flex bg-[#E2E8F0] rounded p-0.5">
                      {['en', 'hi', 'gu'].map(l => (
                        <button
                          key={l}
                          onClick={() => onLangChange(l)}
                          className={clsx(
                            'px-3 py-1 rounded text-[11px] font-bold uppercase transition-colors',
                            lang === l ? 'bg-white text-[#1B4332] shadow-sm' : 'text-[#64748B]'
                          )}
                        >
                          {l === 'hi' ? 'हिंदी' : l === 'gu' ? 'ગુજ' : 'ENG'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <AdvisoryCard advisory={forecast.advisory} language={lang} onShare={handleShare} />

                <div className="mt-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                  <h4 className="text-[11px] font-bold text-[#166534] uppercase tracking-wide mb-1.5">Downscaling Details</h4>
                  <ul className="text-xs text-[#15803D] space-y-1 pl-4" style={{ listStyleType: 'square' }}>
                    <li>Elevation offset: {Math.abs(forecast.metadata?.elevation_diff || 0)}m {forecast.metadata?.elevation_diff > 0 ? 'above' : 'below'} block centroid</li>
                    <li>Lapse-rate applied for precise temperature adjustment</li>
                    <li>Spatial interpolation from nearest monitoring stations</li>
                  </ul>
                </div>
              </>
            )}

            {tab === 'compare' && (
              <ComparisonChart
                downscaledForecast={forecast.downscaled_forecast}
                blockForecast={forecast.block_forecast}
                panchayat={panchayat}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
