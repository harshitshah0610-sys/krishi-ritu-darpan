import React, { useContext } from 'react'
import { User, MapPin, Wheat, Phone, Mail, LogOut, Shield, Star, Activity } from 'lucide-react'
import { AppContext } from '../App'

export default function Profile({ user, onLogout }) {
  const { lang, t } = useContext(AppContext)

  const roleLabel = {
    farmer: { en: 'Farmer', hi: 'किसान', gu: 'ખेDUTO' },
    sarpanch: { en: 'Sarpanch / GP Official', hi: 'सरपंच', gu: 'સरпंच' },
    agronomist: { en: 'Agronomist', hi: 'कृषि वैज्ञानिक', gu: 'Agronomist' },
  }

  const getRoleLabel = () => {
    const r = user?.role || 'farmer'
    return roleLabel[r]?.[lang] || roleLabel[r]?.en || 'Farmer'
  }

  const stats = [
    { label: lang === 'hi' ? 'मौसम पूर्वानुमान' : lang === 'gu' ? 'હवামàn Forecasts' : 'Weather Forecasts', value: '7', unit: 'days', icon: <Activity size={18} className="text-[#1B4332]" /> },
    { label: lang === 'hi' ? 'AI निदान' : lang === 'gu' ? 'AI Diagnoses' : 'AI Diagnoses', value: '38', unit: 'diseases', icon: <Star size={18} className="text-amber-500" /> },
    { label: lang === 'hi' ? 'ग्राम पंचायत' : lang === 'gu' ? 'Panchayats' : 'Panchayats', value: '60', unit: 'covered', icon: <MapPin size={18} className="text-blue-500" /> },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">{user?.name || 'Demo User'}</h2>
            <p className="text-[#95D5B2] text-sm mt-1">{user?.email || 'farmer@example.com'}</p>
            <span className="inline-block mt-3 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              <Shield size={10} className="inline mr-1" /> {getRoleLabel()}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm uppercase tracking-wider text-[#64748B]">
              {lang === 'hi' ? 'व्यक्तिगत जानकारी' : lang === 'gu' ? 'Personal Info' : 'Personal Information'}
            </h3>

            <div className="space-y-3">
              {user?.phone && (
                <div className="flex items-center gap-3 py-2 border-b border-[#F1F5F9]">
                  <Phone size={16} className="text-[#94A3B8]" />
                  <div>
                    <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wide">{t('phone')}</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 py-2 border-b border-[#F1F5F9]">
                <Mail size={16} className="text-[#94A3B8]" />
                <div>
                  <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{user?.email || 'farmer@example.com'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-[#F1F5F9]">
                <MapPin size={16} className="text-[#94A3B8]" />
                <div>
                  <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wide">{t('district')}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">Ahmedabad, Gujarat</p>
                </div>
              </div>
              {user?.panchayatId && (
                <div className="flex items-center gap-3 py-2">
                  <Wheat size={16} className="text-[#94A3B8]" />
                  <div>
                    <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wide">{t('panchayat')}</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{user.panchayatId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div>
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-3">
            {lang === 'hi' ? 'प्लेटफॉर्म आँकड़े' : lang === 'gu' ? 'Platform Stats' : 'Platform Stats'}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center shadow-sm">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <div className="text-2xl font-black text-[#0F172A]">{s.value}</div>
                <div className="text-xs text-[#64748B] leading-tight mt-1">{s.unit}</div>
                <div className="text-xs font-medium text-[#94A3B8] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-[#0F172A] text-sm">About Krishi Ritu Darpan</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            An AI-powered hyperlocal weather downscaling system for Gram Panchayats, providing block-to-village level precision forecasting, crop disease/pest detection, irrigation advisory, and government scheme access — built for Smart India Hackathon 2025.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['FastAPI + LightGBM', 'EfficientNet B0', 'ET₀ FAO-56', 'Open-Meteo', 'React + Leaflet'].map(t => (
              <span key={t} className="bg-[#F1F5F9] text-[#475569] text-xs font-medium px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          {t('logout')}
        </button>

      </div>
    </div>
  )
}
