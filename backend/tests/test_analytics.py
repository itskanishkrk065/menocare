"""Unit tests for the Deterministic Analytics Engine."""

from datetime import date, timedelta
import pytest
from backend.app.analytics.engine import DeterministicAnalyticsEngine


def test_adherence_rate_calculation():
    """Verifies tracking adherence rate calculation."""
    start = date(2026, 1, 1)
    end = date(2026, 1, 10)  # 10 eligible days

    # 7 recorded days = 70%
    recorded = [start + timedelta(days=i) for i in [0, 1, 2, 4, 5, 8, 9]]
    adherence = DeterministicAnalyticsEngine.calculate_adherence_rate(recorded, start, end)
    assert adherence == 70.0

    # 10 recorded days = 100%
    all_days = [start + timedelta(days=i) for i in range(10)]
    assert DeterministicAnalyticsEngine.calculate_adherence_rate(all_days, start, end) == 100.0

    # 0 recorded days = 0%
    assert DeterministicAnalyticsEngine.calculate_adherence_rate([], start, end) == 0.0


def test_moving_averages_calculation():
    """Verifies SMA-7 and SMA-30 calculation without false zero forward-filling."""
    start = date(2026, 1, 1)
    series = [
        {"date": str(start + timedelta(days=0)), "intensity": 2},
        {"date": str(start + timedelta(days=1)), "intensity": 4},
        {"date": str(start + timedelta(days=2)), "intensity": 3},
        {"date": str(start + timedelta(days=3)), "intensity": 1},
        {"date": str(start + timedelta(days=4)), "intensity": 2},
    ]

    smoothed = DeterministicAnalyticsEngine.compute_moving_averages(series)
    assert len(smoothed) == 5

    # On day 3 (values: 2, 4, 3, 1), 7-day average = (2+4+3+1)/4 = 2.5
    assert smoothed[3]["sma_7"] == 2.50
    assert smoothed[3]["sma_30"] == 2.50


def test_mann_kendall_trend_detection():
    """Verifies monotonic trend detection with statistical confidence."""
    # Strictly increasing sequence (0, 1, 1, 2, 3, 3, 4, 4)
    increasing_series = [0, 1, 1, 2, 3, 3, 4, 4]
    inc_result = DeterministicAnalyticsEngine.mann_kendall_trend_test(increasing_series)
    assert inc_result["trend"] == "increasing"
    assert inc_result["s_statistic"] > 0
    assert inc_result["p_value"] < 0.05

    # Strictly decreasing sequence (4, 4, 3, 3, 2, 1, 1, 0)
    decreasing_series = [4, 4, 3, 3, 2, 1, 1, 0]
    dec_result = DeterministicAnalyticsEngine.mann_kendall_trend_test(decreasing_series)
    assert dec_result["trend"] == "decreasing"
    assert dec_result["s_statistic"] < 0
    assert dec_result["p_value"] < 0.05

    # Fluctuating / stable sequence (2, 2, 1, 3, 2, 2, 3, 1)
    stable_series = [2, 2, 1, 3, 2, 2, 3, 1]
    stable_result = DeterministicAnalyticsEngine.mann_kendall_trend_test(stable_series)
    assert stable_result["trend"] == "stable"


def test_symptom_metrics_and_iqr():
    """Verifies descriptive central tendencies and interquartile range."""
    intensities = [0, 0, 1, 2, 2, 3, 4, 4]
    metrics = DeterministicAnalyticsEngine.calculate_symptom_metrics(intensities)

    assert metrics["mean_intensity"] == 2.0
    assert metrics["median_intensity"] == 2.0
    assert metrics["max_intensity"] == 4
    # 6 out of 8 days have symptom > 0 -> 75%
    assert metrics["presence_rate_pct"] == 75.0
    assert metrics["severity_distribution"][0] == 2
    assert metrics["severity_distribution"][4] == 2
