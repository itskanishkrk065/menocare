
"""Deterministic analytics engine for longitudinal menopause symptom tracking.

Computes:
- Moving averages (SMA-7, SMA-30) over irregularly sampled days without false zero imputation
- Non-parametric Mann-Kendall monotonic trend test (S-statistic, variance, z-score, p-value)
- Descriptive central tendencies (Mean, Median, Interquartile Range, Frequency Distribution)
- Tracking adherence and completeness percentages
- Spearman rank correlation matrix between symptom pairs and lab markers
"""

import math
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from scipy import stats


class DeterministicAnalyticsEngine:
    """100% deterministic, testable analytics engine with zero LLM dependence."""

    @staticmethod
    def calculate_adherence_rate(recorded_dates: List[date], start_date: date, end_date: date) -> float:
        """Calculates tracking adherence percentage within a defined date window."""
        total_eligible_days = (end_date - start_date).days + 1
        if total_eligible_days <= 0:
            return 0.0
        unique_dates = len(set(recorded_dates))
        adherence = (unique_dates / total_eligible_days) * 100.0
        return round(min(100.0, max(0.0, adherence)), 1)

    @staticmethod
    def compute_moving_averages(
        time_series: List[Dict[str, Any]],
        window_sizes: Tuple[int, int] = (7, 30),
    ) -> List[Dict[str, Any]]:
        """Computes simple moving averages over longitudinal daily observations.

        Preserves chronological order and computes trailing SMA over available observation
        points within the calendar window without artificially forward-filling missing days with 0.
        """
        if not time_series:
            return []

        df = pd.DataFrame(time_series)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date").reset_index(drop=True)

        # Set date as index for rolling time-based calculations
        df = df.set_index("date")

        # Rolling time window means over recorded observations
        df["sma_7"] = df["intensity"].rolling("7D", min_periods=1).mean().round(2)
        df["sma_30"] = df["intensity"].rolling("30D", min_periods=1).mean().round(2)

        df = df.reset_index()
        df["date"] = df["date"].dt.strftime("%Y-%m-%d")

        return df.to_dict(orient="records")

    @staticmethod
    def mann_kendall_trend_test(values: List[float]) -> Dict[str, Any]:
        """Calculates non-parametric Mann-Kendall monotonic trend test.

        Returns:
            trend: 'increasing', 'decreasing', or 'stable'
            p_value: two-tailed p-value
            s_statistic: Kendall's S
            z_score: Standardized test statistic
        """
        n = len(values)
        if n < 4:
            return {
                "trend": "insufficient_data",
                "p_value": 1.0,
                "s_statistic": 0,
                "z_score": 0.0,
                "confidence": "low",
            }

        s = 0
        for k in range(n - 1):
            for j in range(k + 1, n):
                s += int(np.sign(values[j] - values[k]))

        # Calculate variance of S with tie corrections
        unique_vals, counts = np.unique(values, return_counts=True)
        ties_term = np.sum(counts * (counts - 1) * (2 * counts + 5))
        var_s = (n * (n - 1) * (2 * n + 5) - ties_term) / 18.0

        if s > 0:
            z = (s - 1) / math.sqrt(var_s) if var_s > 0 else 0.0
        elif s < 0:
            z = (s + 1) / math.sqrt(var_s) if var_s > 0 else 0.0
        else:
            z = 0.0

        # Two-tailed p-value from standard normal
        p_value = 2.0 * (1.0 - stats.norm.cdf(abs(z)))

        # Determine clinical trajectory
        if p_value < 0.05:
            if s > 0:
                trend = "increasing"
            else:
                trend = "decreasing"
        else:
            trend = "stable"

        return {
            "trend": trend,
            "p_value": round(float(p_value), 4),
            "s_statistic": int(s),
            "z_score": round(float(z), 2),
            "confidence": "high" if p_value < 0.01 else ("moderate" if p_value < 0.05 else "low"),
        }

    @staticmethod
    def calculate_symptom_metrics(intensities: List[int]) -> Dict[str, Any]:
        """Computes descriptive central tendencies for ordinal 0-4 intensity."""
        if not intensities:
            return {
                "mean_intensity": 0.0,
                "median_intensity": 0.0,
                "iqr": 0.0,
                "presence_rate_pct": 0.0,
                "max_intensity": 0,
                "severity_distribution": {0: 0, 1: 0, 2: 0, 3: 0, 4: 0},
            }

        arr = np.array(intensities)
        symptom_present = arr[arr > 0]

        q75, q25 = np.percentile(arr, [75, 25])
        iqr = q75 - q25

        counts = {i: int(np.sum(arr == i)) for i in range(5)}
        presence_rate = (len(symptom_present) / len(arr)) * 100.0

        return {
            "mean_intensity": round(float(np.mean(arr)), 2),
            "mean_when_present": round(float(np.mean(symptom_present)), 2) if len(symptom_present) > 0 else 0.0,
            "median_intensity": round(float(np.median(arr)), 1),
            "iqr": round(float(iqr), 1),
            "presence_rate_pct": round(presence_rate, 1),
            "max_intensity": int(np.max(arr)),
            "severity_distribution": counts,
        }

    @staticmethod
    def compute_cross_correlations(series_a: List[float], series_b: List[float]) -> Optional[Dict[str, Any]]:
        """Calculates Spearman rank-order correlation coefficient between two numeric series."""
        if len(series_a) != len(series_b) or len(series_a) < 5:
            return None

        # Filter out cases with zero variance
        if np.std(series_a) == 0 or np.std(series_b) == 0:
            return {
                "rho": 0.0,
                "p_value": 1.0,
                "strength": "none",
                "clinical_disclaimer": "Correlation does not imply physiological causation.",
            }

        rho, p_val = stats.spearmanr(series_a, series_b)
        
        strength = "none"
        abs_rho = abs(rho)
        if abs_rho >= 0.7:
            strength = "strong"
        elif abs_rho >= 0.4:
            strength = "moderate"
        elif abs_rho >= 0.2:
            strength = "weak"

        return {
            "rho": round(float(rho), 3),
            "p_value": round(float(p_val), 4),
            "strength": strength,
            "clinical_disclaimer": "Correlation does not imply physiological causation.",
        }
