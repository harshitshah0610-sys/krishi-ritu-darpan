import os, json, time, logging, requests
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import numpy as np

CACHE_DIR = Path(__file__).parent / 'cache'
CACHE_TTL_SECONDS = 1800  # 30 min
OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast'
OPEN_METEO_ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive'
OPEN_METEO_ELEVATION = 'https://api.open-meteo.com/v1/elevation'

# Initialize BLOCK_CENTROIDS
BLOCK_CENTROIDS = {}
try:
    csv_path = Path(__file__).parent.parent / 'data' / 'panchayats.csv'
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        grouped = df.groupby('block')[['lat', 'lon']].mean()
        for block, row in grouped.iterrows():
            BLOCK_CENTROIDS[block] = {'lat': row['lat'], 'lon': row['lon']}
except Exception as e:
    logging.warning(f"Could not load block centroids: {e}")

if not CACHE_DIR.exists():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

def _cache_path(key: str) -> Path:
    return CACHE_DIR / f'{key}.json'

def _load_cache(key: str) -> dict | None:
    path = _cache_path(key)
    if not path.exists():
        return None
    try:
        mtime = path.stat().st_mtime
        if time.time() - mtime < CACHE_TTL_SECONDS:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logging.warning(f"Cache load failed for {key}: {e}")
    return None

def _save_cache(key: str, data: dict):
    path = _cache_path(key)
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f)
    except Exception as e:
        logging.warning(f"Cache save failed for {key}: {e}")

def _get_with_retry(url: str, params: dict, max_retries=3) -> dict:
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                logging.error(f"API request failed after {max_retries} attempts: {url} {params}")
                raise e
            time.sleep(2 ** attempt)
    return {}

def fetch_elevation(lats: list, lons: list) -> dict:
    cache_key = 'elevation_cache'
    cached = _load_cache(cache_key) or {}
    
    missing_lats = []
    missing_lons = []
    keys = []
    for lat, lon in zip(lats, lons):
        k = f"{lat:.4f},{lon:.4f}"
        keys.append(k)
        if k not in cached:
            missing_lats.append(lat)
            missing_lons.append(lon)
            
    if missing_lats:
        # Batch by 100
        for i in range(0, len(missing_lats), 100):
            batch_lats = missing_lats[i:i+100]
            batch_lons = missing_lons[i:i+100]
            try:
                params = {
                    'latitude': ','.join(map(str, batch_lats)),
                    'longitude': ','.join(map(str, batch_lons))
                }
                res = _get_with_retry(OPEN_METEO_ELEVATION, params)
                elevs = res.get('elevation', [])
                for bl, blo, el in zip(batch_lats, batch_lons, elevs):
                    cached[f"{bl:.4f},{blo:.4f}"] = el
            except Exception as e:
                logging.warning(f"Failed to fetch elevation batch: {e}")
                for bl, blo in zip(batch_lats, batch_lons):
                    cached[f"{bl:.4f},{blo:.4f}"] = 60.0 # fallback
        _save_cache(cache_key, cached)
        
    return {k: cached.get(k, 60.0) for k in keys}

def fetch_block_forecast(block_name: str, lat: float, lon: float, days: int = 7) -> dict:
    cache_key = f'forecast_{block_name}_{days}'
    cached = _load_cache(cache_key)
    if cached:
        return cached
        
    params = {
        'latitude': lat,
        'longitude': lon,
        'hourly': 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
        'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        'timezone': 'Asia/Kolkata',
        'forecast_days': days
    }
    try:
        data = _get_with_retry(OPEN_METEO_FORECAST, params)
        _save_cache(cache_key, data)
        return data
    except Exception as e:
        logging.error(f"Forecast fetch failed for {block_name}: {e}")
        fb = load_fallback_data()
        return fb.get(block_name, {})

def fetch_historical_data(lat: float, lon: float, start_date: str, end_date: str, location_key: str = None) -> pd.DataFrame:
    cache_key = f'hist_{location_key or f"{lat}_{lon}"}_{start_date}_{end_date}'
    cached = _load_cache(cache_key)
    if cached:
        return pd.DataFrame(cached)
        
    params = {
        'latitude': lat,
        'longitude': lon,
        'start_date': start_date,
        'end_date': end_date,
        'hourly': 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
        'timezone': 'Asia/Kolkata'
    }
    try:
        data = _get_with_retry(OPEN_METEO_ARCHIVE, params)
        if 'hourly' in data:
            df = pd.DataFrame(data['hourly'])
            _save_cache(cache_key, df.to_dict(orient='list'))
            return df
    except Exception as e:
        logging.error(f"Historical fetch failed for {lat},{lon}: {e}")
    return pd.DataFrame({'time': [], 'temperature_2m': [], 'relative_humidity_2m': [], 'precipitation': [], 'wind_speed_10m': []})

def get_all_block_forecasts(days: int = 7) -> dict:
    forecasts = {}
    for bname, coords in BLOCK_CENTROIDS.items():
        forecasts[bname] = fetch_block_forecast(bname, coords['lat'], coords['lon'], days)
    return forecasts

def load_fallback_data() -> dict:
    fallback_path = Path(__file__).parent / 'data' / 'sample_fallback.json'
    try:
        if fallback_path.exists():
            with open(fallback_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logging.warning(f"Failed to load fallback data: {e}")
    return {}
