import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from downscaler import lapse_rate_correction, idw_interpolate, orographic_rainfall_factor, compute_difference
import pytest

class TestLapseRateCorrection:
    def test_same_elevation_no_change(self):
        """Same elevation → no temperature change."""
        result = lapse_rate_correction(30.0, 60.0, 60.0)
        assert abs(result - 30.0) < 1e-10

    def test_higher_panchayat_cooler(self):
        """100m higher → 0.65°C cooler."""
        result = lapse_rate_correction(30.0, 160.0, 60.0)
        assert abs(result - 29.35) < 0.001

    def test_lower_panchayat_warmer(self):
        """50m lower → 0.325°C warmer."""
        result = lapse_rate_correction(25.0, 10.0, 60.0)
        assert abs(result - 25.325) < 0.001

    def test_large_elevation_diff(self):
        """1000m diff → 6.5°C change."""
        result = lapse_rate_correction(20.0, 1060.0, 60.0)
        assert abs(result - 13.5) < 0.001

class TestIDWInterpolation:
    def setup_method(self):
        self.single_block = {
            'BlockA': {'lat': 23.0, 'lon': 72.5, 'temperature': 35.0}
        }
        self.three_blocks = {
            'BlockA': {'lat': 23.0, 'lon': 72.5, 'temperature': 30.0},
            'BlockB': {'lat': 23.1, 'lon': 72.6, 'temperature': 32.0},
            'BlockC': {'lat': 23.2, 'lon': 72.7, 'temperature': 34.0},
        }

    def test_single_block_returns_exact(self):
        """Single block → exact block value."""
        result = idw_interpolate(23.0, 72.5, self.single_block, 'temperature', n_nearest=1)
        assert abs(result - 35.0) < 0.01

    def test_closer_block_weighted_more(self):
        """Point closer to BlockA → result closer to 30 than to 34."""
        result = idw_interpolate(23.01, 72.51, self.three_blocks, 'temperature')
        assert result < 31.5  # closer to BlockA value (30)

    def test_midpoint_interpolation(self):
        """Point equidistant between two blocks → near their average."""
        blocks = {
            'B1': {'lat': 23.0, 'lon': 72.4, 'temperature': 30.0},
            'B2': {'lat': 23.0, 'lon': 72.6, 'temperature': 40.0},
        }
        result = idw_interpolate(23.0, 72.5, blocks, 'temperature', n_nearest=2)
        assert abs(result - 35.0) < 0.5  # should be near 35

class TestOrographicRainfall:
    def test_flat_terrain_no_change(self):
        """Same elevation → factor 1.0, no change."""
        result = orographic_rainfall_factor(10.0, 60.0, 60.0)
        assert abs(result - 10.0) < 1e-10

    def test_higher_panchayat_more_rain(self):
        """Higher elevation → enhanced rainfall."""
        result = orographic_rainfall_factor(10.0, 160.0, 60.0)
        assert result > 10.0

    def test_clipping_at_500m(self):
        """Elevation diff > 500m is clipped."""
        r1 = orographic_rainfall_factor(10.0, 660.0, 60.0)  # diff=600, clips to 500
        r2 = orographic_rainfall_factor(10.0, 560.0, 60.0)  # diff=500, exact
        assert abs(r1 - r2) < 1e-10

    def test_zero_rainfall_stays_zero(self):
        """Zero rainfall × any factor → zero."""
        result = orographic_rainfall_factor(0.0, 200.0, 60.0)
        assert result == 0.0
