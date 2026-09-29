import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, Menu, X, Globe, User } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Accuracy from './pages/Accuracy'
import AdminHub from './pages/AdminHub'
import Sowing from './pages/Sowing'
import Diagnostics from './pages/Diagnostics'
import AuthPage from './pages/AuthPage'
import Market from './pages/Market'
import Schemes from './pages/Schemes'
import Irrigation from './pages/Irrigation'
import Profile from './pages/Profile'
import Guide from './pages/Guide'
import Monsoon from './pages/Monsoon'
import { translations } from './utils/translations'

export const AppContext = React.createContext()

function Header({ lang, setLang, user, onLogout, t }) {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }) =>
    `px-2 py-1 text-[13px] font-medium rounded transition-all whitespace-nowrap ${
      isActive ? 'bg-white/15 text-white' : 'text-[#95D5B2] hover:text-white hover:bg-white/8'
    }`
    
  return (
    <header className="bg-[#1B4332] text-white z-50 relative" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-[#74C69D]" strokeWidth={2} />
          <div className="flex flex-col justify-center">
            <span className="font-semibold text-sm tracking-tight leading-tight">{t('app_title')}</span>
            <span className="hidden lg:block text-[#74C69D] text-[10px] leading-tight">{t('app_subtitle')}</span>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 mx-2 overflow-x-auto no-scrollbar">
          <NavLink to="/" end className={linkClass}>{t('dashboard')}</NavLink>
          <NavLink to="/sowing" className={linkClass}>{t('sowing_planner')}</NavLink>
          <NavLink to="/irrigation" className={linkClass}>{t('irrigation')}</NavLink>
          <NavLink to="/monsoon" className={linkClass}>{t('monsoon_prediction')}</NavLink>
          <NavLink to="/diagnostics" className={linkClass}>{t('ai_diagnostics')}</NavLink>
          <NavLink to="/market" className={linkClass}>{t('market')}</NavLink>
          <NavLink to="/schemes" className={linkClass}>{t('schemes')}</NavLink>
          <NavLink to="/admin" className={linkClass}>{t('admin_hub')}</NavLink>
          <NavLink to="/accuracy" className={linkClass}>{t('model_accuracy')}</NavLink>
          <NavLink to="/guide" className={linkClass}>{t('user_guide')}</NavLink>
        </nav>
        
        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/10 rounded px-2 py-1">
            <Globe size={14} className="text-[#95D5B2]" />
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-white outline-none appearance-none cursor-pointer"
            >
              <option value="en" className="text-black">EN</option>
              <option value="hi" className="text-black">हिन्दी</option>
              <option value="gu" className="text-black">ગુજ</option>
            </select>
          </div>
          
          <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-[#95D5B2] hover:text-white'}`}>
            <User size={16} />
            <span className="text-[13px] font-medium max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
          </NavLink>
        </div>

        <button className="lg:hidden p-1.5 rounded hover:bg-white/10 transition" onClick={() => setOpen(!open)}>
          {open ? <X size={18}/> : <Menu size={18}/>}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1.5 max-h-[80vh] overflow-y-auto">
          <NavLink to="/" end className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('dashboard')}</NavLink>
          <NavLink to="/sowing" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('sowing_planner')}</NavLink>
          <NavLink to="/irrigation" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('irrigation')}</NavLink>
          <NavLink to="/monsoon" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('monsoon_prediction')}</NavLink>
          <NavLink to="/diagnostics" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('ai_diagnostics')}</NavLink>
          <NavLink to="/market" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('market')}</NavLink>
          <NavLink to="/schemes" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('schemes')}</NavLink>
          <NavLink to="/admin" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('admin_hub')}</NavLink>
          <NavLink to="/accuracy" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('model_accuracy')}</NavLink>
          <NavLink to="/guide" className="block px-3 py-2 text-sm text-[#95D5B2] hover:text-white rounded" onClick={() => setOpen(false)}>{t('user_guide')}</NavLink>
          
          <div className="border-t border-white/10 mt-2 pt-3 flex justify-between items-center px-2">
            <select value={lang} onChange={e => setLang(e.target.value)} className="bg-white/10 rounded px-2 py-1.5 text-sm text-white outline-none">
              <option value="en" className="text-black">English</option>
              <option value="hi" className="text-black">हिंदी</option>
              <option value="gu" className="text-black">ગુજરાતી</option>
            </select>
            <NavLink to="/profile" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded text-sm text-white" onClick={() => setOpen(false)}>
              <User size={14}/> {t('profile')}
            </NavLink>
          </div>
        </div>
      )}
    </header>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [lang, setLang] = useState('en')

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  }

  if (!user) {
    return (
      <AppContext.Provider value={{ lang, setLang, t }}>
        <AuthPage onLogin={setUser} t={t} lang={lang} setLang={setLang} />
      </AppContext.Provider>
    )
  }

  return (
    <AppContext.Provider value={{ lang, setLang, t }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
          <Header lang={lang} setLang={setLang} user={user} onLogout={() => setUser(null)} t={t} />
          <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sowing" element={<Sowing />} />
              <Route path="/irrigation" element={<Irrigation />} />
              <Route path="/monsoon" element={<Monsoon />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/market" element={<Market />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/admin" element={<AdminHub />} />
              <Route path="/accuracy" element={<Accuracy />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/profile" element={<Profile user={user} onLogout={() => setUser(null)} />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
