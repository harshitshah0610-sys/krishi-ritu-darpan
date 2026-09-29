CROP_RULES = {
    'cotton': [
        (lambda f: max(f.get('daily', {}).get('temp_max', [0])) > 38,
         'Apply shade nets and increase irrigation frequency', 'छाया जाल लगाएं और सिंचाई बढ़ाएं', 'છાયા જાળ લગાવો અને સિંચાઈ વધારો'),
        (lambda f: max(f.get('daily', {}).get('wind_max', [0])) < 15 and sum(f.get('daily', {}).get('rainfall_sum', [0])) == 0,
         'Favorable conditions for pesticide spray', 'कीटनाशक छिड़काव के लिए अनुकूल समय', 'જંતુનાશક છંટકાવ માટે અનુકૂળ સમય'),
        (lambda f: max(f.get('daily', {}).get('humidity_avg', [0])) > 80 and sum(f.get('daily', {}).get('rainfall_sum', [0])) > 10,
         'Risk of fungal disease — apply fungicide', 'फफूंद रोग का खतरा — कवकनाशी का प्रयोग करें', 'ફૂગના રોગનો ખતરો — ફૂગનાશકનો ઉપયોગ કરો'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0])) == 0 and max(f.get('daily', {}).get('temp_max', [0])) > 35,
         'Maintain moisture at boll development stage', 'गूलर विकास के समय नमी बनाए रखें', 'બોલ વિકાસ સમયે ભેજ જાળવી રાખો'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0])) > 50,
         'Ensure proper drainage to avoid waterlogging', 'जलभराव से बचने के लिए उचित जल निकासी सुनिश्चित करें', 'જળભરાવ ટાળવા યોગ્ય જળ નિકાસ સુનિશ્ચિત કરો'),
    ],
    'wheat': [
        (lambda f: min(f.get('daily', {}).get('temp_min', [10])) < 5,
         'Risk of frost damage — cover young wheat plants', 'पाले का खतरा — गेहूं की फसल ढकें', 'હિમ નુકસાનનો ખતરો — ઘઉં ઢાંકો'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0][:3])) == 0,
         'Good conditions for wheat harvest', 'गेहूं की कटाई के लिए अच्छा समय', 'ઘઉ કાપણી માટે સારો સમય'),
        (lambda f: max(f.get('daily', {}).get('temp_max', [0])) > 30,
         'Provide light irrigation to prevent terminal heat stress', 'अंतिम गर्मी से बचाव के लिए हल्की सिंचाई करें', 'અંતિમ ગરમીથી બચવા હળવી સિંચાઈ આપો'),
        (lambda f: max(f.get('daily', {}).get('humidity_avg', [0])) > 85,
         'High humidity may cause rust disease — monitor crop', 'उच्च आर्द्रता से रतुआ रोग हो सकता है — निगरानी रखें', 'વધુ ભેજથી ગેરુ રોગ થઈ શકે છે — પાક પર નજર રાખો'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0])) > 20,
         'Postpone irrigation due to expected rainfall', 'बारिश की संभावना के कारण सिंचाई स्थगित करें', 'વરસાદની શક્યતાને કારણે સિંચાઈ મોકૂફ રાખો'),
    ],
    'bajra': [
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0][:5])) == 0 and max(f.get('daily', {}).get('temp_max', [0])) > 35,
         'Irrigate bajra immediately', 'बाजरे की तुरंत सिंचाई करें', 'બાજરો તરત સિંચો'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0])) > 30,
         'Avoid water stagnation in bajra fields', 'बाजरे के खेत में जलभराव से बचें', 'બાજરાના ખેતરમાં પાણી ભરાવવાનું ટાળો'),
        (lambda f: max(f.get('daily', {}).get('wind_max', [0])) > 30,
         'Protect tall plants from lodging due to high winds', 'तेज हवाओं से पौधों को गिरने से बचाएं', 'વધુ પવનને કારણે ઊંચા છોડને પડતા બચાવો'),
        (lambda f: max(f.get('daily', {}).get('humidity_avg', [0])) < 40 and max(f.get('daily', {}).get('temp_max', [0])) > 38,
         'Heat stress possible — apply life-saving irrigation', 'गर्मी का तनाव संभव — जीवन रक्षक सिंचाई दें', 'ગરમીનું તાણ સંભવ — જીવન રક્ષક સિંચાઈ આપો'),
        (lambda f: max(f.get('daily', {}).get('temp_min', [15])) < 10,
         'Cold night temps may slow growth', 'रात में कम तापमान विकास धीमा कर सकता है', 'રાત્રે ઓછું તાપમાન વૃદ્ધિ ધીમી કરી શકે છે'),
    ],
    'groundnut': [
        (lambda f: 60 <= sum(f.get('daily', {}).get('humidity_avg', [60]))/max(1, len(f.get('daily', {}).get('humidity_avg', [1]))) <= 80,
         'Ideal conditions for pod filling', 'फली भरने के लिए आदर्श परिस्थितियां', 'શींગ ભરાવા માટે આદર્શ સ્થિતિ'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0])) > 40,
         'Excess rain may cause collar rot — ensure drainage', 'अधिक बारिश से कॉलर रॉट हो सकता है — जल निकासी करें', 'વધુ વરસાદથી કોલર રોટ થઈ શકે છે — જળ નિકાસ કરો'),
        (lambda f: sum(f.get('daily', {}).get('rainfall_sum', [0])) == 0 and max(f.get('daily', {}).get('temp_max', [0])) > 37,
         'Moisture stress during pegging — irrigate', 'पेगिंग के समय नमी की कमी — सिंचाई करें', 'પેગિંગ સમયે ભેજની અછત — સિંચાઈ કરો'),
        (lambda f: max(f.get('daily', {}).get('humidity_avg', [0])) > 85 and min(f.get('daily', {}).get('temp_min', [0])) > 20,
         'Favorable for tikka disease — spray preventative', 'टिक्का रोग के लिए अनुकूल — निवारक स्प्रे करें', 'ટિક્કા રોગ માટે અનુકૂળ — નિવારક છંટકાવ કરો'),
        (lambda f: max(f.get('daily', {}).get('wind_max', [0])) < 10 and sum(f.get('daily', {}).get('rainfall_sum', [0])) == 0,
         'Good time for weeding and interculture', 'निराई और अंतर-कृषि के लिए अच्छा समय', 'નિંદામણ અને આંતરખેડ માટે સારો સમય'),
    ],
}

def generate_advisory(panchayat: dict, forecast: dict, crop: str = None) -> dict:
    """Returns {'crop': str, 'rules_triggered': [str], 'en': str, 'hi': str, 'gu': str}"""
    if crop is None:
        crop = panchayat.get('primary_crop', 'cotton').lower()
        
    rules = CROP_RULES.get(crop, [])
    triggered_en = []
    triggered_hi = []
    triggered_gu = []
    
    for cond_fn, en, hi, gu in rules:
        try:
            if cond_fn(forecast):
                triggered_en.append(en)
                triggered_hi.append(hi)
                triggered_gu.append(gu)
        except Exception as e:
            pass
            
    if not triggered_en:
        triggered_en.append('Weather conditions are normal for this crop.')
        triggered_hi.append('इस फसल के लिए मौसम की स्थिति सामान्य है।')
        triggered_gu.append('આ પાક માટે હવામાનની સ્થિતિ સામાન્ય છે.')
        
    return {
        'crop': crop,
        'rules_triggered': triggered_en,
        'en': ' '.join(triggered_en),
        'hi': ' '.join(triggered_hi),
        'gu': ' '.join(triggered_gu)
    }
