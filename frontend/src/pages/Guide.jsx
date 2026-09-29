import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, SkipForward, SkipBack,
  HelpCircle, BookOpen, Video, CheckCircle2, AlertTriangle, Phone, FileText,
  Thermometer, Droplets, Sprout, Bug, TrendingUp, Landmark, Send, ArrowRight,
  ShieldCheck, Sparkles, ChevronDown, ChevronUp, ExternalLink, Lightbulb
} from 'lucide-react'
import { AppContext } from '../App'

const CHAPTERS = [
  {
    id: 1,
    time: '0:00',
    seconds: 0,
    titleEn: '1. Hyperlocal Weather Dashboard',
    titleHi: '1. हाइपरलोकल मौसम डैशबोर्ड',
    titleGu: '1. હાઇપરલોકલ હવામાન ડેશબોર્ડ',
    icon: Thermometer,
    route: '/',
    badge: 'Core Engine',
    descEn: 'Learn how to select your Gram Panchayat, view real-time elevation-adjusted temperature, rainfall, and wind, and compare local forecasts with block centroids.',
    descHi: 'अपनी ग्राम पंचायत चुनें, वास्तविक समय की ऊंचाई-समायोजित तापमान, वर्षा और हवा देखें, और ब्लॉक पूर्वानुमान से तुलना करें।',
    descGu: 'તમારી ગ્રામ પંચાયત પસંદ કરો, ઊંચાઈ મુજબ તાપમાન, વરસાદ અને પવન જુઓ અને બ્લોકની સરખામણી કરો.',
    steps: [
      { en: 'Click on the search bar or interact with the Leaflet interactive map.', hi: 'सर्च बार पर क्लिक करें या इंटरैक्टिव मैप पर अपनी पंचायत चुनें।', gu: 'સર્ચ બાર પર ક્લિક કરો અથવા નકશા પર તમારી પંચાયત પસંદ કરો.' },
      { en: 'Switch between Temperature, Rainfall, Humidity, and Wind speed metrics.', hi: 'तापमान, वर्षा, नमी और हवा की गति के बीच स्विच करें।', gu: 'તાપમાન, વરસાદ, ભેજ અને પવનની ગતિ વચ્ચે સ્વિચ કરો.' },
      { en: 'Open the right side-panel for 7-day hourly meteograms and AI weather advisories.', hi: '7-दिवसीय विस्तृत पूर्वानुमान और एआई मौसम सलाह के लिए साइड पैनल खोलें।', gu: '7-દિવસની વિગતવાર આગાહી અને AI હવામાન સલાહ માટે સાઇડ પેનલ ખોલો.' }
    ]
  },
  {
    id: 2,
    time: '1:15',
    seconds: 75,
    titleEn: '2. AI Sowing Window Feasibility',
    titleHi: '2. एआई बुवाई उपयुक्तता योजनाकार',
    titleGu: '2. AI વાવણી સમય માર્ગદર્શિકા',
    icon: Sprout,
    route: '/sowing',
    badge: 'Crop Planning',
    descEn: 'Calculate 72-hour germination feasibility before investing in expensive seeds, preventing germination failure caused by unseasonal rain or scorching soil heat.',
    descHi: 'महंगे बीजों में निवेश करने से पहले 72 घंटे की अंकुरण उपयुक्तता की जांच करें ताकि बीज खराब न हों।',
    descGu: 'મોંઘા બિયારણ વાવતા પહેલા 72 કલાકની અંકુરણ અનુકૂળતા તપાસો જેથી બિયારણ બગડે નહીં.',
    steps: [
      { en: 'Select your target village and primary crop (Cotton, Wheat, Bajra, Groundnut).', hi: 'अपना गांव और मुख्य फसल (कपास, गेहूं, बाजरा, मूंगफली) चुनें।', gu: 'તમારું ગામ અને મુખ્ય પાક (કપાસ, ઘઉં, બાજરી, મગફળી) પસંદ કરો.' },
      { en: 'Read the AI Verdict badge: FAVORABLE (Go), MARGINAL (Caution), or UNFAVORABLE (Stop).', hi: 'एआई निर्णय देखें: अनुकूल (Go), सीमांत (Caution), या प्रतिकूल (Stop)।', gu: 'AI નિર્ણય જુઓ: અનુકૂળ (Go), સાધારણ (Caution), અથવા પ્રતિકૂળ (Stop).' },
      { en: 'Check the 3-day average soil temperature and 72-hour accumulated rainfall index.', hi: '3-दिवसीय औसत मिट्टी का तापमान और संचित वर्षा सूचकांक का विश्लेषण करें।', gu: '3-દિવસનું સરેરાશ તાપમાન અને કુલ વરસાદી ભેજ તપાસો.' }
    ]
  },
  {
    id: 3,
    time: '2:30',
    seconds: 150,
    titleEn: '3. 7-Day Precision Irrigation (ET₀)',
    titleHi: '3. 7-दिवसीय सटीक सिंचाई सलाहकार (ET₀)',
    titleGu: '3. 7-દિવસીય સચોટ સિંચાઈ સલાહકાર (ET₀)',
    icon: Droplets,
    route: '/irrigation',
    badge: 'Water Saving',
    descEn: 'Uses Hargreaves-Samani potential evapotranspiration (ET₀) and FAO-56 crop coefficients to tell you the exact days and millimeter water depth your crop requires.',
    descHi: 'हरग्रीव्स-समानी ET₀ और FAO-56 फसल गुणांक का उपयोग करके फसल के लिए आवश्यक सटीक पानी और दिन बताता है।',
    descGu: 'ET₀ પદ્ધતિ અને FAO-56 પાક ગુણાંકના આધારે પાકને ક્યારે અને કેટલું પાણી આપવું તે નક્કી કરે છે.',
    steps: [
      { en: 'Select your Gram Panchayat and the specific crop you are cultivating.', hi: 'अपनी ग्राम पंचायत और अपनी उगाई जा रही फसल चुनें।', gu: 'તમારી ગ્રામ પંચાયત અને વાવેતર કરેલ પાક પસંદ કરો.' },
      { en: 'Review the dynamic green Agro-Met Advisory alert banner at the top.', hi: 'शीर्ष पर गतिशील कृषि-मौसम सलाह बैनर को ध्यान से पढ़ें।', gu: 'ટોચ પર આપેલ લીલા રંગના કૃષિ હવામાન સલાહ બેનરને વાંચો.' },
      { en: 'Follow the 7-day schedule to avoid over-irrigation during upcoming rains or under-irrigation during heat spikes.', hi: 'आने वाली बारिश या गर्मी के दौरान पानी की बर्बादी रोकने के लिए शेड्यूल का पालन करें।', gu: 'આગામી વરસાદ કે ગરમી દરમિયાન પાણીનો સચોટ ઉપયોગ કરવા માટે શેડ્યૂલ અનુસરો.' }
    ]
  },
  {
    id: 4,
    time: '3:45',
    seconds: 225,
    titleEn: '4. AI Crop Leaf & Pest Diagnostics',
    titleHi: '4. एआई फसल रोग और कीट निदान',
    titleGu: '4. AI પાક રોગ અને જીવાત નિદાન',
    icon: Bug,
    route: '/diagnostics',
    badge: 'Dual Deep Learning',
    descEn: 'Snap or upload a photo of infected leaves to detect 38 plant diseases and 14 agricultural pests with 98%+ precision, powered by PyTorch neural networks.',
    descHi: 'PyTorch न्यूरल नेटवर्क द्वारा 38 फसल रोगों और 14 कीटों का 98%+ सटीकता से तुरंत पता लगाने के लिए फोटो अपलोड करें।',
    descGu: 'PyTorch મોડેલ દ્વારા પાકના 38 રોગો અને 14 જીવાતોને 98%+ ચોકસાઈથી ઓળખવા માટે પાંદડાનો ફોટો અપલોડ કરો.',
    steps: [
      { en: 'Take a clear, well-lit photo of the affected plant leaf (avoid heavy shadows or blurry angles).', hi: 'प्रभावित पौधे की पत्ती का स्पष्ट, रोशनी वाला फोटो लें (धुंधले या छाया वाले फोटो से बचें)।', gu: 'રોગગ્રસ્ત પાંદડાનો સ્પષ્ટ, સારો પ્રકાશ વાળો ફોટો લો (પડછાયા કે અસ્પષ્ટ ફોટા ટાળો).' },
      { en: 'Toggle between "Crop Disease" and "Pest Infestation" detection modes.', hi: '"फसल रोग" और "कीट प्रकोप" पहचान मोड के बीच चयन करें।', gu: '"પાક રોગ" અને "જીવાત ઉપદ્રવ" મોડ વચ્ચે પસંદગી કરો.' },
      { en: 'Click "Analyze with AI" to receive immediate disease name, confidence %, and scientific chemical remedies.', hi: '"एआई से विश्लेषण करें" पर क्लिक करें और तुरंत रोग का नाम, सटीकता और दवा के उपाय प्राप्त करें।', gu: '"AI સાથે વિશ્લેષણ કરો" પર ક્લિક કરો અને રોગનું નામ અને દવાના ઉપાયો મેળવો.' }
    ]
  },
  {
    id: 5,
    time: '5:00',
    seconds: 300,
    titleEn: '5. APMC Mandi Market Prices & MSP',
    titleHi: '5. एपीएमसी मंडी भाव और एमएसपी तुलना',
    titleGu: '5. APMC બજાર ભાવ અને MSP સરખામણી',
    icon: TrendingUp,
    route: '/market',
    badge: 'Market Intel',
    descEn: 'Compare real-time Gujarat APMC commodity prices against central Government Minimum Support Prices (MSP) with smart AI Sell/Hold advice.',
    descHi: 'गुजरात एपीएमसी अनाज मंडियों के वास्तविक भावों की न्यूनतम समर्थन मूल्य (MSP) से तुलना करें और एआई बिक्री सलाह पाएं।',
    descGu: 'ગુજરાત માર્કેટિંગ યાર્ડના જીવંત ભાવોની ટેકાના ભાવ (MSP) સાથે સરખામણી કરો અને વેચાણ સલાહ મેળવો.',
    steps: [
      { en: 'Search and filter live prices for Cotton, Wheat, Bajra, Groundnut, Mustard, and Cumin.', hi: 'कपास, गेहूं, बाजरा, मूंगफली, सरसों और जीरा के मंडी भाव खोजें।', gu: 'કપાસ, ઘઉં, બાજરી, મગફળી, રાયડો અને જીરુંના લાઈવ ભાવ શોધો.' },
      { en: 'Compare today price against the official MSP threshold to identify profitable selling windows.', hi: 'लाभप्रद बिक्री विंडो खोजने के लिए आज के भाव की आधिकारिक एमएसपी से तुलना करें।', gu: 'નફાકારક વેચાણ માટે આજના ભાવની સરકારી MSP સાથે સરખામણી કરો.' },
      { en: 'Review the AI Market Advisory for trend directions (Bullish / Stable / Softening).', hi: 'भाव की दिशा और प्रवृत्ति के लिए एआई मार्केट एडवाइजरी की समीक्षा करें।', gu: 'બજારના વલણ અને દિશા જાણવા માટે AI માર્કેટ એડવાઇઝરી જુઓ.' }
    ]
  },
  {
    id: 6,
    time: '6:15',
    seconds: 375,
    titleEn: '6. Central & State Govt Schemes',
    titleHi: '6. केंद्र और राज्य सरकार की कल्याणकारी योजनाएं',
    titleGu: '6. કેન્દ્ર અને રાજ્ય સરકારની કૃષિ યોજનાઓ',
    icon: Landmark,
    route: '/schemes',
    badge: 'Subsidies & Direct Benefits',
    descEn: 'Find direct financial benefits under PM-KISAN, PMFBY crop insurance, PMKSY drip irrigation subsidies, and Kisan Credit Card (KCC) with document checklists.',
    descHi: 'पीएम-किसान, फसल बीमा, ड्रिप सिंचाई सब्सिडी और किसान क्रेडिट कार्ड की पात्रता और आवश्यक दस्तावेज देखें।',
    descGu: 'PM-કિસાન, પાક વીમો, ટપક સિંચાઈ સબસિડી અને કિસાન ક્રેડિટ કાર્ડ માટે પાત્રતા અને જરૂરી કાગળો ચકાસો.',
    steps: [
      { en: 'Filter schemes by financial support, crop insurance, solar pumping, and equipment subsidies.', hi: 'वित्तीय सहायता, फसल बीमा, सोलर पंप और उपकरण सब्सिडी के आधार पर योजनाओं को फ़िल्टर करें।', gu: 'નાણાકીય સહાય, પાક વીમો, સોલાર પંપ અને સાધન સહાય મુજબ ફિલ્ટર કરો.' },
      { en: 'Check your eligibility criteria and note down mandatory documents before visiting CSC centers.', hi: 'सीएससी केंद्र जाने से पहले अपनी पात्रता जांचें और आवश्यक दस्तावेजों की सूची नोट करें।', gu: 'CSC સેન્ટર જતાં પહેલાં તમારી પાત્રતા અને જરૂરી દસ્તાવેજોની યાદી તપાસો.' },
      { en: 'Click "Apply on Official Portal" to jump directly to official Government of India portals.', hi: '"आधिकारिक पोर्टल पर आवेदन करें" पर क्लिक करके सीधे सरकारी पोर्टल पर जाएं।', gu: '"સત્તાવાર પોર્ટલ પર અરજી કરો" પર ક્લિક કરી સીધા સરકારી પોર્ટલ પર જાઓ.' }
    ]
  },
  {
    id: 7,
    time: '7:30',
    seconds: 450,
    titleEn: '7. Gram Panchayat WhatsApp Broadcast',
    titleHi: '7. ग्राम पंचायत व्हाट्सएप प्रसारण केंद्र',
    titleGu: '7. ગ્રામ પંચાયત WhatsApp બ્રોડકાસ્ટ હબ',
    icon: Send,
    route: '/admin',
    badge: 'Village Administrators',
    descEn: 'Enables Sarpanches and Village Computer Entrepreneurs (VCE) to broadcast auto-generated, localized weather bulletins to village WhatsApp farmer groups.',
    descHi: 'सरपंच और वीसीई को ग्राम व्हाट्सएप किसान समूहों में स्वचालित स्थानीय मौसम बुलेटिन प्रसारित करने में सक्षम बनाता है।',
    descGu: 'સરપંચ અને VCE ને ગામના ખેડૂત WhatsApp ગ્રુપમાં ઓટોમેટિક હવામાન બુલેટિન મોકલવા માટે સક્ષમ બનાવે છે.',
    steps: [
      { en: 'Select your Gram Panchayat from the administrative dropdown.', hi: 'प्रशासनिक ड्रॉपडाउन से अपनी ग्राम पंचायत चुनें।', gu: 'ડ્રોપડાઉનમાંથી તમારી ગ્રામ પંચાયત પસંદ કરો.' },
      { en: 'Select your preferred advisory language (Hindi, Gujarati, English).', hi: 'अपनी पसंदीदा भाषा (हिंदी, गुजराती, अंग्रेजी) चुनें।', gu: 'તમારી પસંદગીની ભાષા (ગુજરાતી, હિન્દી, અંગ્રેજી) પસંદ કરો.' },
      { en: 'Click "Generate AI Advisory" and dispatch directly to farmers via 1-click WhatsApp web integration.', hi: '"एआई सलाह उत्पन्न करें" पर क्लिक करें और व्हाट्सएप द्वारा एक क्लिक में किसानों को भेजें।', gu: '"AI સલાહ બનાવો" પર ક્લિક કરો અને એક ક્લિકમાં ખેડૂતોને WhatsApp પર મોકલો.' }
    ]
  },
  {
    id: 8,
    time: '8:40',
    seconds: 520,
    titleEn: '8. User Profile & Role Settings',
    titleHi: '8. उपयोगकर्ता प्रोफ़ाइल और भूमिका सेटिंग्स',
    titleGu: '8. વપરાશકર્તા પ્રોફાઇલ અને ભૂમિકા સેટિંગ્સ',
    icon: ShieldCheck,
    route: '/profile',
    badge: 'Personalization',
    descEn: 'Customize your farm location, primary crops, user role (Farmer, Sarpanch, Agronomist), and view system health and data accuracy metrics.',
    descHi: 'अपने खेत का स्थान, मुख्य फसलें, अपनी भूमिका (किसान, सरपंच, कृषि वैज्ञानिक) सेट करें और सिस्टम स्वास्थ्य देखें।',
    descGu: 'તમારા ખેતરનું સ્થાન, મુખ્ય પાક, ભૂમિકા (ખેડૂત, સરપંચ, કૃષિ નિષ્ણાત) સેટ કરો અને સચોટતા તપાસો.',
    steps: [
      { en: 'Review your registered phone number, mapped Panchayat, and District.', hi: 'अपना पंजीकृत फ़ोन नंबर, मैप की गई पंचायत और जिला देखें।', gu: 'તમારો રજીસ્ટર્ડ ફોન નંબર, પંચાયત અને જિલ્લો ચકાસો.' },
      { en: 'Switch between English, Hindi, and Gujarati at any moment from the global header.', hi: 'ग्लोबल हेडर से किसी भी समय अंग्रेजी, हिंदी और गुजराती के बीच स्विच करें।', gu: 'મુખ્ય હેડર પરથી કોઈપણ સમયે અંગ્રેજી, હિન્દી અને ગુજરાતી બદલો.' },
      { en: 'Safely log out or re-authenticate from the profile management interface.', hi: 'प्रोफ़ाइल प्रबंधन इंटरफ़ेस से सुरक्षित रूप से लॉग आउट या पुनः लॉगिन करें।', gu: 'પ્રોફાઇલ પેજ પરથી સુરક્ષિત રીતે લૉગ આઉટ અથવા ફરી લૉગિન કરો.' }
    ]
  }
]

const FAQS = [
  {
    qEn: "How is Krishi Ritu Darpan different from standard weather apps (like Google or AccuWeather)?",
    qHi: "कृषि ऋतु दर्पण सामान्य मौसम ऐप (जैसे गूगल या एक्यूवेदर) से कैसे अलग है?",
    qGu: "કૃષિ ઋતુ દર્પણ સામાન્ય હવામાન એપ્લિકેશનથી કેવી રીતે અલગ છે?",
    aEn: "Standard mobile apps provide general block or district-level forecasts (interpolated over 25-50 km areas). Krishi Ritu Darpan downscales satellite and NWP grid models directly to your specific Gram Panchayat using physics-based lapse rate calculations, Digital Elevation Models (DEM), and LightGBM machine learning models tuned to Gujarat microclimates.",
    aHi: "सामान्य ऐप्स केवल 25-50 किमी के बड़े ब्लॉक या जिले का औसत मौसम दिखाते हैं। कृषि ऋतु दर्पण भौतिकी-आधारित ऊंचाई सुधार (Lapse Rate) और LightGBM मशीन लर्निंग मॉडल द्वारा सीधे आपकी ग्राम पंचायत स्तर (1-3 किमी) का सटीक मौसम प्रदान करता है।",
    aGu: "સામાન્ય એપ્સ 25-50 કિમીના મોટા વિસ્તારનું અંદાજિત હવામાન આપે છે. કૃષિ ઋતુ દર્પણ જમીનની ઊંચાઈ, સ્થાનિક વાતાવરણ અને LightGBM મશીન લર્નિંગ દ્વારા સીધા તમારી ગ્રામ પંચાયત કક્ષાની સચોટ માહિતી આપે છે."
  },
  {
    qEn: "What is the best way to take photos for AI Crop Disease and Pest Diagnostics?",
    qHi: "एआई फसल रोग और कीट पहचान के लिए फोटो खींचने का सबसे अच्छा तरीका क्या है?",
    qGu: "AI પાક રોગ અને જીવાત ઓળખ માટે ફોટો લેવાની શ્રેષ્ઠ રીત કઈ છે?",
    aEn: "Hold your camera 15-20 cm away from the leaf in bright daylight (avoid harsh direct sunlight or dark shadows). Ensure the infected spots or insects are in sharp focus. High-contrast images achieve over 98% diagnosis confidence.",
    aHi: "दिन के उजाले में कैमरे को पत्ती से 15-20 सेमी दूर रखें। सुनिश्चित करें कि रोग के धब्बे या कीट स्पष्ट और फोकस में हों। छाया या धुंधले फोटो से बचें।",
    aGu: "દિવસના સારા અજવાળામાં કેમેરાને પાંદડાથી 15-20 સેમી દૂર રાખો. ખાતરી કરો કે રોગના ડાઘ કે જીવાત સ્પષ્ટ દેખાય છે. ધૂંધળા ફોટા ટાળો."
  },
  {
    qEn: "How does the ET₀ Irrigation schedule save electricity and groundwater?",
    qHi: "ET₀ सिंचाई अनुसूची बिजली और भूजल की बचत कैसे करती है?",
    qGu: "ET₀ સિંચાઈ પદ્ધતિ વીજળી અને ભૂગર્ભ જળની બચત કેવી રીતે કરે છે?",
    aEn: "Farmers often over-water crops based on visual habits. Our system computes exact daily soil moisture depletion using Hargreaves potential evapotranspiration and FAO-56 crop stages, postponing watering when rainfall is impending and preventing root rot and groundwater wastage.",
    aHi: "किसान अक्सर अनुमान से जरूरत से ज्यादा पानी दे देते हैं। हमारा सिस्टम हरग्रीव्स मॉडल से यह गणना करता है कि धूप और हवा से कितना पानी उड़ा है और आने वाले दिनों में वर्षा के अनुसार केवल आवश्यक पानी देने की सलाह देता है।",
    aGu: "ખેડૂતો ઘણીવાર અંદાજથી વધુ પાણી આપે છે. આપણું સિસ્ટમ વૈજ્ઞાનિક પદ્ધતિથી ગણતરી કરીને આગામી વરસાદ અને જમીનના ભેજ મુજબ જ પાણી આપવાની સલાહ આપે છે, જેનાથી વીજળી અને પાણી બંને બચે છે."
  },
  {
    qEn: "Can farmers without smartphones receive these weather advisories?",
    qHi: "क्या बिना स्मार्टफोन वाले किसान भी ये मौसम सलाह प्राप्त कर सकते हैं?",
    qGu: "શું સ્માર્ટફોન ન ધરાવતા ખેડૂતો પણ આ હવામાન સલાહ મેળવી શકે છે?",
    aEn: "Yes! The Sarpanch, Talati, or Village Computer Entrepreneur (VCE) uses the 'GP Admin Hub' to generate concise regional language bulletins and push them to community WhatsApp groups, village loud-speaker broadcasts, or printed Panchayat notice boards.",
    aHi: "हाँ! ग्राम सरपंच या वीसीई 'ग्राम पंचायत एडमिन हब' का उपयोग करके हिंदी या गुजराती में मौसम बुलेटिन प्रिंट कर सकते हैं या ग्राम समूह के माध्यम से सभी किसानों तक पहुंचा सकते हैं।",
    aGu: "હા! ગ્રામ પંચાયતના સરપંચ અથવા VCE 'ગ્રામ પંચાયત એડમિન હબ' દ્વારા ગુજરાતીમાં માહિતી તૈયાર કરી ગામના WhatsApp ગ્રૂપ અથવા પંચાયતના નોટિસ બોર્ડ પર લગાવી શકે છે."
  }
]

export default function Guide() {
  const { lang, t } = useContext(AppContext)
  const [activeChapter, setActiveChapter] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)
  const [customVideoUrl, setCustomVideoUrl] = useState('')
  const [useCustomVideo, setUseCustomVideo] = useState(false)

  // Simulation timer for interactive walkthrough video
  useEffect(() => {
    let interval = null
    if (isPlaying && !useCustomVideo) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 600) {
            return 0
          }
          const next = prev + 1 * playbackSpeed
          // Sync active chapter based on progress seconds
          const foundIndex = CHAPTERS.slice().reverse().findIndex(ch => next >= ch.seconds)
          if (foundIndex !== -1) {
            const actualIndex = CHAPTERS.length - 1 - foundIndex
            setActiveChapter(actualIndex)
          }
          return next
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, useCustomVideo])

  const currentCh = CHAPTERS[activeChapter] || CHAPTERS[0]
  const CurrentIcon = currentCh.icon

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSeek = (e) => {
    const val = Number(e.target.value)
    setProgress(val)
    const foundIndex = CHAPTERS.slice().reverse().findIndex(ch => val >= ch.seconds)
    if (foundIndex !== -1) {
      setActiveChapter(CHAPTERS.length - 1 - foundIndex)
    }
  }

  const handleSelectChapter = (index) => {
    setActiveChapter(index)
    setProgress(CHAPTERS[index].seconds)
    setIsPlaying(true)
  }

  const getTitle = (ch) => lang === 'hi' ? ch.titleHi : lang === 'gu' ? ch.titleGu : ch.titleEn
  const getDesc = (ch) => lang === 'hi' ? ch.descHi : lang === 'gu' ? ch.descGu : ch.descEn

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] pb-16">
      {/* Top Header Banner */}
      <div className="bg-[#1B4332] text-white py-10 px-4 md:px-8 border-b border-[#2D6A4F] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-[#2D6A4F]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#74C69D] tracking-wide mb-3 border border-white/10">
            <Sparkles size={14} />
            {lang === 'hi' ? 'आधिकारिक उपयोगकर्ता मार्गदर्शिका एवं वीडियो' : 
             lang === 'gu' ? 'સત્તાવાર વપરાશકર્તા માર્ગદર્શિકા અને વિડિઓ' : 
             'Official Interactive Video Tour & Guidelines'}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {lang === 'hi' ? 'कृषि ऋतु दर्पण का उपयोग कैसे करें' : 
             lang === 'gu' ? 'કૃષિ ઋતુ દર્પણનો ઉપયોગ કેવી રીતે કરવો' : 
             'Master Krishi Ritu Darpan: Complete User Guide'}
          </h1>
          <p className="text-sm md:text-base text-[#D8F3DC] max-w-3xl leading-relaxed">
            {lang === 'hi' ? 'हाइपरलोकल मौसम डाउनस्केलिंग, एआई बुवाई उपयुक्तता, 7-दिवसीय सटीक सिंचाई (ET₀), रोग पहचान एवं मंडी भाव के उपयोग के लिए संपूर्ण सचित्र व वीडियो मार्गदर्शिका।' :
             lang === 'gu' ? 'હાઇપરલોકલ હવામાન, AI વાવણી આયોજન, 7-દિવસની સિંચાઈ સલાહ (ET₀), રોગ નિદાન અને બજાર ભાવ માટે સંપૂર્ણ માર્ગદર્શિકા.' :
             'Comprehensive operational walkthrough for farmers, Sarpanches, and agricultural officers. Learn every AI feature step-by-step with interactive visual demonstrations.'}
          </p>

          {/* Quick jump pills */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <a href="#video-tour" className="px-3.5 py-1.5 rounded-lg bg-white text-[#1B4332] font-bold text-xs hover:bg-[#D8F3DC] transition shadow flex items-center gap-1.5">
              <Play size={14} className="fill-[#1B4332]" /> {lang === 'hi' ? 'वीडियो वॉकथ्रू देखें' : lang === 'gu' ? 'વિડિઓ ટૂર જુઓ' : 'Watch Video Walkthrough'}
            </a>
            <a href="#feature-guidelines" className="px-3.5 py-1.5 rounded-lg bg-white/15 text-white font-medium text-xs hover:bg-white/25 transition border border-white/20 flex items-center gap-1.5">
              <BookOpen size={14} /> {lang === 'hi' ? 'कदम-दर-कदम गाइड' : lang === 'gu' ? 'સ્ટેપ-બાય-સ્ટેપ ગાઇડ' : 'Step-by-Step Guide'}
            </a>
            <a href="#helpline" className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-900 font-bold text-xs hover:bg-amber-300 transition flex items-center gap-1.5">
              <Phone size={14} /> {lang === 'hi' ? 'किसान हेल्पलाइन 1800-180-1551' : lang === 'gu' ? 'કિસાન હેલ્પલાઇન 1800-180-1551' : 'Kisan Helpline 1800-180-1551'}
            </a>
            <a href="#faqs" className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white font-medium text-xs hover:bg-white/20 transition flex items-center gap-1.5">
              <HelpCircle size={14} /> {lang === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : lang === 'gu' ? 'વારંવાર પૂછાતા પ્રશ્નો' : 'FAQs'}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 space-y-12">

        {/* SECTION 1: INTERACTIVE WALKTHROUGH VIDEO PLAYER */}
        <section id="video-tour" className="scroll-mt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                <Video size={16} />
                {lang === 'hi' ? 'इंटरैक्टिव वीडियो वॉकथ्रू' : lang === 'gu' ? 'ઇન્ટરેક્ટિવ વિડિઓ પ્રવાસ' : 'Interactive Video Demonstration'}
              </div>
              <h2 className="text-2xl font-black text-[#0F172A] mt-1">
                {lang === 'hi' ? 'सिस्टम वीडियो टूर और सिम्युलेटर' : lang === 'gu' ? 'સિસ્ટમ વિડિઓ ટૂર અને સિમ્યુલેટર' : 'System Walkthrough & Simulator'}
              </h2>
            </div>
            
            {/* Optional custom video link input for hackathon presenters */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setUseCustomVideo(!useCustomVideo)}
                className="text-xs font-medium text-[#40916C] hover:text-[#1B4332] underline cursor-pointer"
              >
                {useCustomVideo ? 'Switch to Built-in Interactive Simulator' : 'Have a YouTube/MP4 link?'}
              </button>
            </div>
          </div>

          {useCustomVideo && (
            <div className="mb-4 bg-white p-3 rounded-lg border border-[#CBD5E1] flex gap-2">
              <input 
                type="text"
                placeholder="Paste YouTube or MP4 video URL (e.g., https://www.youtube.com/embed/...)"
                value={customVideoUrl}
                onChange={e => setCustomVideoUrl(e.target.value)}
                className="flex-1 text-xs border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#1B4332]"
              />
              <button 
                onClick={() => setUseCustomVideo(true)}
                className="bg-[#1B4332] text-white text-xs px-3 py-1.5 rounded font-bold"
              >
                Load Video
              </button>
            </div>
          )}

          {/* Player Shell */}
          <div className="bg-[#0B132B] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-white flex flex-col lg:flex-row">
            
            {/* Screen / Presentation Area */}
            <div className="flex-1 flex flex-col justify-between bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A192F] relative min-h-[380px] md:min-h-[460px] p-6 md:p-8">
              
              {useCustomVideo && customVideoUrl ? (
                <div className="w-full h-full min-h-[360px] flex items-center justify-center">
                  <iframe 
                    src={customVideoUrl} 
                    title="Walkthrough Video"
                    className="w-full h-full min-h-[360px] rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <>
                  {/* Top Overlay Badge */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-slate-200">LIVE DEMO WALKTHROUGH</span>
                      <span className="text-white/40">|</span>
                      <span className="text-emerald-400 font-semibold">{currentCh.badge}</span>
                    </div>

                    <Link 
                      to={currentCh.route}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg transition"
                    >
                      {lang === 'hi' ? 'इसे अभी खोलें' : lang === 'gu' ? 'આ પેજ ખોલો' : 'Open This Feature'}
                      <ExternalLink size={12} />
                    </Link>
                  </div>

                  {/* Main Visual Simulator Screen */}
                  <div className="my-auto py-6 flex flex-col items-center justify-center text-center z-10 max-w-xl mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-4 shadow-xl backdrop-blur">
                      <CurrentIcon size={40} className="text-emerald-400 animate-bounce" />
                    </div>

                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                      {lang === 'hi' ? 'अध्याय' : lang === 'gu' ? 'પ્રકરણ' : 'Chapter'} {activeChapter + 1} of {CHAPTERS.length}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                      {getTitle(currentCh)}
                    </h3>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      {getDesc(currentCh)}
                    </p>

                    {/* Step pills */}
                    <div className="grid grid-cols-1 gap-2 w-full text-left">
                      {currentCh.steps.map((st, i) => (
                        <div key={i} className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 flex items-start gap-2.5 text-xs text-slate-200">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{lang === 'hi' ? st.hi : lang === 'gu' ? st.gu : st.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subtitles Overlay if enabled */}
                  {showCaptions && (
                    <div className="bg-black/80 backdrop-blur border border-white/10 rounded-lg px-4 py-2 text-center text-xs text-yellow-300 font-medium z-10 max-w-2xl mx-auto mb-2">
                      <span className="font-bold text-white mr-1">[CC]:</span>
                      {getDesc(currentCh)}
                    </div>
                  )}
                </>
              )}

              {/* Bottom Video Controls Bar */}
              <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 mt-4 z-10 flex flex-col gap-2">
                {/* Scrubber */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400 w-10 text-right">{formatSeconds(progress)}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="600" 
                    value={progress}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-10">10:00</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSelectChapter(Math.max(0, activeChapter - 1))}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title="Previous Chapter"
                    >
                      <SkipBack size={16} />
                    </button>

                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition shadow flex items-center justify-center"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={16} className="fill-slate-950" /> : <Play size={16} className="fill-slate-950 translate-x-0.5" />}
                    </button>

                    <button 
                      onClick={() => handleSelectChapter(Math.min(CHAPTERS.length - 1, activeChapter + 1))}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title="Next Chapter"
                    >
                      <SkipForward size={16} />
                    </button>

                    <button 
                      onClick={() => { setProgress(0); setActiveChapter(0); setIsPlaying(true); }}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title="Restart Video"
                    >
                      <RotateCcw size={15} />
                    </button>

                    <div className="h-4 w-px bg-slate-700 mx-1" />

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speed Selector */}
                    <button 
                      onClick={() => setPlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {playbackSpeed}x
                    </button>

                    {/* Captions Toggle */}
                    <button 
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                        showCaptions ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-transparent'
                      }`}
                    >
                      CC
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Chapters Menu */}
            <div className="w-full lg:w-80 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800 flex justify-between items-center">
                <span>{lang === 'hi' ? 'वीडियो अध्याय' : lang === 'gu' ? 'વિડિઓ પ્રકરણો' : 'Demo Chapters'}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">8 Chapters</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 mt-3 pr-1 max-h-[340px] lg:max-h-[420px]">
                {CHAPTERS.map((ch, idx) => {
                  const Icon = ch.icon
                  const isActive = activeChapter === idx
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 border ${
                        isActive 
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-white' 
                          : 'bg-slate-800/40 border-transparent hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-0.5">
                          <span className={isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{ch.time}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{ch.badge}</span>
                        </div>
                        <div className="text-xs font-bold truncate leading-tight">{getTitle(ch)}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <Link
                  to={currentCh.route}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>{lang === 'hi' ? 'इस पेज पर सीधे जाएं' : lang === 'gu' ? 'સીધા આ પેજ પર જાઓ' : 'Navigate To Feature Page'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: STEP-BY-STEP DETAILED GUIDELINES */}
        <section id="feature-guidelines" className="scroll-mt-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              <BookOpen size={16} />
              {lang === 'hi' ? 'विस्तृत उपयोग निर्देश' : lang === 'gu' ? 'વિગતવાર ઉપયોગ માર્ગદર્શિકા' : 'Standard Operating Procedures'}
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mt-1">
              {lang === 'hi' ? 'प्रत्येक सुविधा का चरण-दर-चरण उपयोग' : lang === 'gu' ? 'દરેક સુવિધાનો સ્ટેપ-બાય-સ્ટેપ ઉપયોગ' : 'Feature-by-Feature Operational Guidelines'}
            </h2>
            <p className="text-sm text-[#64748B]">
              {lang === 'hi' ? 'खेत में अधिकतम लाभ और सटीकता प्राप्त करने के लिए अनुशंसित सर्वोत्तम अभ्यास।' : 
               lang === 'gu' ? 'ખેતરમાં શ્રેષ્ઠ પરિણામ અને ચોકસાઈ મેળવવા માટે ભલામણ કરેલ પદ્ધતિઓ.' : 
               'Recommended field practices to maximize yield, save input costs, and protect crops from severe weather.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CHAPTERS.map((ch, idx) => {
              const Icon = ch.icon
              return (
                <div key={ch.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-[#E8F5E9] text-[#1B4332] rounded-xl">
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{ch.badge}</div>
                          <h3 className="text-base font-bold text-[#0F172A]">{getTitle(ch)}</h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                        Step {idx + 1}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed mb-4">
                      {getDesc(ch)}
                    </p>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 mb-4">
                      <div className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb size={13} />
                        {lang === 'hi' ? 'कार्यान्वयन के चरण' : lang === 'gu' ? 'અમલ કરવાના પગલાં' : 'Action Steps'}
                      </div>
                      {ch.steps.map((st, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                          <span className="w-4 h-4 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{lang === 'hi' ? st.hi : lang === 'gu' ? st.gu : st.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link 
                    to={ch.route}
                    className="inline-flex items-center justify-between text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] pt-2 border-t border-[#F1F5F9]"
                  >
                    <span>{lang === 'hi' ? 'इस टूल का उपयोग करें' : lang === 'gu' ? 'આ ટૂલનો ઉપયોગ કરો' : 'Launch Feature Tool'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* SECTION 3: KISAN EMERGENCY HELPLINE & SOS CONTACTS */}
        <section id="helpline" className="scroll-mt-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-bold tracking-wide">
              <Phone size={13} />
              {lang === 'hi' ? '24x7 राष्ट्रीय किसान हेल्पलाइन' : lang === 'gu' ? '24x7 રાષ્ટ્રીય કિસાન હેલ્પલાઇન' : '24x7 National Agricultural Support'}
            </div>
            <h3 className="text-2xl font-black">
              {lang === 'hi' ? 'कोई संदेह या तत्काल कृषि समस्या है?' : 
               lang === 'gu' ? 'કોઈ પ્રશ્ન કે તાત્કાલિક ખેતી સમસ્યા છે?' : 
               'Need Immediate Agricultural Guidance in the Field?'}
            </h3>
            <p className="text-sm text-amber-100 max-w-xl">
              {lang === 'hi' ? 'भारत सरकार और गुजरात कृषि विभाग के विशेषज्ञ कृषि वैज्ञानिकों से सीधे अपनी मातृभाषा में निःशुल्क परामर्श लें।' :
               lang === 'gu' ? 'સરકારી કૃષિ વૈજ્ઞાનિકો સાથે તમારી માતૃભાષામાં વિનામૂલ્યે સીધી વાત કરો.' :
               'Speak directly with certified agronomists and meteorologists from the Ministry of Agriculture in your native language.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a 
              href="tel:18001801551" 
              className="px-5 py-3 rounded-xl bg-white text-slate-900 font-black text-sm hover:bg-amber-100 transition shadow flex items-center justify-center gap-2"
            >
              <Phone size={18} className="text-amber-600" />
              <span>1800-180-1551 (Toll Free)</span>
            </a>
            <a 
              href="tel:18002331550" 
              className="px-5 py-3 rounded-xl bg-black/30 hover:bg-black/40 text-white font-bold text-sm transition flex items-center justify-center gap-2 border border-white/20"
            >
              <Phone size={16} />
              <span>Gujarat Agri: 1800-233-1550</span>
            </a>
          </div>
        </section>

        {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
        <section id="faqs" className="scroll-mt-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              <HelpCircle size={16} />
              {lang === 'hi' ? 'सामान्य प्रश्नोत्तर' : lang === 'gu' ? 'સામાન્ય પ્રશ્નોત્તરી' : 'Farmer Questions & Answers'}
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mt-1">
              {lang === 'hi' ? 'अक्सर पूछे जाने वाले सवाल (FAQ)' : lang === 'gu' ? 'વારંવાર પૂછાતા પ્રશ્નો (FAQ)' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              const q = lang === 'hi' ? faq.qHi : lang === 'gu' ? faq.qGu : faq.qEn
              const a = lang === 'hi' ? faq.aHi : lang === 'gu' ? faq.aGu : faq.aEn
              return (
                <div 
                  key={index}
                  className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 md:p-5 flex justify-between items-center gap-4 hover:bg-[#F8FAFC] transition"
                  >
                    <span className="font-bold text-sm md:text-base text-[#0F172A]">{q}</span>
                    <span className="p-1 rounded-full bg-[#F1F5F9] text-[#64748B] shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 md:px-5 pb-5 pt-1 text-xs md:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] bg-[#FAFAFA]">
                      {a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
