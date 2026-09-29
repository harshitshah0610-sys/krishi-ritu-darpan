import React, { useState, useEffect, useContext } from 'react'
import { Sprout, Calendar, Droplets, ThermometerSun, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getPanchayats, getForecast } from '../utils/api'
import clsx from 'clsx'
import { AppContext } from '../App'

export default function SowingPlanner() {
  const { t, lang } = useContext(AppContext)
  const [panchayats, setPanchayats] = useState([])
  const [selectedPid, setSelectedPid] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPanchayats().then(r => setPanchayats(r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedPid) { setForecast(null); return }
    setLoading(true)
    getForecast(selectedPid, 7).then(r => setForecast(r.data)).finally(() => setLoading(false))
  }, [selectedPid])

  const analyzeSowing = (fc) => {
    if (!fc) return null
    const daily = fc.downscaled_forecast?.daily || {}
    const tempMax = daily.temp_max || []
    const rain = daily.rainfall_sum || []
    
    // Logic: Look at next 3 days
    const next3Temp = tempMax.slice(0, 3)
    const next3Rain = rain.slice(0, 3)
    
    const avgTemp = next3Temp.reduce((a,b)=>a+b,0) / (next3Temp.length||1)
    const totalRain = next3Rain.reduce((a,b)=>a+b,0)

    let score = 100
    let tempMsg = "Temperature is optimal for germination."
    let rainMsg = "Sufficient moisture without flooding risk."
    
    // Temp checks (assume Cotton/Kharif ideal is 25-32)
    if (avgTemp > 35) { score -= 40; tempMsg = "Too hot for ideal germination. High risk of seed mortality." }
    else if (avgTemp < 20) { score -= 30; tempMsg = "Too cold, germination will be severely delayed." }

    // Rain checks
    if (totalRain > 50) { score -= 50; rainMsg = "Heavy rain expected. Seeds may wash away or rot." }
    else if (totalRain < 2) { score -= 20; rainMsg = "Dry conditions. Assured irrigation will be required immediately." }

    score = Math.max(0, score)
    let overall = score > 75 ? 'GO' : score > 40 ? 'CAUTION' : 'STOP'
    
    return { score, overall, avgTemp, totalRain, tempMsg, rainMsg }
  }

  const analysis = analyzeSowing(forecast)
  const crop = forecast?.panchayat?.primary_crop || 'Cotton'

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#1B4332] p-3 rounded-lg"><Sprout className="text-white" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{t('sowing_intelligence')}</h1>
            <p className="text-[#64748B] text-sm">Determine the exact 3-day sowing window based on hyperlocal downscaled weather</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-[#475569] mb-2 uppercase tracking-wide">Select your Panchayat</label>
          <select 
            className="w-full md:w-1/2 p-2.5 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] outline-none focus:border-[#1B4332]"
            value={selectedPid}
            onChange={(e) => setSelectedPid(e.target.value)}
          >
            <option value="">-- Choose Panchayat --</option>
            {panchayats.map(p => <option key={p.panchayat_id} value={p.panchayat_id}>{p.name}</option>)}
          </select>
        </div>

        {loading && <div className="skeleton h-64 rounded-xl" />}

        {analysis && !loading && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
            
            <div className="flex flex-col md:flex-row gap-8 items-center border-b border-[#E2E8F0] pb-6 mb-6">
              
              {/* Score Circle */}
              <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle cx="80" cy="80" r="70" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                  <circle cx="80" cy="80" r="70" stroke={analysis.score > 75 ? '#16A34A' : analysis.score > 40 ? '#D97706' : '#DC2626'} 
                          strokeWidth="12" fill="none" strokeDasharray="440" 
                          strokeDashoffset={440 - (440 * analysis.score) / 100} 
                          className="transition-all duration-1000" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-black text-[#0F172A]">{analysis.score}%</div>
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Suitability</div>
                </div>
              </div>

              {/* Recommendation Text */}
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-2 capitalize">Target Crop: {crop}</h2>
                <div className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-sm mb-3 uppercase tracking-wide",
                  analysis.overall === 'GO' ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]" :
                  analysis.overall === 'CAUTION' ? "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]" :
                  "bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]"
                )}>
                  {analysis.overall === 'GO' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                  Recommendation: {analysis.overall}
                </div>
                <p className="text-[#475569] text-sm leading-relaxed">
                  Based on the hyperlocal 3-day downscaled forecast for {forecast.panchayat.name}, 
                  we evaluated the temperature and moisture indices for optimal {crop} germination.
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg flex gap-4 items-start">
                <ThermometerSun className="text-[#D97706] mt-1 shrink-0" size={24} />
                <div>
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Temperature Index</div>
                  <div className="text-lg font-bold text-[#0F172A] mb-1">{analysis.avgTemp.toFixed(1)}°C <span className="text-xs font-normal text-[#64748B]">(3-day avg max)</span></div>
                  <div className="text-sm text-[#475569]">{analysis.tempMsg}</div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg flex gap-4 items-start">
                <Droplets className="text-[#2563EB] mt-1 shrink-0" size={24} />
                <div>
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Moisture Index</div>
                  <div className="text-lg font-bold text-[#0F172A] mb-1">{analysis.totalRain.toFixed(1)} mm <span className="text-xs font-normal text-[#64748B]">(72hr accum.)</span></div>
                  <div className="text-sm text-[#475569]">{analysis.rainMsg}</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
