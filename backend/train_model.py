import os, sys, time, json, logging, argparse
from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import lightgbm as lgb
import joblib
try:
    from sklearn.metrics import root_mean_squared_error
except ImportError:
    from sklearn.metrics import mean_squared_error
    def root_mean_squared_error(y_true, y_pred):
        return float(mean_squared_error(y_true, y_pred) ** 0.5)

sys.path.insert(0, str(Path(__file__).parent))
from data_fetcher import fetch_historical_data, BLOCK_CENTROIDS, fetch_elevation
from downscaler import haversine_km

logging.basicConfig(level=logging.INFO)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--quick', action='store_true', help='Use 30 days instead of 365')
    args = parser.parse_args()
    
    days = 30 if args.quick else 365
    end_date = datetime.now() - timedelta(days=3)
    start_date = end_date - timedelta(days=days-1)
    sd_str = start_date.strftime('%Y-%m-%d')
    ed_str = end_date.strftime('%Y-%m-%d')
    
    panchayats_path = Path(__file__).parent.parent / 'data' / 'panchayats.csv'
    df_p = pd.read_csv(panchayats_path)
    
    # 80% train split
    np.random.seed(42)
    train_indices = np.random.choice(len(df_p), int(0.8 * len(df_p)), replace=False)
    df_train = df_p.iloc[train_indices]
    
    # Fetch block data
    block_data = {}
    for bname, bcoords in BLOCK_CENTROIDS.items():
        logging.info(f"Fetching block {bname}")
        b_df = fetch_historical_data(bcoords['lat'], bcoords['lon'], sd_str, ed_str, f"train_block_{bname}")
        block_data[bname] = b_df
        time.sleep(0.5)
        
    elevs = fetch_elevation([b['lat'] for b in BLOCK_CENTROIDS.values()], [b['lon'] for b in BLOCK_CENTROIDS.values()])
    block_elevs = {bname: elevs.get(f"{bcoords['lat']:.4f},{bcoords['lon']:.4f}", 60.0) for bname, bcoords in BLOCK_CENTROIDS.items()}
    
    X_list = []
    Y_list = {'temperature': [], 'humidity': [], 'rainfall': [], 'wind_speed': []}
    
    for _, row in df_train.iterrows():
        plat, plon, pelev = row['lat'], row['lon'], row.get('elevation', 60.0)
        logging.info(f"Fetching actual for {row['name']}")
        act_df = fetch_historical_data(plat, plon, sd_str, ed_str, f"train_actual_{row['panchayat_id']}")
        time.sleep(0.5)
        if act_df.empty:
            logging.warning(f"Skip {row['name']}, no data")
            continue
            
        nearest_block = min(BLOCK_CENTROIDS.keys(), key=lambda b: haversine_km(plat, plon, BLOCK_CENTROIDS[b]['lat'], BLOCK_CENTROIDS[b]['lon']))
        raw_df = block_data[nearest_block]
        ref_elev = block_elevs[nearest_block]
        elev_diff = pelev - ref_elev
        
        n = min(len(act_df), len(raw_df))
        for i in range(n):
            dt = pd.to_datetime(act_df['time'].iloc[i])
            
            # features: [block_T, block_RH, block_rain, block_wind, elev_diff, lat, lon, month, hour, day_of_year]
            f = [
                raw_df['temperature_2m'].iloc[i],
                raw_df['relative_humidity_2m'].iloc[i],
                raw_df['precipitation'].iloc[i],
                raw_df['wind_speed_10m'].iloc[i],
                elev_diff, plat, plon,
                dt.month, dt.hour, dt.dayofyear
            ]
            X_list.append(f)
            
            Y_list['temperature'].append(act_df['temperature_2m'].iloc[i])
            Y_list['humidity'].append(act_df['relative_humidity_2m'].iloc[i])
            Y_list['rainfall'].append(act_df['precipitation'].iloc[i])
            Y_list['wind_speed'].append(act_df['wind_speed_10m'].iloc[i])
            
    X_arr = np.array(X_list)
    
    models_dir = Path(__file__).parent / 'models'
    models_dir.mkdir(exist_ok=True)
    
    meta = {
        'trained_at': datetime.now().isoformat(),
        'n_samples': len(X_arr),
        'variables': ['temperature', 'humidity', 'rainfall', 'wind_speed'],
        'rmse_per_variable': {},
        'days_used': days,
        'n_panchayats': len(df_train)
    }
    
    split_idx = int(0.8 * len(X_arr))
    if split_idx == 0:
        logging.error("No data collected")
        return
        
    X_train, X_test = X_arr[:split_idx], X_arr[split_idx:]
    
    for var in meta['variables']:
        logging.info(f"Training {var}")
        Y_arr = np.array(Y_list[var])
        y_train, y_test = Y_arr[:split_idx], Y_arr[split_idx:]
        
        model = lgb.LGBMRegressor(n_estimators=500, learning_rate=0.05, num_leaves=31)
        try:
            model.fit(X_train, y_train, eval_X=X_test, eval_y=y_test, eval_metric='rmse',
                      callbacks=[lgb.early_stopping(50, verbose=False)])
        except TypeError:
            # Fallback for older LightGBM versions
            model.fit(X_train, y_train, eval_set=[(X_test, y_test)], eval_metric='rmse',
                      callbacks=[lgb.early_stopping(50, verbose=False)])
        
        preds = model.predict(X_test)
        rmse = root_mean_squared_error(y_test, preds)
        meta['rmse_per_variable'][var] = float(rmse)
        
        joblib.dump(model, models_dir / f'lgbm_{var}.joblib')
        
    with open(models_dir / 'training_meta.json', 'w') as f:
        json.dump(meta, f)
        
    print("\nTraining Summary:")
    print(f"Samples: {meta['n_samples']}, Days: {days}")
    for k, v in meta['rmse_per_variable'].items():
        print(f"{k}: RMSE {v:.3f}")

if __name__ == '__main__':
    main()
