import React from 'react'
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

const SEVERITY = {
  critical: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', Icon: AlertCircle,   iconColor: '#DC2626' },
  high:     { bg: '#FFF7ED', border: '#FDC784', text: '#92400E', Icon: AlertTriangle,  iconColor: '#D97706' },
  medium:   { bg: '#FFFBEB', border: '#FDE68A', text: '#78350F', Icon: AlertTriangle,  iconColor: '#B45309' },
  low:      { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', Icon: AlertCircle,   iconColor: '#2563EB' },
}

const LANG_KEY = { en: 'message_en', hi: 'message_hi', gu: 'message_gu' }

export default function AlertBadges({ alerts = [], lang = 'en' }) {
  if (!alerts.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6 }}>
        <CheckCircle size={15} color="#16A34A" />
        <span style={{ fontSize: 13, color: '#15803D', fontWeight: 500 }}>No active weather alerts for this panchayat.</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const s = SEVERITY[alert.severity] || SEVERITY.medium
        const { Icon } = s
        const msgKey = LANG_KEY[lang] || 'message_en'
        const msg = alert[msgKey] || alert.message_en || ''
        return (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '9px 12px', background: s.bg,
            border: `1px solid ${s.border}`, borderRadius: 6,
          }}>
            <Icon size={15} color={s.iconColor} style={{ marginTop: 1, shrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.text, textTransform: 'capitalize', marginBottom: 2 }}>
                {alert.type.replace(/_/g, ' ')}
                <span style={{ fontWeight: 400, marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  {alert.date} · {alert.value != null ? Number(alert.value).toFixed(1) : ''}
                </span>
              </div>
              <div style={{ fontSize: 12, color: s.text, opacity: 0.85, fontFamily: lang !== 'en' ? 'Noto Sans Devanagari, Noto Sans Gujarati, sans-serif' : 'inherit' }}>
                {msg}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
