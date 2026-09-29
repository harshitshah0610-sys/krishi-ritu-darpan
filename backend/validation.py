import numpy as np
import pandas as pd
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
import random

CACHE_PATH = Path(__file__).parent / 'cache' / 'validation_results.json'

def compute_rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Root Mean Square Error."""
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))

def compute_mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Mean Absolute Error."""
    return float(np.mean(np.abs(actual - predicted)))

def run_validation(panchayats_df: pd.DataFrame, holdout_fraction: float = 0.2,
                   days: int = 30) -> dict:
    """Holdout 20% panchayats, fetch 30 days archive for each,
    compare raw block value vs downscaled vs actual panchayat value.
    Returns comprehensive metrics dict."""
    from data_fetcher import fetch_historical_data, BLOCK_CENTROIDS, fetch_elevation
    from downscaler import haversine_km, lapse_rate_correction, orographic_rainfall_factor, idw_interpolate
    
    end_date = datetime.now() - timedelta(days=2) # 2 days ago to ensure data
    start_date = end_date - timedelta(days=days-1)
    sd_str = start_date.strftime('%Y-%m-%d')
    ed_str = end_date.strftime('%Y-%m-%d')
    
    n_total = len(panchayats_df)
    n_holdout = max(1, int(n_total * holdout_fraction))
    holdout_indices = random.sample(range(n_total), n_holdout)
    holdout_df = panchayats_df.iloc[holdout_indices]
    
    results = {
        'temperature': {'actual': [], 'raw': [], 'downscaled': []},
        'humidity': {'actual': [], 'raw': [], 'downscaled': []},
        'rainfall': {'actual': [], 'raw': [], 'downscaled': []},
        'wind_speed': {'actual': [], 'raw': [], 'downscaled': []},
    }
    
    # get block data
    block_data = {}
    for bname, bcoords in BLOCK_CENTROIDS.items():
        df = fetch_historical_data(bcoords['lat'], bcoords['lon'], sd_str, ed_str, f"val_block_{bname}")
        block_data[bname] = df
        
    elevs = fetch_elevation([b['lat'] for b in BLOCK_CENTROIDS.values()], [b['lon'] for b in BLOCK_CENTROIDS.values()])
    block_elevs = {bname: elevs.get(f"{bcoords['lat']:.4f},{bcoords['lon']:.4f}", 60.0) for bname, bcoords in BLOCK_CENTROIDS.items()}
    
    for _, row in holdout_df.iterrows():
        plat, plon, pelev = row['lat'], row['lon'], row.get('elevation', 60.0)
        
        # actual
        actual_df = fetch_historical_data(plat, plon, sd_str, ed_str, f"val_actual_{row['panchayat_id']}")
        if actual_df.empty:
            continue
            
        # find nearest block
        nearest_block = min(BLOCK_CENTROIDS.keys(), key=lambda b: haversine_km(plat, plon, BLOCK_CENTROIDS[b]['lat'], BLOCK_CENTROIDS[b]['lon']))
        raw_df = block_data[nearest_block]
        ref_elev = block_elevs[nearest_block]
        
        n = min(len(actual_df), len(raw_df))
        for i in range(n):
            actual_t = actual_df['temperature_2m'].iloc[i]
            actual_rh = actual_df['relative_humidity_2m'].iloc[i]
            actual_rain = actual_df['precipitation'].iloc[i]
            actual_wind = actual_df['wind_speed_10m'].iloc[i]
            
            raw_t = raw_df['temperature_2m'].iloc[i]
            raw_rh = raw_df['relative_humidity_2m'].iloc[i]
            raw_rain = raw_df['precipitation'].iloc[i]
            raw_wind = raw_df['wind_speed_10m'].iloc[i]
            
            # Physics downscale (no ML)
            block_point_data = {}
            for bname in BLOCK_CENTROIDS.keys():
                bdf = block_data[bname]
                if i < len(bdf):
                    block_point_data[bname] = {
                        'lat': BLOCK_CENTROIDS[bname]['lat'],
                        'lon': BLOCK_CENTROIDS[bname]['lon'],
                        'temperature': bdf['temperature_2m'].iloc[i],
                        'humidity': bdf['relative_humidity_2m'].iloc[i],
                        'rainfall': bdf['precipitation'].iloc[i],
                        'wind_speed': bdf['wind_speed_10m'].iloc[i],
                    }
            
            down_t = lapse_rate_correction(idw_interpolate(plat, plon, block_point_data, 'temperature'), pelev, ref_elev)
            down_rh = idw_interpolate(plat, plon, block_point_data, 'humidity')
            down_rain = orographic_rainfall_factor(idw_interpolate(plat, plon, block_point_data, 'rainfall'), pelev, ref_elev)
            down_wind = idw_interpolate(plat, plon, block_point_data, 'wind_speed')
            
            results['temperature']['actual'].append(actual_t)
            results['temperature']['raw'].append(raw_t)
            results['temperature']['downscaled'].append(down_t)
            
            results['humidity']['actual'].append(actual_rh)
            results['humidity']['raw'].append(raw_rh)
            results['humidity']['downscaled'].append(down_rh)
            
            results['rainfall']['actual'].append(actual_rain)
            results['rainfall']['raw'].append(raw_rain)
            results['rainfall']['downscaled'].append(down_rain)
            
            results['wind_speed']['actual'].append(actual_wind)
            results['wind_speed']['raw'].append(raw_wind)
            results['wind_speed']['downscaled'].append(down_wind)

    final_metrics = {}
    for var in ['temperature', 'humidity', 'rainfall', 'wind_speed']:
        act = np.array(results[var]['actual'])
        raw = np.array(results[var]['raw'])
        down = np.array(results[var]['downscaled'])
        
        if len(act) == 0:
            final_metrics[var] = {'rmse_raw': 0, 'rmse_downscaled': 0, 'mae_raw': 0, 'mae_downscaled': 0, 'pct_improvement_rmse': 0}
            continue
            
        rmse_raw = compute_rmse(act, raw)
        rmse_down = compute_rmse(act, down)
        mae_raw = compute_mae(act, raw)
        mae_down = compute_mae(act, down)
        
        imp = ((rmse_raw - rmse_down) / rmse_raw * 100) if rmse_raw > 0 else 0.0
        
        final_metrics[var] = {
            'rmse_raw': round(rmse_raw, 3),
            'rmse_downscaled': round(rmse_down, 3),
            'mae_raw': round(mae_raw, 3),
            'mae_downscaled': round(mae_down, 3),
            'pct_improvement_rmse': round(imp, 2)
        }
        
    out = {
        **final_metrics,
        'n_holdout_panchayats': n_holdout,
        'holdout_days': days,
        'computed_at': datetime.now().isoformat()
    }
    
    if not CACHE_PATH.parent.exists():
        CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(out, f)
        
    return out
