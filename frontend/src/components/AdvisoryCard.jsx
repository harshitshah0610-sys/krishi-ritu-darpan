import React from 'react'
import { CheckCircle, Info, Leaf } from 'lucide-react'

const LANG_FONT = { hi: 'Noto Sans Devanagari, sans-serif', gu: 'Noto Sans Gujarati, sans-serif', en: 'Inter, sans-serif' }

export default function AdvisoryCard({ advisory, language = 'en', onShare }) {
  if (!advisory) {
    return <div className="skeleton h-32 rounded-lg" />
  }

  const text = advisory[language] || advisory.en || ''
  const rules = advisory.rules_triggered || []
  const isNormal = rules.length === 1 && (rules[0] || '').toLowerCase().includes('normal')

  return (
    <div className="space-y-3">
      {/* Crop + method badge */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 4 }}>
          <Leaf size={12} color="#16A34A" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#15803D', textTransform: 'capitalize' }}>{advisory.crop}</span>
        </div>
        {advisory.crop && (
          <span style={{ fontSize: 11, color: '#94A3B8' }}>ML-corrected forecast &middot; Ahmedabad, Gujarat</span>
        )}
      </div>

      {/* Advisory text card */}
      <div style={{
        background: isNormal ? '#F0FDF4' : '#FFFBEB',
        border: `1px solid ${isNormal ? '#BBF7D0' : '#FDE68A'}`,
        borderRadius: 6,
        padding: '12px 14px',
      }}>
        {isNormal ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <CheckCircle size={15} color="#16A34A" style={{ marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#15803D', marginBottom: 3 }}>Conditions Normal</div>
              <div style={{ fontSize: 13, color: '#166534', fontFamily: LANG_FONT[language] }}>{text}</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {rules.length} Advisory {rules.length > 1 ? 'Recommendations' : 'Recommendation'}
            </div>
            <div style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.65, fontFamily: LANG_FONT[language] }}>{text}</div>
          </div>
        )}
      </div>

      {/* Individual rules as a clean list */}
      {!isNormal && rules.length > 1 && (
        <div className="space-y-1.5">
          {rules.map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#374151' }}>
              <Info size={13} color="#6B7280" style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
