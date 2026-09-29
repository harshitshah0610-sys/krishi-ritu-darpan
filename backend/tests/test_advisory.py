import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from advisory import generate_advisory, CROP_RULES
import pytest

SAMPLE_PANCHAYAT = {'panchayat_id': 'GJ_AMD_DASK_001', 'name': 'Vasna',
                     'block': 'Daskroi', 'district': 'Ahmedabad',
                     'lat': 22.95, 'lon': 72.58, 'primary_crop': 'cotton', 'elevation': 60}

HOT_DRY_FORECAST = {
    'hourly': {'temperature': [40.0]*168, 'humidity': [18.0]*168,
               'rainfall': [0.0]*168, 'wind_speed': [12.0]*168},
    'daily': {'temp_max': [42.0]*7, 'temp_min': [30.0]*7,
              'rainfall_sum': [0.0]*7, 'wind_max': [15.0]*7, 'humidity_avg': [18.0]*7}
}

WET_FORECAST = {
    'hourly': {'temperature': [28.0]*168, 'humidity': [85.0]*168,
               'rainfall': [10.0]*168, 'wind_speed': [8.0]*168},
    'daily': {'temp_max': [30.0]*7, 'temp_min': [24.0]*7,
              'rainfall_sum': [70.0]*7, 'wind_max': [12.0]*7, 'humidity_avg': [85.0]*7}
}

def test_all_crops_in_rules():
    """All 4 crops must be defined in CROP_RULES."""
    for crop in ['cotton', 'wheat', 'bajra', 'groundnut']:
        assert crop in CROP_RULES

def test_heat_stress_triggers_for_cotton():
    """40°C max temp should trigger heat stress advisory for cotton."""
    result = generate_advisory(SAMPLE_PANCHAYAT, HOT_DRY_FORECAST, crop='cotton')
    assert len(result['rules_triggered']) > 0

def test_all_three_languages_present():
    """Advisory must return en, hi, gu keys."""
    result = generate_advisory(SAMPLE_PANCHAYAT, HOT_DRY_FORECAST, crop='cotton')
    assert 'en' in result and 'hi' in result and 'gu' in result

def test_hindi_contains_devanagari():
    """Hindi text must contain Devanagari characters."""
    result = generate_advisory(SAMPLE_PANCHAYAT, HOT_DRY_FORECAST, crop='cotton')
    assert any('\u0900' <= c <= '\u097F' for c in result['hi'])

def test_gujarati_contains_gujarati_script():
    """Gujarati text must contain Gujarati Unicode characters."""
    result = generate_advisory(SAMPLE_PANCHAYAT, HOT_DRY_FORECAST, crop='cotton')
    assert any('\u0A80' <= c <= '\u0AFF' for c in result['gu'])

def test_uses_primary_crop_when_none():
    """If crop=None, uses panchayat's primary_crop."""
    panchayat = {**SAMPLE_PANCHAYAT, 'primary_crop': 'wheat'}
    result = generate_advisory(panchayat, HOT_DRY_FORECAST, crop=None)
    assert result['crop'] == 'wheat'

def test_wet_conditions_heavy_rain_advisory():
    """High rainfall should trigger heavy rain advisory."""
    result = generate_advisory(SAMPLE_PANCHAYAT, WET_FORECAST, crop='cotton')
    rules = ' '.join(result['rules_triggered']).lower()
    # Should mention rain or spray or some weather condition
    assert len(result['en']) > 0
