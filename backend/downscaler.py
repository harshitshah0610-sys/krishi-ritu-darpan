import numpy as np
import pandas as pd
import joblib
import logging
from pathlib import Path
from typing import Optional

MODELS_DIR = Path(__file__).parent / 'models'
VARIABLES = ['temperature', 'humidity', 'rainfall', 'wind_speed']


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Haversine distance in km between two points."""
    R = 6371.0
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlambda/2)**2
    return R * 2 * np.arcsin(np.sqrt(a))


def lapse_rate_correction(t_block: float, elev_panchayat: float, elev_block: float) -> float:
    """Standard environmental lapse rate: -6.5 C per 1000m.
    T_p = T_block + (-0.0065 * (elev_p - elev_block))"""
    return t_block + (-0.0065 * (elev_panchayat - elev_block))


def idw_interpolate(target_lat: float, target_lon: float,
                    block_data: dict, variable: str,
                    power: float = 2, n_nearest: int = 3) -> float:
    """IDW from n nearest blocks.
    block_data: {block_name: {'lat': float, 'lon': float, variable: float}}
    Returns interpolated value."""
    # compute distances
    distances = []
    for bname, bdata in block_data.items():
        if variable not in bdata:
            continue
        d = haversine_km(target_lat, target_lon, bdata['lat'], bdata['lon'])
        distances.append((d, bdata[variable], bname))
    distances.sort(key=lambda x: x[0])
    distances = distances[:n_nearest]
    if not distances:
        return 0.0
    # exact hit
    if distances[0][0] < 1e-6:
        return distances[0][1]
    weights = [1.0 / (d**power) for d, v, _ in distances]
    total_w = sum(weights)
    return sum(w * v for w, (d, v, _) in zip(weights, distances)) / total_w


def orographic_rainfall_factor(rain_block: float, elev_panchayat: float, elev_block: float) -> float:
    """Orographic enhancement: factor = 1 + 0.0001 * clip(Δelev, -500, 500)"""
    delta = float(np.clip(elev_panchayat - elev_block, -500, 500))
    factor = 1.0 + 0.0001 * delta
    return max(0.0, rain_block * factor)


def load_ml_models() -> dict:
    """Load saved LightGBM models. Returns {variable: model} or {} if not found."""
    models = {}
    for var in VARIABLES:
        model_path = MODELS_DIR / f'lgbm_{var}.joblib'
        if model_path.exists():
            try:
                models[var] = joblib.load(model_path)
                logging.info(f'Loaded ML model for {var}')
            except Exception as e:
                logging.warning(f'Could not load model for {var}: {e}')
    return models


def build_feature_vector(block_vals: dict, elev_diff: float, lat: float,
                          lon: float, month: int, hour: int, day_of_year: int) -> np.ndarray:
    """Build feature vector for ML model.
    Features: [block_T, block_RH, block_rain, block_wind, elev_diff, lat, lon, month, hour, day_of_year]"""
    return np.array([
        block_vals.get('temperature', 30.0),
        block_vals.get('humidity', 60.0),
        block_vals.get('rainfall', 0.0),
        block_vals.get('wind_speed', 10.0),
        elev_diff, lat, lon, month, hour, day_of_year
    ]).reshape(1, -1)


def ml_bias_correct(features_arr: np.ndarray, variable: str, models: dict) -> float:
    """Apply LightGBM bias correction for one variable. Returns corrected float."""
    if variable not in models:
        return None  # signal: no model, use physics value
    try:
        return float(models[variable].predict(features_arr)[0])
    except Exception as e:
        logging.warning(f'ML correction failed for {variable}: {e}')
        return None


def downscale_panchayat(panchayat: dict, block_forecasts: dict,
                         elevation_cache: dict, models: dict = None) -> dict:
    """Full downscaling pipeline for one panchayat.
    Returns dict: {hourly: {temperature: [...], humidity: [...], rainfall: [...], wind_speed: [...]},
                   daily: {temp_max: [...], temp_min: [...], rainfall_sum: [...], wind_max: [...]}}"""
    if models is None:
        models = {}

    p_lat = panchayat['lat']
    p_lon = panchayat['lon']
    p_elev = float(panchayat.get('elevation', 60))

    # Get block elevations from cache
    block_elevs = {}
    from data_fetcher import BLOCK_CENTROIDS
    for bname, bcoords in BLOCK_CENTROIDS.items():
        elev_key = f"{bcoords['lat']:.4f},{bcoords['lon']:.4f}"
        block_elevs[bname] = elevation_cache.get(elev_key, 60.0)

    # Find nearest block for reference lapse-rate correction
    nearest_block = min(BLOCK_CENTROIDS.keys(),
                        key=lambda b: haversine_km(p_lat, p_lon,
                                                   BLOCK_CENTROIDS[b]['lat'],
                                                   BLOCK_CENTROIDS[b]['lon']))
    ref_elev = block_elevs.get(nearest_block, 60.0)
    elev_diff = p_elev - ref_elev

    # Extract hourly arrays from block forecasts
    # Get hourly length from first block
    first_block = next(iter(block_forecasts.values()))
    n_hours = len(first_block.get('hourly', {}).get('time', []))
    times = first_block.get('hourly', {}).get('time', [])

    hourly_out = {'time': times, 'temperature': [], 'humidity': [], 'rainfall': [], 'wind_speed': []}

    for i in range(n_hours):
        # Build per-block value dict for IDW
        block_point_data = {}
        for bname, bforecast in block_forecasts.items():
            hourly = bforecast.get('hourly', {})
            block_point_data[bname] = {
                'lat': BLOCK_CENTROIDS[bname]['lat'],
                'lon': BLOCK_CENTROIDS[bname]['lon'],
                'temperature': hourly.get('temperature_2m', [30.0]*n_hours)[i] if i < len(hourly.get('temperature_2m', [])) else 30.0,
                'humidity': hourly.get('relative_humidity_2m', [60.0]*n_hours)[i] if i < len(hourly.get('relative_humidity_2m', [])) else 60.0,
                'rainfall': hourly.get('precipitation', [0.0]*n_hours)[i] if i < len(hourly.get('precipitation', [])) else 0.0,
                'wind_speed': hourly.get('wind_speed_10m', [10.0]*n_hours)[i] if i < len(hourly.get('wind_speed_10m', [])) else 10.0,
            }

        # IDW interpolation
        t_idw = idw_interpolate(p_lat, p_lon, block_point_data, 'temperature')
        rh_idw = idw_interpolate(p_lat, p_lon, block_point_data, 'humidity')
        rain_idw = idw_interpolate(p_lat, p_lon, block_point_data, 'rainfall')
        wind_idw = idw_interpolate(p_lat, p_lon, block_point_data, 'wind_speed')

        # Lapse-rate correction for temperature
        t_physics = lapse_rate_correction(t_idw, p_elev, ref_elev)

        # Orographic rainfall
        rain_physics = orographic_rainfall_factor(rain_idw, p_elev, ref_elev)

        # Parse time for ML features
        try:
            dt = pd.to_datetime(times[i])
            month = dt.month
            hour = dt.hour
            doy = dt.day_of_year
        except:
            month, hour, doy = 1, 12, 1

        # ML bias correction
        block_vals_for_ml = {
            'temperature': block_point_data[nearest_block]['temperature'],
            'humidity': block_point_data[nearest_block]['humidity'],
            'rainfall': block_point_data[nearest_block]['rainfall'],
            'wind_speed': block_point_data[nearest_block]['wind_speed'],
        }
        feat = build_feature_vector(block_vals_for_ml, elev_diff, p_lat, p_lon, month, hour, doy)

        t_ml = ml_bias_correct(feat, 'temperature', models)
        rh_ml = ml_bias_correct(feat, 'humidity', models)
        rain_ml = ml_bias_correct(feat, 'rainfall', models)
        wind_ml = ml_bias_correct(feat, 'wind_speed', models)

        # Use ML output if available, else physics
        hourly_out['temperature'].append(round(t_ml if t_ml is not None else t_physics, 2))
        hourly_out['humidity'].append(round(rh_ml if rh_ml is not None else rh_idw, 1))
        hourly_out['rainfall'].append(round(max(0, rain_ml if rain_ml is not None else rain_physics), 2))
        hourly_out['wind_speed'].append(round(max(0, wind_ml if wind_ml is not None else wind_idw), 1))

    # Compute daily summaries from hourly
    daily_out = {'date': [], 'temp_max': [], 'temp_min': [], 'rainfall_sum': [], 'wind_max': [], 'humidity_avg': []}
    if times:
        df_h = pd.DataFrame(hourly_out)
        df_h['date'] = pd.to_datetime(df_h['time']).dt.date
        daily = df_h.groupby('date').agg(
            temp_max=('temperature', 'max'),
            temp_min=('temperature', 'min'),
            rainfall_sum=('rainfall', 'sum'),
            wind_max=('wind_speed', 'max'),
            humidity_avg=('humidity', 'mean')
        ).reset_index()
        daily_out = daily.to_dict(orient='list')
        daily_out['date'] = [str(d) for d in daily_out['date']]

    return {'hourly': hourly_out, 'daily': daily_out}


def compute_difference(block_forecast: dict, downscaled: dict) -> dict:
    """Compute element-wise difference: downscaled - block, for each variable."""
    diff = {}
    b_hourly = block_forecast.get('hourly', {})
    d_hourly = downscaled.get('hourly', {})
    for var in ['temperature', 'humidity', 'rainfall', 'wind_speed']:
        # Map block variable names to downscaled names
        bkey_map = {'temperature': 'temperature_2m', 'humidity': 'relative_humidity_2m',
                    'rainfall': 'precipitation', 'wind_speed': 'wind_speed_10m'}
        b_vals = b_hourly.get(bkey_map.get(var, var), [])
        d_vals = d_hourly.get(var, [])
        n = min(len(b_vals), len(d_vals))
        diff[var] = [round(d_vals[i] - b_vals[i], 2) for i in range(n)]
    return diff
