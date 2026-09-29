import React, { useState, useEffect } from 'react'
import { Leaf, Mail, Lock, User, ChevronRight, MapPin, Phone, Globe } from 'lucide-react'
import { getPanchayats } from '../utils/api'

export default function AuthPage({ onLogin, t, lang, setLang }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('farmer')
  
  // Location state
  const [panchayatsList, setPanchayatsList] = useState([])
  const [selectedBlock, setSelectedBlock] = useState('')
  const [selectedPanchayat, setSelectedPanchayat] = useState('')

  useEffect(() => {
    getPanchayats().then(r => setPanchayatsList(r.data || []))
  }, [])

  const blocks = [...new Set(panchayatsList.map(p => p.block))]
  const filteredPanchayats = panchayatsList.filter(p => p.block === selectedBlock)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLogin) {
      if (email && password) onLogin({ email, name: 'Demo User', role: 'farmer' })
    } else {
      if (name && email && password && selectedPanchayat) {
        onLogin({ 
          email, 
          name, 
          role, 
          phone, 
          panchayatId: selectedPanchayat 
        })
      } else {
        alert("Please fill all required fields, including your Panchayat.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4 relative">
      
      {/* Top right language switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white shadow-sm border border-[#E2E8F0] rounded-full px-3 py-1.5">
        <Globe size={16} className="text-[#1B4332]" />
        <select 
          value={lang} 
          onChange={e => setLang(e.target.value)}
          className="bg-transparent text-sm font-semibold text-[#0F172A] outline-none cursor-pointer"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="gu">ગુજરાતી (Gujarati)</option>
        </select>
      </div>

      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'} bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E2E8F0] transition-all duration-300`}>
        
        <div className="bg-[#1B4332] p-6 text-center text-white">
          <div className="mx-auto bg-white/10 w-14 h-14 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
            <Leaf size={28} className="text-[#74C69D]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t('app_title')}</h2>
          <p className="text-[#95D5B2] text-xs mt-1">{t('app_subtitle')}</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex gap-4 border-b border-[#E2E8F0] mb-6">
            <button 
              onClick={() => setIsLogin(true)}
              className={`pb-3 text-sm font-bold flex-1 transition-colors border-b-2 ${isLogin ? 'border-[#1B4332] text-[#1B4332]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'}`}
            >
              {t('sign_in')}
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`pb-3 text-sm font-bold flex-1 transition-colors border-b-2 ${!isLogin ? 'border-[#1B4332] text-[#1B4332]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'}`}
            >
              {t('register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ---------------- LOGIN VIEW ---------------- */}
            {isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('phone')} / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                    <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]" placeholder="name@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- REGISTER VIEW ---------------- */}
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Personal Info */}
                <div className="space-y-4 md:border-r md:border-[#E2E8F0] md:pr-4">
                  <h3 className="font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Personal Details</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('full_name')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]" placeholder="E.g. Ramesh Bhai" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]" placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]" placeholder="••••••••" />
                    </div>
                  </div>
                  
                  {/* Reuse email field for registration as well */}
                  <div className="hidden">
                     <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4 md:pl-4">
                  <h3 className="font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Location & Role</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('role')}</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]">
                      <option value="farmer">Farmer (ખેડૂત)</option>
                      <option value="sarpanch">Gram Panchayat Official (સરપંચ)</option>
                      <option value="agronomist">Agronomist / Officer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('district')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input type="text" disabled value="Ahmedabad, Gujarat"
                        className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg bg-[#E2E8F0] text-[#64748B]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('block')}</label>
                    <select value={selectedBlock} onChange={e => {setSelectedBlock(e.target.value); setSelectedPanchayat('')}} required className="w-full p-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332]">
                      <option value="">-- Select Block --</option>
                      {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1">{t('panchayat')}</label>
                    <select value={selectedPanchayat} onChange={e => setSelectedPanchayat(e.target.value)} required disabled={!selectedBlock} className="w-full p-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:border-[#1B4332] disabled:opacity-50">
                      <option value="">-- Select Panchayat --</option>
                      {filteredPanchayats.map(p => <option key={p.panchayat_id} value={p.panchayat_id}>{p.name}</option>)}
                    </select>
                  </div>

                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-lg mt-6 hover:bg-[#143425] transition-colors flex items-center justify-center gap-2 shadow-md">
              {isLogin ? t('submit_login') : t('submit_register')}
              <ChevronRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
