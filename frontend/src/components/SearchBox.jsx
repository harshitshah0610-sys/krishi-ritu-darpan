import React, { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'

export default function SearchBox({ panchayats = [], onSelect, placeholder = 'Search panchayat...' }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const [cursor, setCursor] = useState(-1)
  const ref = useRef(null)

  const filtered = query.trim().length < 1
    ? panchayats.slice(0, 40) // show all/top 40 on empty focus
    : panchayats.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.block.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 40)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKey(e) {
    if (e.key === 'ArrowDown') { setCursor(c => Math.min(c + 1, filtered.length - 1)); e.preventDefault() }
    if (e.key === 'ArrowUp')   { setCursor(c => Math.max(c - 1, 0)); e.preventDefault() }
    if (e.key === 'Enter' && cursor >= 0 && filtered[cursor]) { select(filtered[cursor]) }
    if (e.key === 'Escape') { setOpen(false); setCursor(-1) }
  }

  function select(p) {
    onSelect(p)
    setQuery(p.name)
    setOpen(false)
    setCursor(-1)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setOpen(true); setCursor(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          style={{
            width: '100%', paddingLeft: 32, paddingRight: query ? 30 : 10,
            paddingTop: 6, paddingBottom: 6,
            fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 6,
            outline: 'none', background: '#fff', color: '#0F172A',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocusCapture={e => { e.target.style.borderColor = '#40916C'; e.target.style.boxShadow = '0 0 0 2px rgba(64,145,108,0.15)' }}
          onBlurCapture={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
        />
        {query ? (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} color="#94A3B8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="custom-scrollbar" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 4, 
          maxHeight: '320px', overflowY: 'auto'
        }}>
          {filtered.map((p, i) => (
            <button
              key={p.panchayat_id}
              onMouseDown={(e) => { e.preventDefault(); select(p); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none',
                background: cursor === i ? '#F0FDF4' : 'transparent',
                cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid #F8FAFC' : 'none',
                transition: 'background 0.1s'
              }}
              onMouseEnter={() => setCursor(i)}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.block} Block</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize' }}>
                {p.primary_crop}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
