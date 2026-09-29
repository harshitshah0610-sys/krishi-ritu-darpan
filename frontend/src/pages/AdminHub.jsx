import React, { useState, useEffect } from 'react'
import { Megaphone, Users, AlertTriangle, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { getPanchayats, getForecast } from '../utils/api'
import clsx from 'clsx'

export default function AdminHub() {
  const [panchayats, setPanchayats] = useState([])
  const [selectedPid, setSelectedPid] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    getPanchayats().then(r => setPanchayats(r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedPid) { setForecast(null); return }
    setLoading(true)
    setSent(false)
    getForecast(selectedPid, 7).then(r => setForecast(r.data)).finally(() => setLoading(false))
  }, [selectedPid])

  const selectedGp = panchayats.find(p => p.panchayat_id === selectedPid)
  const alerts = forecast?.alerts || []
  const hasAlerts = alerts.length > 0

  const handleBroadcast = () => {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    
    // In a real app, this would hit an SMS API. For now, open WhatsApp.
    const text = forecast?.advisory?.gu || forecast?.advisory?.hi || forecast?.advisory?.en
    const msg = `⚠️ *ગ્રામ પંચાયત ચેતવણી: ${selectedGp?.name}*\n\n${text}\n\n- સરપંચ કાર્યાલય, ${selectedGp?.name}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#1B4332] p-3 rounded-lg"><Megaphone className="text-white" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Gram Panchayat Admin Hub</h1>
            <p className="text-[#64748B] text-sm">One-click localized broadcast system for Sarpanch & GP Officials</p>
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
            {panchayats.map(p => <option key={p.panchayat_id} value={p.panchayat_id}>{p.name} ({p.block} Block)</option>)}
          </select>
        </div>

        {loading && <div className="skeleton h-64 rounded-xl" />}

        {forecast && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Alert Status Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className={clsx("p-4 border-b", hasAlerts ? "bg-[#FEF2F2] border-[#FCA5A5]" : "bg-[#F0FDF4] border-[#BBF7D0]")}>
                <div className="flex items-center gap-2">
                  {hasAlerts ? <AlertTriangle className="text-[#DC2626]" size={20} /> : <CheckCircle2 className="text-[#16A34A]" size={20} />}
                  <h2 className={clsx("font-bold", hasAlerts ? "text-[#991B1B]" : "text-[#15803D]")}>
                    {hasAlerts ? "Active Weather Threats Detected" : "Weather is Stable"}
                  </h2>
                </div>
              </div>
              <div className="p-5 flex-1">
                {hasAlerts ? (
                  <div className="space-y-3">
                    {alerts.map((a, i) => (
                      <div key={i} className="p-3 bg-[#FFF7ED] border border-[#FDC784] rounded-lg">
                        <div className="font-bold text-[#92400E] text-sm capitalize mb-1">{a.type.replace('_',' ')}</div>
                        <div className="text-[#78350F] text-xs leading-relaxed font-['Noto_Sans_Gujarati']">{a.message_gu || a.message_en}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#64748B] text-sm leading-relaxed">No extreme weather events (heatwaves, heavy rain, or high winds) are predicted for {selectedGp.name} in the next 7 days.</p>
                )}
              </div>
            </div>

            {/* Broadcast Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col">
              <h2 className="font-bold text-[#0F172A] flex items-center gap-2 mb-4">
                <MessageSquare className="text-[#40916C]" size={20} /> Mass Broadcast (Gujarati)
              </h2>
              
              <div className="flex items-center gap-4 mb-4 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                <Users className="text-[#64748B]" size={24} />
                <div>
                  <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wide">Registered Farmers</div>
                  <div className="text-xl font-bold text-[#1B4332]">450+</div>
                </div>
              </div>

              <div className="flex-1 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg p-4 mb-4 relative">
                <div className="absolute top-2 right-3 text-[10px] font-bold text-[#94A3B8] uppercase">Preview</div>
                <p className="text-sm text-[#0F172A] font-['Noto_Sans_Gujarati'] whitespace-pre-wrap leading-relaxed mt-2">
                  ⚠️ *ગ્રામ પંચાયત ચેતવણી: {selectedGp.name}*<br/><br/>
                  {forecast.advisory?.gu || forecast.advisory?.en}<br/><br/>
                  - સરપંચ કાર્યાલય, {selectedGp.name}
                </p>
              </div>

              <button 
                onClick={handleBroadcast}
                disabled={sent}
                className={clsx(
                  "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors",
                  sent ? "bg-[#16A34A] text-white" : "bg-[#1B4332] text-white hover:bg-[#143425]"
                )}
              >
                {sent ? <><CheckCircle2 size={18} /> Broadcast Sent</> : <><Send size={18} /> Send to GP WhatsApp Group</>}
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
