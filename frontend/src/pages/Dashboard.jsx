import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Thermometer, CloudRain, Droplets, Wind } from 'lucide-react'
import { getPanchayats, getForecast, getMapData } from '../utils/api'
import MapView from '../components/Map'
import SidePanel from '../components/SidePanel'
import SearchBox from '../components/SearchBox'
import clsx from 'clsx'
import { AppContext } from '../App'



function getDayLabels() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    if (i === 0) return 'Today'
    if (i === 1) return 'Tmrw'
    return d.toLocaleDateString('en-IN', { weekday: 'short' })
  })
}

export default function Dashboard() {
  const { lang, setLang, t } = useContext(AppContext)
  const [panchayats, setPanchayats]       = useState([])
  const [selected,   setSelected]         = useState(null)
  const [forecast,   setForecast]         = useState(null)
  const [mapData,    setMapData]          = useState({})
  const [variable,   setVariable]         = useState('temperature')
  const [dayOffset,  setDayOffset]        = useState(0)
  const [crop,       setCrop]             = useState(null)
  const [loading,    setLoading]          = useState({ panchayats: true, forecast: false, map: false })

  useEffect(() => {
    getPanchayats()
      .then(r => setPanchayats(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(p => ({ ...p, panchayats: false })))
  }, [])

  useEffect(() => {
    setLoading(p => ({ ...p, map: true }))
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    const dateStr = d.toISOString().split('T')[0]
    getMapData(variable, dateStr)
      .then(r => {
        const arr = Array.isArray(r.data) ? r.data : []
        const dict = {}
        arr.forEach(item => { dict[item.panchayat_id] = item })
        setMapData(dict)
      })
      .catch(() => {})
      .finally(() => setLoading(p => ({ ...p, map: false })))
  }, [variable, dayOffset])

  const loadForecast = useCallback((pid, cropVal) => {
    if (!pid) return
    setLoading(p => ({ ...p, forecast: true }))
    setForecast(null)
    getForecast(pid, 7, cropVal)
      .then(r => setForecast(r.data))
      .catch(() => setForecast(null))
      .finally(() => setLoading(p => ({ ...p, forecast: false })))
  }, [])

  useEffect(() => {
    if (selected) loadForecast(selected.panchayat_id, crop)
  }, [selected, crop, loadForecast])

  const dayLabels = getDayLabels()
  
  const VARIABLES = [
    { key: 'temperature', label: t('temperature'), unit: 'C', Icon: Thermometer },
    { key: 'rainfall',    label: t('rainfall'),    unit: 'mm', Icon: CloudRain },
    { key: 'humidity',    label: t('humidity'),    unit: '%',  Icon: Droplets },
    { key: 'wind_speed',  label: t('wind'),        unit: 'km/h', Icon: Wind },
  ]

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Control bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2 flex flex-wrap items-center gap-3 shrink-0 relative z-[9999]">
        <div className="w-52 shrink-0">
          <SearchBox panchayats={panchayats} onSelect={p => { setSelected(p); setCrop(null) }} />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {VARIABLES.map(v => {
            const Icon = v.Icon
            return (
              <button
                key={v.key}
                onClick={() => setVariable(v.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium border rounded transition-all',
                  variable === v.key
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#40916C] hover:text-[#1B4332]'
                )}
              >
                <Icon size={13} strokeWidth={2} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex">
            {dayLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setDayOffset(i)}
                className={clsx(
                  'px-2.5 py-1 text-xs font-medium border-y border-r first:border-l first:rounded-l last:rounded-r transition-all',
                  dayOffset === i
                    ? 'bg-[#1B4332] text-white border-[#1B4332] z-10 relative'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                )}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Map area */}
        <div className={clsx('transition-all duration-300 h-full', selected ? 'flex-1' : 'w-full')}>
          <MapView
            panchayats={panchayats}
            mapData={mapData}
            variable={variable}
            selectedPanchayat={selected}
            onSelectPanchayat={setSelected}
            loadingMap={loading.map}
          />
        </div>

        {/* Side panel */}
        {selected && (
          <div className="w-full md:w-[420px] shrink-0 h-full bg-white border-l border-[#E2E8F0] flex flex-col overflow-hidden shadow-2xl absolute right-0 top-0 bottom-0 md:relative z-[1500]">
            <SidePanel
              panchayat={selected}
              forecast={forecast}
              loading={loading.forecast}
              crop={crop}
              onCropChange={setCrop}
              onClose={() => { setSelected(null); setForecast(null) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
