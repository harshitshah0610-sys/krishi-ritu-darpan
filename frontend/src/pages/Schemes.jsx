import React, { useState, useContext } from 'react'
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Award, Tractor, Droplets, Zap, Shield } from 'lucide-react'
import { AppContext } from '../App'

const SCHEMES = [
  {
    id: 1,
    icon: <Award size={24} className="text-amber-500" />,
    name: 'PM-KISAN Samman Nidhi',
    nameHi: 'पीएम किसान सम्मान निधि',
    nameGu: 'PM-KISAN સન્માન નિધિ',
    ministry: 'Ministry of Agriculture',
    benefit: '₹6,000/year (3 installments of ₹2,000)',
    benefitHi: '₹6,000/वर्ष (₹2,000 की 3 किस्तें)',
    benefitGu: '₹6,000/વર્ષ (₹2,000 ના 3 હપ્તા)',
    eligibility: 'All small & marginal farmers with cultivable land',
    eligibilityHi: 'सभी छोटे और सीमांत किसान जिनके पास खेती योग्य जमीन है',
    eligibilityGu: 'ખેતીલાયક જમીન ધરાવતા તમામ નાના અને સીમાંત ખેડૂતો',
    docs: ['Aadhaar Card', 'Bank Account', 'Land Records'],
    color: 'amber',
    link: 'https://pmkisan.gov.in'
  },
  {
    id: 2,
    icon: <Shield size={24} className="text-blue-500" />,
    name: 'PM Fasal Bima Yojana (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना',
    nameGu: 'PM ફસલ વીમા યોજના',
    ministry: 'Ministry of Agriculture',
    benefit: 'Crop insurance at 2% (Kharif) / 1.5% (Rabi) premium',
    benefitHi: '2% (खरीफ) / 1.5% (रबी) प्रीमियम पर फसल बीमा',
    benefitGu: '2% (ખરીફ) / 1.5% (રવિ) પ્રીમિયમ પર પાક વીમો',
    eligibility: 'All farmers growing notified crops in notified areas',
    eligibilityHi: 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान',
    eligibilityGu: 'જાહેર વિસ્તારોમાં જાહેર પાક ઉગાડતા ખેડૂतों',
    docs: ['Land Records', 'Bank Passbook', 'Sowing Certificate'],
    color: 'blue',
    link: 'https://pmfby.gov.in'
  },
  {
    id: 3,
    icon: <Droplets size={24} className="text-cyan-500" />,
    name: 'PM Krishi Sinchai Yojana (PMKSY)',
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    nameGu: 'PM કૃષિ સિંચાઈ યોજना',
    ministry: 'Ministry of Jal Shakti',
    benefit: 'Subsidy on drip/sprinkler irrigation systems upto 90%',
    benefitHi: 'ड्रिप/स्प्रिंकलर सिंचाई पर 90% तक सब्सिडी',
    benefitGu: 'ટ્રિप/સ્પ્રિંકલર સિંચાઈ પ્રણાલી પર 90% સુધી સહાય',
    eligibility: 'Farmers with own land, also SHGs & cooperatives',
    eligibilityHi: 'अपनी जमीन वाले किसान, SHG और सहकारी संस्थाएं भी',
    eligibilityGu: 'પોતાની જમીન ધરાવતા ખેડૂतо, SHG અને સહકારી સંસ્થाઓ',
    docs: ['Aadhaar', 'Land Records', 'Bank Account', 'Quotation from Vendor'],
    color: 'cyan',
    link: 'https://pmksy.gov.in'
  },
  {
    id: 4,
    icon: <Tractor size={24} className="text-green-600" />,
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameHi: 'कृषि यंत्रीकरण उप-मिशन',
    nameGu: 'SMAM — કૃષિ યાંત્રીકરण',
    ministry: 'Ministry of Agriculture',
    benefit: '40–50% subsidy on tractors, harvesters, and farm tools',
    benefitHi: 'ट्रैक्टर, हार्वेस्टर और कृषि उपकरणों पर 40-50% सब्सिडी',
    benefitGu: 'ટ્રેક્ટર, હાર્વેસ્ટર અને ફાર્મ ટૂल્સ પર 40-50% સહાय',
    eligibility: 'Small & marginal farmers (priority), all categories eligible',
    eligibilityHi: 'छोटे और सीमांत किसान (प्राथमिकता), सभी श्रेणियां पात्र',
    eligibilityGu: 'નાના અને સીમાંત ખેડૂतो (પ્રાથમિकता), બધી केटेगरी',
    docs: ['Aadhaar', 'Land Records', 'Bank Account', 'Quotation'],
    color: 'green',
    link: 'https://agrimachinery.nic.in'
  },
  {
    id: 5,
    icon: <Zap size={24} className="text-purple-500" />,
    name: 'Kisan Credit Card (KCC)',
    nameHi: 'किसान क्रेडिट कार्ड',
    nameGu: 'કિસાન ક્રેડિટ કાર્ડ',
    ministry: 'Ministry of Finance / NABARD',
    benefit: 'Short-term credit up to ₹3 lakh at 4% interest (with subsidy)',
    benefitHi: '4% ब्याज पर ₹3 लाख तक अल्पकालिक ऋण (सब्सिडी सहित)',
    benefitGu: '4% વ્યાજ પર ₹3 લાખ સુધી ટૂંકા ગાળાની ક્રેડિट',
    eligibility: 'All farmers, tenant farmers, SHGs and JLGs',
    eligibilityHi: 'सभी किसान, बटाईदार, SHG और JLG',
    eligibilityGu: ' તમામ ખेडૂто, ભાડૂत ખеडૂто, SHG અне JLG',
    docs: ['Aadhaar', 'Land Records', 'Passport Photo', 'Bank Application'],
    color: 'purple',
    link: 'https://www.nabard.org/kcc'
  },
  {
    id: 6,
    icon: <BookOpen size={24} className="text-orange-500" />,
    name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    nameHi: 'राष्ट्रीय कृषि विकास योजना',
    nameGu: 'RKVY — રાષ્ટ્રીય કૃषि વिकास योजना',
    ministry: 'Ministry of Agriculture',
    benefit: 'Infrastructure, storage, agri-startups & custom hiring grants',
    benefitHi: 'बुनियादी ढांचा, भंडारण, कृषि स्टार्टअप और अनुदान',
    benefitGu: 'ઈન્ફ્રાસ્ટ્રક્ચर, સ્ટोरेज, એગ્રી-સ્ટার્ટઅप ગ્રાન્ट',
    eligibility: 'States apply on behalf of farmers; FPOs and agri-businesses',
    eligibilityHi: 'राज्य किसानों की ओर से आवेदन करते हैं; FPO और कृषि व्यवसाय',
    eligibilityGu: 'FPO અne agri-businesses',
    docs: ['Organization Documents', 'Project Report', 'Bank Details'],
    color: 'orange',
    link: 'https://rkvy.nic.in'
  }
]

const colorMap = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-800' },
  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
}

export default function Schemes() {
  const { lang } = useContext(AppContext)
  const [expanded, setExpanded] = useState(null)

  const getName = (s) => lang === 'hi' ? s.nameHi : lang === 'gu' ? s.nameGu : s.name
  const getBenefit = (s) => lang === 'hi' ? s.benefitHi : lang === 'gu' ? s.benefitGu : s.benefit
  const getEligibility = (s) => lang === 'hi' ? s.eligibilityHi : lang === 'gu' ? s.eligibilityGu : s.eligibility

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1B4332] p-3 rounded-lg">
            <BookOpen className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {lang === 'hi' ? 'सरकारी योजनाएं' : lang === 'gu' ? 'સરकારી યોજनाઓ' : 'Government Schemes'}
            </h1>
            <p className="text-[#64748B] text-sm">
              {lang === 'hi' ? 'केंद्र सरकार की प्रमुख कृषि योजनाएं — पात्रता, दस्तावेज़ और लाभ' :
               lang === 'gu' ? 'કેન્દ્ર સરકારની મુખ્ય કૃषि योजनाઓ — પàt્રता, दस्तावेज़ और लाभ' :
               'Central Government flagship agricultural schemes — eligibility, documents & benefits'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {SCHEMES.map(scheme => {
            const colors = colorMap[scheme.color]
            const isOpen = expanded === scheme.id
            return (
              <div key={scheme.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${isOpen ? `border-[#1B4332]` : 'border-[#E2E8F0]'}`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : scheme.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className={`p-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                    {scheme.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#0F172A] text-sm leading-tight">{getName(scheme)}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">{scheme.ministry}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`hidden sm:inline text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
                      {lang === 'hi' ? 'लाभ:' : lang === 'gu' ? 'લाभ:' : 'Benefit:'}
                    </span>
                    {isOpen ? <ChevronUp size={18} className="text-[#64748B]"/> : <ChevronDown size={18} className="text-[#64748B]"/>}
                  </div>
                </button>

                {isOpen && (
                  <div className={`border-t border-[#E2E8F0] p-5 space-y-4 ${colors.bg}`}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                          {lang === 'hi' ? '💰 लाभ' : lang === 'gu' ? '💰 ફायदો' : '💰 Benefit'}
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">{getBenefit(scheme)}</p>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                          {lang === 'hi' ? '✅ पात्रता' : lang === 'gu' ? '✅ પàt્rतા' : '✅ Eligibility'}
                        </div>
                        <p className="text-sm text-[#374151]">{getEligibility(scheme)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                        {lang === 'hi' ? '📄 आवश्यक दस्तावेज़' : lang === 'gu' ? '📄 જüरी दस्तावेज़' : '📄 Required Documents'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scheme.docs.map(doc => (
                          <span key={doc} className="flex items-center gap-1 bg-white border border-[#E2E8F0] text-xs font-medium text-[#374151] px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={11} className="text-green-500" /> {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a href={scheme.link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1B4332] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#143425] transition-colors">
                      <ExternalLink size={14} />
                      {lang === 'hi' ? 'आधिकारिक पोर्टल पर जाएं' : lang === 'gu' ? 'સत्तावार पोर्टल' : 'Visit Official Portal'}
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
