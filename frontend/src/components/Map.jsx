import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const BLOCKS = [
  { name: 'Daskroi',  bounds: [[22.90, 72.55], [23.05, 72.70]] },
  { name: 'Dholka',   bounds: [[22.70, 72.40], [22.85, 72.55]] },
  { name: 'Viramgam', bounds: [[23.05, 72.00], [23.20, 72.15]] },
  { name: 'Sanand',   bounds: [[22.95, 72.35], [23.10, 72.50]] },
]

// Interpolate between hex colors
function lerp(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16)
  const ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255
  const br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const blue = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${blue.toString(16).padStart(2,'0')}`
}

function scaleColor(val, stops) {
  if (val == null || isNaN(val)) return '#CBD5E1'
  const [minV, maxV] = [stops[0][0], stops[stops.length - 1][0]]
  const clamped = Math.max(minV, Math.min(maxV, val))
  for (let i = 0; i < stops.length - 1; i++) {
    const [v0, c0] = stops[i], [v1, c1] = stops[i + 1]
    if (clamped <= v1) {
      const t = (clamped - v0) / (v1 - v0)
      return lerp(c0, c1, t)
    }
  }
  return stops[stops.length - 1][1]
}

const COLOR_SCALES = {
  temperature: [[20,'#EFF6FF'],[27,'#93C5FD'],[32,'#3B82F6'],[37,'#F97316'],[42,'#991B1B']],
  rainfall:    [[0,'#F8FAFC'],[5,'#BAE6FD'],[20,'#0284C7'],[60,'#1E3A5F'],[100,'#0C1A2E']],
  humidity:    [[20,'#FEFCE8'],[40,'#BEF264'],[60,'#4ADE80'],[80,'#15803D'],[95,'#052E16']],
  wind_speed:  [[0,'#F0FDF4'],[10,'#6EE7B7'],[25,'#059669'],[45,'#064E3B'],[60,'#022C22']],
}

const UNITS = { temperature: '°C', rainfall: 'mm', humidity: '%', wind_speed: 'km/h' }

const LEGEND_LABELS = {
  temperature: ['20°C','27°C','32°C','37°C','42°C'],
  rainfall:    ['0mm','5mm','20mm','60mm','100mm'],
  humidity:    ['20%','40%','60%','80%','95%'],
  wind_speed:  ['0','10','25','45','60 km/h'],
}

function Legend({ variable }) {
  const stops = COLOR_SCALES[variable] || []
  const labels = LEGEND_LABELS[variable] || []
  return (
    <div style={{
      position: 'absolute', bottom: 28, right: 12, zIndex: 800,
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 6, padding: '8px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      minWidth: 120
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {variable.replace('_', ' ')}
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
        {stops.map(([, c], i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[labels[0], labels[Math.floor(labels.length/2)], labels[labels.length-1]].map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: '#94A3B8' }}>{l}</span>
        ))}
      </div>
    </div>
  )
}

export default function MapView({ panchayats = [], mapData = {}, variable = 'temperature', selectedPanchayat, onSelectPanchayat, loadingMap }) {
  const stops = COLOR_SCALES[variable]

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[22.97, 72.45]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {BLOCKS.map(b => (
          <Rectangle
            key={b.name}
            bounds={b.bounds}
            pathOptions={{ color: '#94A3B8', weight: 1.5, fill: false, dashArray: '6 3', opacity: 0.7 }}
          >
            <Tooltip
              direction="center"
              permanent
              className="bg-transparent border-none shadow-none"
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {b.name}
              </span>
            </Tooltip>
          </Rectangle>
        ))}

        {panchayats.map(p => {
          const pid = p.panchayat_id
          const item = mapData[pid]
          const val = item?.value ?? null
          const isSelected = selectedPanchayat?.panchayat_id === pid
          const fillColor = scaleColor(val, stops)

          return (
            <CircleMarker
              key={pid}
              center={[p.lat, p.lon]}
              radius={isSelected ? 13 : 8}
              pathOptions={{
                fillColor,
                fillOpacity: isSelected ? 1 : 0.85,
                color: isSelected ? '#1B4332' : 'rgba(255,255,255,0.7)',
                weight: isSelected ? 3 : 1,
              }}
              eventHandlers={{
                click: () => {
                  onSelectPanchayat(p)
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div style={{ padding: '4px 6px', minWidth: 140, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>{p.block} Block &middot; {p.elevation}m ASL</div>
                  {val != null && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1B4332' }}>
                      {Number(val).toFixed(1)}<span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}> {UNITS[variable]}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#40916C', marginTop: 4, fontWeight: 500 }}>Click for full forecast &rarr;</div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <Legend variable={variable} />

      {loadingMap && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.92)', border: '1px solid #E2E8F0',
          borderRadius: 6, padding: '5px 14px', fontSize: 12, color: '#64748B',
          zIndex: 900, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          Updating map data...
        </div>
      )}
    </div>
  )
}
