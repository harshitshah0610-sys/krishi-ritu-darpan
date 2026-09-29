ALERT_THRESHOLDS = {
    'heat_wave': {'temp_max': 40.0, 'severity': 'high'},
    'extreme_heat': {'temp_max': 45.0, 'severity': 'critical'},
    'heavy_rain': {'daily_rain_mm': 64.0, 'severity': 'high'},
    'very_heavy_rain': {'daily_rain_mm': 115.0, 'severity': 'critical'},
    'high_wind': {'wind_speed_kmh': 40.0, 'severity': 'medium'},
    'low_humidity': {'humidity_pct': 20.0, 'severity': 'medium'},
}

def check_alerts(forecast: dict) -> list:
    """Check downscaled forecast dict for alert conditions.
    Returns list of {type, severity, message_en, message_hi, message_gu, date, value}."""
    alerts = []
    daily = forecast.get('daily', {})
    
    dates = daily.get('date', [])
    tmax = daily.get('temp_max', [])
    rain = daily.get('rainfall_sum', [])
    wind = daily.get('wind_max', [])
    hum = daily.get('humidity_avg', [])
    
    n_days = len(dates)
    
    for i in range(n_days):
        d = dates[i]
        
        # extreme heat
        if i < len(tmax) and tmax[i] >= ALERT_THRESHOLDS['extreme_heat']['temp_max']:
            alerts.append({
                'type': 'extreme_heat', 'severity': ALERT_THRESHOLDS['extreme_heat']['severity'],
                'message_en': f'Extreme heat alert: {tmax[i]}°C',
                'message_hi': f'भीषण गर्मी की चेतावनी: {tmax[i]}°C',
                'message_gu': f'અતિશય ગરમીની ચેતવણી: {tmax[i]}°C',
                'date': d, 'value': tmax[i]
            })
        elif i < len(tmax) and tmax[i] >= ALERT_THRESHOLDS['heat_wave']['temp_max']:
            alerts.append({
                'type': 'heat_wave', 'severity': ALERT_THRESHOLDS['heat_wave']['severity'],
                'message_en': f'Heat wave alert: {tmax[i]}°C',
                'message_hi': f'लू की चेतावनी: {tmax[i]}°C',
                'message_gu': f'હીટ વેવની ચેતવણી: {tmax[i]}°C',
                'date': d, 'value': tmax[i]
            })
            
        # heavy rain
        if i < len(rain) and rain[i] >= ALERT_THRESHOLDS['very_heavy_rain']['daily_rain_mm']:
            alerts.append({
                'type': 'very_heavy_rain', 'severity': ALERT_THRESHOLDS['very_heavy_rain']['severity'],
                'message_en': f'Very heavy rain alert: {rain[i]}mm',
                'message_hi': f'बहुत भारी बारिश की चेतावनी: {rain[i]} मिमी',
                'message_gu': f'અતિ ભારે વરસાદની ચેતવણી: {rain[i]} મીમી',
                'date': d, 'value': rain[i]
            })
        elif i < len(rain) and rain[i] >= ALERT_THRESHOLDS['heavy_rain']['daily_rain_mm']:
            alerts.append({
                'type': 'heavy_rain', 'severity': ALERT_THRESHOLDS['heavy_rain']['severity'],
                'message_en': f'Heavy rain alert: {rain[i]}mm',
                'message_hi': f'भारी बारिश की चेतावनी: {rain[i]} मिमी',
                'message_gu': f'ભારે વરસાદની ચેતવણી: {rain[i]} મીમી',
                'date': d, 'value': rain[i]
            })
            
        # high wind
        if i < len(wind) and wind[i] >= ALERT_THRESHOLDS['high_wind']['wind_speed_kmh']:
            alerts.append({
                'type': 'high_wind', 'severity': ALERT_THRESHOLDS['high_wind']['severity'],
                'message_en': f'High wind alert: {wind[i]}km/h',
                'message_hi': f'तेज हवा की चेतावनी: {wind[i]} किमी/घंटा',
                'message_gu': f'ભારે પવનની ચેતવણી: {wind[i]} કિમી/કલાક',
                'date': d, 'value': wind[i]
            })
            
        # low humidity
        if i < len(hum) and hum[i] <= ALERT_THRESHOLDS['low_humidity']['humidity_pct']:
            alerts.append({
                'type': 'low_humidity', 'severity': ALERT_THRESHOLDS['low_humidity']['severity'],
                'message_en': f'Low humidity alert: {hum[i]}%',
                'message_hi': f'कम आर्द्रता की चेतावनी: {hum[i]}%',
                'message_gu': f'ઓછા ભેજની ચેતવણી: {hum[i]}%',
                'date': d, 'value': hum[i]
            })
            
    return alerts
