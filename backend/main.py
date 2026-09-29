from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import json
import logging
import time
from pathlib import Path
from datetime import datetime, date
from typing import Optional

from data_fetcher import fetch_elevation, get_all_block_forecasts
from downscaler import downscale_panchayat, load_ml_models, compute_difference
from advisory import generate_advisory
from alerts import check_alerts
from disease_model import load_ai_models, predict_disease, predict_pest
from fastapi import UploadFile, File

logging.basicConfig(level=logging.INFO)

# Global state
app_state = {
    'panchayats_df': None,
    'elevation_cache': {},
    'models': {},
    'cache': {}  # {key: (timestamp, data)}
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    p_path = Path(__file__).parent.parent / 'data' / 'panchayats.csv'
    if p_path.exists():
        app_state['panchayats_df'] = pd.read_csv(p_path)
        # pre-fetch elevations
        lats = app_state['panchayats_df']['lat'].tolist()
        lons = app_state['panchayats_df']['lon'].tolist()
        app_state['elevation_cache'] = fetch_elevation(lats, lons)
    
    app_state['models'] = load_ml_models()
    load_ai_models()
    yield
    # Shutdown

app = FastAPI(
    title='Krishi Ritu Darpan API',
    description='Hyperlocal weather downscaling for Gram Panchayats — कृषि ऋतु दर्पण',
    version='1.0.0',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _get_cache(key: str):
    if key in app_state['cache']:
        ts, data = app_state['cache'][key]
        if time.time() - ts < 1800:
            return data
    return None

def _set_cache(key: str, data: dict):
    app_state['cache'][key] = (time.time(), data)

@app.get("/")
def read_root():
    return {'status': 'ok', 'project': 'Krishi Ritu Darpan', 'version': '1.0.0'}

@app.get("/api/panchayats")
def list_panchayats():
    if app_state['panchayats_df'] is None:
        raise HTTPException(status_code=500, detail="Panchayats data not loaded")
    return app_state['panchayats_df'].to_dict(orient='records')

@app.get("/api/forecast/{panchayat_id}")
def get_forecast(panchayat_id: str, days: int = 7, crop: Optional[str] = None):
    df = app_state['panchayats_df']
    if df is None:
        raise HTTPException(500, "Data not loaded")
    
    row = df[df['panchayat_id'] == panchayat_id]
    if row.empty:
        raise HTTPException(404, "Panchayat not found")
    
    panchayat = row.iloc[0].to_dict()
    
    cache_key = f"forecast_{panchayat_id}_{days}_{crop}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
        
    block_forecasts = get_all_block_forecasts(days)
    if not block_forecasts:
        raise HTTPException(500, "Failed to fetch block forecasts")
        
    downscaled = downscale_panchayat(panchayat, block_forecasts, app_state['elevation_cache'], app_state['models'])
    
    block_name = panchayat['block']
    b_forecast = block_forecasts.get(block_name, {})
    
    diff = compute_difference(b_forecast, downscaled)
    adv = generate_advisory(panchayat, downscaled, crop)
    alerts = check_alerts(downscaled)
    
    res = {
        "panchayat": panchayat,
        "block_name": block_name,
        "block_forecast": b_forecast,
        "downscaled_forecast": downscaled,
        "difference": diff,
        "advisory": adv,
        "alerts": alerts,
        "metadata": {
            "downscaling_method": "IDW+LapseRate+Orographic+LGBM",
            "ml_active": len(app_state['models']) > 0
        }
    }
    
    _set_cache(cache_key, res)
    return res

@app.get("/api/map")
def get_map(variable: str = 'temperature', date: str = Query(None)):
    df = app_state['panchayats_df']
    if df is None:
        raise HTTPException(500, "Data not loaded")

    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')

    cache_key = f"map_{variable}_{date}"
    cached = _get_cache(cache_key)
    if cached:
        return cached

    block_forecasts = get_all_block_forecasts(7)
    val_map = {'temperature': 'temp_max', 'rainfall': 'rainfall_sum',
               'wind_speed': 'wind_max', 'humidity': 'humidity_avg'}
    bkey = val_map.get(variable, 'temp_max')
    unit_map = {'temperature': 'C', 'rainfall': 'mm', 'humidity': '%', 'wind_speed': 'km/h'}

    from downscaler import haversine_km, lapse_rate_correction, orographic_rainfall_factor
    from data_fetcher import BLOCK_CENTROIDS

    # Build block daily snapshots (pick the requested date index)
    block_daily = {}
    for bname, bfc in block_forecasts.items():
        daily = bfc.get('daily', {})
        dates = daily.get('time', [])  # Open-Meteo uses 'time' for daily
        try:
            idx = dates.index(date)
        except ValueError:
            idx = 0  # fallback to first day
        block_daily[bname] = {
            'temp_max': (daily.get('temperature_2m_max') or [30.0]*7)[idx] if daily.get('temperature_2m_max') else 30.0,
            'rainfall_sum': (daily.get('precipitation_sum') or [0.0]*7)[idx] if daily.get('precipitation_sum') else 0.0,
            'wind_max': (daily.get('wind_speed_10m_max') or [10.0]*7)[idx] if daily.get('wind_speed_10m_max') else 10.0,
            'humidity_avg': ((daily.get('temperature_2m_max') or [60.0]*7)[idx]) if False else 65.0,  # RH not in daily; use fallback
        }

    # Block elevations
    elev_cache = app_state['elevation_cache']
    block_elevs = {}
    for bname, bcoords in BLOCK_CENTROIDS.items():
        key = f"{bcoords['lat']:.4f},{bcoords['lon']:.4f}"
        block_elevs[bname] = elev_cache.get(key, 60.0)

    res = []
    for _, row in df.iterrows():
        p = row.to_dict()
        p_lat, p_lon, p_elev = p['lat'], p['lon'], float(p.get('elevation', 60))

        # Find nearest block
        nearest = min(BLOCK_CENTROIDS.keys(),
                      key=lambda b: haversine_km(p_lat, p_lon, BLOCK_CENTROIDS[b]['lat'], BLOCK_CENTROIDS[b]['lon']))
        ref_elev = block_elevs.get(nearest, 60.0)
        base_val = block_daily[nearest][bkey]

        # Physics correction
        if variable == 'temperature':
            val = round(lapse_rate_correction(base_val, p_elev, ref_elev), 2)
        elif variable == 'rainfall':
            val = round(orographic_rainfall_factor(base_val, p_elev, ref_elev), 2)
        else:
            val = round(base_val, 2)

        res.append({
            'panchayat_id': p['panchayat_id'],
            'name': p['name'],
            'lat': p_lat,
            'lon': p_lon,
            'value': val,
            'unit': unit_map.get(variable, '')
        })

    _set_cache(cache_key, res)
    return res


@app.get("/api/metrics")
def get_metrics():
    import validation
    cache_path = validation.CACHE_PATH
    if cache_path.exists():
        with open(cache_path, 'r') as f:
            return json.load(f)
    if app_state['panchayats_df'] is not None:
        return validation.run_validation(app_state['panchayats_df'], holdout_fraction=0.2, days=7)
    return {}

@app.get("/api/compare/{panchayat_id}")
def get_compare(panchayat_id: str):
    res = get_forecast(panchayat_id)
    return {
        "panchayat": res["panchayat"],
        "block_daily": res["block_forecast"].get("daily", {}),
        "downscaled_daily": res["downscaled_forecast"]["daily"],
        "difference_daily": res["difference"],
        "elevation_diff": _get_real_elev_diff(res["panchayat"], res["block_name"]),
        "nearest_block": res["block_name"]
    }

def _get_real_elev_diff(panchayat: dict, block_name: str) -> float:
    """Compute real elevation difference between panchayat and its block centroid."""
    from data_fetcher import BLOCK_CENTROIDS
    p_elev = float(panchayat.get('elevation', 60))
    elev_cache = app_state['elevation_cache']
    bcoords = BLOCK_CENTROIDS.get(block_name, {})
    if bcoords:
        key = f"{bcoords['lat']:.4f},{bcoords['lon']:.4f}"
        b_elev = elev_cache.get(key, 60.0)
    else:
        b_elev = 60.0
    return round(p_elev - b_elev, 1)


@app.post("/api/disease-predict")
async def api_predict_disease(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pred_class, confidence = predict_disease(contents)
        return {"success": True, "prediction": pred_class, "confidence": confidence}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/pest-predict")
async def api_predict_pest(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pred_class, confidence = predict_pest(contents)
        return {"success": True, "prediction": pred_class, "confidence": confidence}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/monsoon/{panchayat_id}")
def get_monsoon(panchayat_id: str):
    df = app_state['panchayats_df']
    if df is None:
        raise HTTPException(500, "Data not loaded")
    
    row = df[df['panchayat_id'] == panchayat_id]
    if len(row) == 0:
        raise HTTPException(404, "Panchayat not found")
        
    panchayat = row.iloc[0].to_dict()
    block_name = panchayat['block']
    
    forecast_data = get_forecast(panchayat_id, days=14)
    downscaled = forecast_data.get('downscaled_forecast', {})
    
    from monsoon import analyze_monsoon
    result = analyze_monsoon(downscaled, block_name, panchayat['name'])
    return result
