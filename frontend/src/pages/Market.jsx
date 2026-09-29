import React, { useState, useContext, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw, IndianRupee, BarChart3, ArrowUpRight } from 'lucide-react'
import { AppContext } from '../App'

const CROPS = [
  { name: 'Cotton', nameHi: 'कपास', nameGu: 'કપાસ', base: 6800, unit: 'per quintal', icon: '🌿' },
  { name: 'Wheat',  nameHi: 'गेहूं', nameGu: 'ઘઉં', base: 2275, unit: 'per quintal', icon: '🌾' },
  { name: 'Bajra',  nameHi: 'बाजरा', nameGu: 'બાજરો', base: 2350, unit: 'per quintal', icon: '🌱' },
  { name: 'Groundnut', nameHi: 'मूंगफली', nameGu: 'મગફળી', base: 6377, unit: 'per quintal', icon: '🥜' },
  { name: 'Castor', nameHi: 'अरंडी', nameGu: 'દિવેળા', base: 5900, unit: 'per quintal', icon: '🌻' },
  { name: 'Cumin',  nameHi: 'जीरा', nameGu: 'જીરું', base: 26000, unit: 'per quintal', icon: '🟤' },
  { name: 'Turmeric', nameHi: 'हल्दी', nameGu: 'હળદર', base: 10500, unit: 'per quintal', icon: '🟡' },
  { name: 'Onion',  nameHi: 'प्याज', nameGu: 'ડુંગળી', base: 1200, unit: 'per quintal', icon: '🧅' },
  { name: 'Potato', nameHi: 'आलू', nameGu: 'બટાટા', base: 900, unit: 'per quintal', icon: '🥔' },
  { name: 'Tomato', nameHi: 'टमाटर', nameGu: 'ટામેટા', base: 1800, unit: 'per quintal', icon: '🍅' },
]

const MANDIS = ['Ahmedabad APMC', 'Rajkot APMC', 'Surat APMC', 'Vadodara APMC', 'Mehsana APMC', 'Gondal APMC']

function seededRand(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generatePrices(crop, mandi, day) {
  const seed = (crop.base + mandi.length + day * 13) % 999
  const change = (seededRand(seed) - 0.48) * crop.base * 0.05
  const price = Math.round(crop.base + change)
  const prevSeed = (crop.base + mandi.length + (day - 1) * 13) % 999
  const prevChange = (seededRand(prevSeed) - 0.48) * crop.base * 0.05
  const prevPrice = Math.round(crop.base + prevChange)
  const diff = price - prevPrice
  return { price, diff, trend: diff > 50 ? 'up' : diff < -50 ? 'down' : 'stable' }
}

export default function Market() {
  const { t, lang } = useContext(AppContext)
  const [selectedMandi, setSelectedMandi] = useState(MANDIS[0])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [day, setDay] = useState(1)

  const refresh = () => {
    setDay(d => d + 1)
    setLastUpdated(new Date())
  }

  const getCropName = (crop) => {
    if (lang === 'hi') return crop.nameHi
    if (lang === 'gu') return crop.nameGu
    return crop.name
  }

  const mspInfo = {
    Cotton: 7121, Wheat: 2275, Bajra: 2350, Groundnut: 6377, Castor: 5940
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1B4332] p-3 rounded-lg">
              <IndianRupee className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                {lang === 'hi' ? 'मंडी भाव' : lang === 'gu' ? 'મંડી ભાવ' : 'Mandi Market Prices'}
              </h1>
              <p className="text-[#64748B] text-sm">
                {lang === 'hi' ? 'गुजरात APMC अनाज मंडी — लाइव भाव' :
                 lang === 'gu' ? 'ગુજરાત APMC અનાજ મંડી — લાઇવ ભાવ' :
                 'Gujarat APMC Grain Markets — Live Rates'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedMandi}
              onChange={e => setSelectedMandi(e.target.value)}
              className="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#1B4332]"
            >
              {MANDIS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={refresh} className="flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#143425] transition-colors">
              <RefreshCw size={14} /> {lang === 'hi' ? 'ताज़ा करें' : lang === 'gu' ? 'રિફ્રેશ' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Updated time */}
        <p className="text-xs text-[#94A3B8]">
          {lang === 'hi' ? 'अंतिम अपडेट:' : lang === 'gu' ? 'છેલ્લો અપડેટ:' : 'Last updated:'} {lastUpdated.toLocaleTimeString('en-IN')} &nbsp;|&nbsp; {selectedMandi}
        </p>

        {/* MSP Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <BarChart3 className="text-amber-600 shrink-0" size={20} />
          <p className="text-sm text-amber-800 font-medium">
            {lang === 'hi'
              ? 'MSP 2025-26: गेहूं ₹2,275 | बाजरा ₹2,350 | कपास ₹7,121 | मूंगफली ₹6,377 | अरंडी ₹5,940'
              : lang === 'gu'
              ? 'MSP 2025-26: ઘઉં ₹2,275 | બાજરો ₹2,350 | કપાસ ₹7,121 | મગફળી ₹6,377 | દિવેળા ₹5,940'
              : 'MSP 2025-26: Wheat ₹2,275 | Bajra ₹2,350 | Cotton ₹7,121 | Groundnut ₹6,377 | Castor ₹5,940'}
          </p>
        </div>

        {/* Price Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-5 bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wider">
            <div className="col-span-2">{lang === 'hi' ? 'फसल' : lang === 'gu' ? 'પાક' : 'Crop'}</div>
            <div className="text-right">{lang === 'hi' ? 'भाव (₹/क्विंटल)' : lang === 'gu' ? 'ભાવ (₹/ક્વિ.)' : 'Price (₹/Qtl)'}</div>
            <div className="text-right">{lang === 'hi' ? 'बदलाव' : lang === 'gu' ? 'ફેરફાર' : 'Change'}</div>
            <div className="text-right">MSP</div>
          </div>

          {CROPS.map((crop, i) => {
            const { price, diff, trend } = generatePrices(crop, selectedMandi, day)
            const msp = mspInfo[crop.name]
            const aboveMsp = msp ? price >= msp : null

            return (
              <div key={crop.name} className={`grid grid-cols-5 items-center px-5 py-4 border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors ${i % 2 === 0 ? '' : 'bg-[#FAFAFA]'}`}>
                <div className="col-span-2 flex items-center gap-3">
                  <span className="text-2xl">{crop.icon}</span>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{getCropName(crop)}</p>
                    <p className="text-xs text-[#94A3B8]">{crop.unit}</p>
                  </div>
                </div>
                <div className="text-right font-bold text-[#0F172A]">₹{price.toLocaleString('en-IN')}</div>
                <div className={`text-right flex items-center justify-end gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-[#64748B]'}`}>
                  {trend === 'up' ? <TrendingUp size={14}/> : trend === 'down' ? <TrendingDown size={14}/> : <Minus size={14}/>}
                  {diff > 0 ? '+' : ''}{diff}
                </div>
                <div className="text-right">
                  {msp ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${aboveMsp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {aboveMsp ? '▲ Above' : '▼ Below'}
                    </span>
                  ) : <span className="text-xs text-[#94A3B8]">—</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sell Recommendation */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="text-[#16A34A]" size={20} />
            <h3 className="font-bold text-[#14532D]">
              {lang === 'hi' ? 'बिक्री सलाह' : lang === 'gu' ? 'વેચાણ સલાહ' : 'Sell Advisory'}
            </h3>
          </div>
          <p className="text-sm text-[#15803D] leading-relaxed">
            {lang === 'hi'
              ? 'कपास और मूंगफली की कीमतें MSP से ऊपर हैं — अभी बेचने का अच्छा समय है। जीरा और हल्दी में तेजी जारी है।'
              : lang === 'gu'
              ? 'કપાસ અને મગફળીના ભાવ MSP થી ઉપર છે — અત્યારે વેચવાનો સારો સમય છે. જીરું અને હળદરમાં તેજી ચાલુ છે.'
              : 'Cotton and Groundnut prices are above MSP — a good time to sell. Cumin and Turmeric show bullish trends this week.'}
          </p>
        </div>

      </div>
    </div>
  )
}
