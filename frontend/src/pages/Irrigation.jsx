import React, { useState, useContext, useEffect } from 'react'
import { Droplets, Thermometer, CloudRain, Sun, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { AppContext } from '../App'
import { getPanchayats, getForecast } from '../utils/api'

const CROP_ETc = {
  cotton: { name: 'Cotton', nameHi: 'कपास', nameGu: 'કপàस', kcMid: 1.15, depth: 600, depletionFactor: 0.65 },
  wheat: { name: 'Wheat', nameHi: 'गेहूं', nameGu: 'ઘઉं', kcMid: 1.10, depth: 500, depletionFactor: 0.55 },
  bajra: { name: 'Bajra', nameHi: 'बाजरा', nameGu: 'બàalmost', kcMid: 1.00, depth: 400, depletionFactor: 0.50 },
  groundnut: { name: 'Groundnut', nameHi: 'मूंगफली', nameGu: 'મãਗਫળàli', kcMid: 0.95, depth: 500, depletionFactor: 0.50 },
}

function computeET0(tMax, tMin, humidity, windSpeed) {
  // Simplified Hargreaves ET0 estimation
  const tMean = (tMax + tMin) / 2
  const Ra = 25 // approximate MJ/m2/day for Gujarat in typical season
  const et0 = 0.0023 * (tMean + 17.8) * Math.sqrt(tMax - tMin) * Ra * 0.408
  return Math.max(1.5, Math.min(et0, 8))
}

function getIrrigationSchedule(forecast, cropKey) {
  const crop = CROP_ETc[cropKey] || CROP_ETc.cotton
  const daily = forecast?.daily || {}
  const dates = daily.date || []
  const tempMax = daily.temp_max || []
  const tempMin = daily.temp_min || []
  const rain = daily.rainfall_sum || []

  let soilMoisture = 80 // % of field capacity — starts at 80%
  const schedule = []

  for (let i = 0; i < Math.min(7, dates.length); i++) {
    const tMax = tempMax[i] || 35
    const tMin = tempMin[i] || 22
    const rainfall = rain[i] || 0

    const et0 = computeET0(tMax, tMin, 60, 10)
    const etc = et0 * crop.kcMid
    const effectiveRain = Math.min(rainfall * 0.8, etc)
    const netDepletion = etc - effectiveRain

    soilMoisture = Math.min(100, soilMoisture - netDepletion * 1.5 + effectiveRain * 1.2)

    const threshold = crop.depletionFactor * 100
    const needsIrrigation = soilMoisture < threshold
    const amount = needsIrrigation ? Math.round((100 - soilMoisture) * crop.depth / 100) : 0

    if (needsIrrigation) soilMoisture = 90

    schedule.push({
      date: dates[i],
      et0: et0.toFixed(1),
      etc: etc.toFixed(1),
      rainfall: rainfall.toFixed(1),
      soilMoisture: Math.round(soilMoisture),
      needsIrrigation,
      amount,
    })
  }
  return schedule
}

export default function Irrigation() {
  const { lang } = useContext(AppContext)
  const [panchayats, setPanchayats] = useState([])
  const [selectedPid, setSelectedPid] = useState('')
  const [cropKey, setCropKey] = useState('cotton')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPanchayats().then(r => {
      const list = r.data || []
      setPanchayats(list)
      if (list.length) setSelectedPid(list[0].panchayat_id)
    })
  }, [])

  useEffect(() => {
    if (!selectedPid) return
    setLoading(true)
    getForecast(selectedPid, 7, cropKey).then(r => {
      setForecast(r.data)
    }).finally(() => setLoading(false))
  }, [selectedPid, cropKey])

  const schedule = forecast ? getIrrigationSchedule(forecast, cropKey) : []
  const totalWater = schedule.reduce((a, d) => a + d.amount, 0)
  const irrigationDays = schedule.filter(d => d.needsIrrigation).length

  const fmt = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#1B4332] p-3 rounded-lg">
            <Droplets className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {lang === 'hi' ? 'सिंचाई सलाहकार' : lang === 'gu' ? 'સิंচाઈ સлाहकার' : 'Irrigation Advisory'}
            </h1>
            <p className="text-[#64748B] text-sm">
              {lang === 'hi' ? 'ET0-आधारित 7-दिवसीय जल-प्रबंधन अनुसूची' :
               lang === 'gu' ? 'ET0-આधারित 7-दिवसीय जल-व्यवस्थापन अनुसूची' :
               'ET0-based 7-day precision water management schedule'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedPid}
            onChange={e => setSelectedPid(e.target.value)}
            className="flex-1 border border-[#CBD5E1] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#1B4332]"
          >
            {panchayats.map(p => <option key={p.panchayat_id} value={p.panchayat_id}>{p.name} ({p.block})</option>)}
          </select>
          <select
            value={cropKey}
            onChange={e => setCropKey(e.target.value)}
            className="border border-[#CBD5E1] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#1B4332]"
          >
            {Object.entries(CROP_ETc).map(([key, c]) => (
              <option key={key} value={key}>
                {lang === 'hi' ? c.nameHi : lang === 'gu' ? c.nameGu : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Advisory Banner */}
        {!loading && forecast?.advisory && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex gap-3">
            <AlertTriangle className="text-[#15803D] shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-[#14532D] text-sm mb-1">
                {lang === 'hi' ? 'कृषि मौसम सलाह' : lang === 'gu' ? 'કૃષિ હવામાન સલાહ' : 'Agro-Met Advisory'}
              </h3>
              <p className="text-sm text-[#16A34A] font-medium leading-relaxed">
                {forecast.advisory[lang] || forecast.advisory.en}
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {!loading && schedule.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center shadow-sm">
              <Calendar className="mx-auto text-[#1B4332] mb-2" size={22} />
              <div className="text-2xl font-black text-[#0F172A]">{irrigationDays}</div>
              <div className="text-xs text-[#64748B] font-medium mt-1">
                {lang === 'hi' ? 'सिंचाई दिवस' : lang === 'gu' ? 'સিंचाઈ дिवस' : 'Irrigation Days'}
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center shadow-sm">
              <Droplets className="mx-auto text-blue-500 mb-2" size={22} />
              <div className="text-2xl font-black text-[#0F172A]">{totalWater}</div>
              <div className="text-xs text-[#64748B] font-medium mt-1">
                {lang === 'hi' ? 'मिमी कुल जल' : lang === 'gu' ? 'mm કुल पाणी' : 'mm Total Water'}
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center shadow-sm">
              <Sun className="mx-auto text-amber-500 mb-2" size={22} />
              <div className="text-2xl font-black text-[#0F172A]">{schedule[0]?.et0}</div>
              <div className="text-xs text-[#64748B] font-medium mt-1">
                {lang === 'hi' ? 'mm/दिन ET₀ (आज)' : lang === 'gu' ? 'mm/day ET₀ (આ.) ' : 'mm/day ET₀ Today'}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-3 text-[#64748B]">
            <div className="w-8 h-8 border-4 border-[#E2E8F0] border-t-[#1B4332] rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Computing irrigation schedule...</p>
          </div>
        ) : schedule.length > 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-6 bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider">
              <div className="col-span-2">{lang === 'hi' ? 'तारीख' : lang === 'gu' ? 'तारीख' : 'Date'}</div>
              <div className="text-center">ET₀ (mm)</div>
              <div className="text-center">{lang === 'hi' ? 'वर्षा' : lang === 'gu' ? 'वर्षा' : 'Rain'} (mm)</div>
              <div className="text-center">{lang === 'hi' ? 'नमी %' : lang === 'gu' ? 'ભेज %' : 'Soil %'}</div>
              <div className="text-center">{lang === 'hi' ? 'सिंचाई' : lang === 'gu' ? 'સिंचाई' : 'Irrigate'}</div>
            </div>

            {schedule.map((day, i) => (
              <div key={i} className={`grid grid-cols-6 items-center px-5 py-4 border-b border-[#F1F5F9] ${day.needsIrrigation ? 'bg-blue-50' : ''}`}>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-[#0F172A]">{fmt(day.date)}</p>
                  <p className="text-xs text-[#64748B]">ETc: {day.etc} mm</p>
                </div>
                <div className="text-center text-sm font-medium text-[#374151]">{day.et0}</div>
                <div className="text-center text-sm font-medium text-blue-600">{day.rainfall}</div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1">
                    <div className="w-12 bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${day.soilMoisture > 65 ? 'bg-green-500' : day.soilMoisture > 45 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${day.soilMoisture}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-[#374151]">{day.soilMoisture}%</span>
                  </div>
                </div>
                <div className="text-center">
                  {day.needsIrrigation ? (
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      <Droplets size={10} /> {day.amount}mm
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                      <CheckCircle2 size={13}/> OK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
            <Clock size={32} className="mx-auto mb-3 text-[#CBD5E1]" />
            <p className="text-sm">Select a panchayat to generate irrigation schedule</p>
          </div>
        )}

        {/* Method note */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4 text-xs text-[#15803D] flex gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            {lang === 'hi'
              ? 'यह Hargreaves ET₀ + FAO-56 Kc विधि पर आधारित है। वास्तविक सिंचाई मिट्टी के प्रकार और फसल वृद्धि चरण के अनुसार समायोजित करें।'
              : lang === 'gu'
              ? 'Hargreaves ET₀ + FAO-56 Kc पद्धति पर आधारित. वास्तविक सिंचाई जमीन के प्रकार अनुसार समायोजित करો.'
              : 'Based on Hargreaves ET₀ + FAO-56 crop coefficient method. Adjust actual irrigation based on soil type and crop growth stage.'}
          </span>
        </div>

      </div>
    </div>
  )
}
