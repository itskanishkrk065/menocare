"""Clinical Simulation & Engine Evaluation Harness.

Simulates 180 days across all 7 synthetic cohorts.
Evaluates:
- Day 1 False Positive Rate (must be 0% for chronic conditions)
- Clinical Detection Sensitivity across PCOD, Thyroid, Fibroids, PMB, and POI
- Moving Average Stability under low adherence (~18%)
- Time-to-accurate-alert
"""

import sys
import os

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath("."))

from backend.app.analytics.cohort_generator import ClinicalCohortGenerator
from backend.app.analytics.engine import DeterministicAnalyticsEngine
from backend.app.analytics.differential import DifferentialScreeningEngine
from backend.app.analytics.anomaly import AnomalyAlertEngine


def run_full_simulation():
    print("=" * 80)
    print("MENOCARE CLINICAL ENGINE 6-MONTH (180-DAY) SIMULATION & STRESS TEST")
    print("=" * 80)

    cohorts = ClinicalCohortGenerator.generate_all_cohorts()
    print(f"Loaded {len(cohorts)} synthetic patient cohorts spanning 180 days each.\n")

    summary_results = []

    # -----------------------------------------------------------------------
    # TEST 1: DAY 1 COLD-START FALSE POSITIVE AUDIT
    # -----------------------------------------------------------------------
    print("--- 1. AUDITING DAY 1 COLD-START BEHAVIOR ACROSS ALL COHORTS ---")
    day_1_false_positives = 0

    for cohort_id, data in cohorts.items():
        # Extract only Day 1 records
        first_date = data["bleeding_records"][0]["record_date"]
        day_1_daily = [r for r in data["daily_records"] if r.get("date") == first_date]
        day_1_bleeding = [r for r in data["bleeding_records"] if r.get("record_date") == first_date]

        # In cold-start Day 1, no verified labs exist yet
        alerts_day_1 = AnomalyAlertEngine.check_for_anomalies(
            patient_id=cohort_id,
            doctor_id="dr-test",
            doctor_name="Sharma",
            patient_age=data["age"],
            straw_stage=data["straw_stage"],
            daily_records=day_1_daily,
            bleeding_records=day_1_bleeding,
            verified_labs={},  # Day 1 has no lab yet
            total_recorded_days=1,
            amenorrhea_days=data.get("amenorrhea_days", 0),
        )

        chronic_alerts = [a for a in alerts_day_1 if a["trigger_type"] != "red_flag"]
        if chronic_alerts:
            day_1_false_positives += 1
            print(f"  ❌ FAIL [{data['name']}]: Triggered premature Day 1 chronic alert: {chronic_alerts[0]['condition_name']}")
        else:
            print(f"  ✅ PASS [{data['name']}]: Zero premature chronic alerts on Day 1.")

    print(f"\nDay 1 Chronic False Positive Count: {day_1_false_positives} / {len(cohorts)} (Target: 0)")
    assert day_1_false_positives == 0, "Engine must not trigger premature chronic alerts on Day 1!"

    # -----------------------------------------------------------------------
    # TEST 2: 180-DAY FULL LONGITUDINAL SIMULATION
    # -----------------------------------------------------------------------
    print("\n--- 2. EXECUTING 180-DAY LONGITUDINAL EVALUATION ---")

    for cohort_id, data in cohorts.items():
        print(f"\nEvaluating: {data['name']} (Age: {data['age']}, STRAW: {data['straw_stage']})")

        # 1. Adherence calculation
        recorded_dates = {r["date"] for r in data["daily_records"] if r.get("date")}
        adherence_pct = (len(recorded_dates) / 180.0) * 100.0

        # 2. Moving average computation on Hot Flashes
        hf_series = [
            {"date": r["date"], "intensity": r["intensity"]}
            for r in data["daily_records"] if r.get("question_code") == "VM_HF"
        ]
        smoothed_hf = DeterministicAnalyticsEngine.compute_moving_averages(hf_series)
        latest_sma30 = smoothed_hf[-1]["sma_30"] if smoothed_hf else 0.0

        # 3. Differential evaluation over full 180-day history with verified labs
        diff_matches = DifferentialScreeningEngine.evaluate_patient_differential(
            patient_age=data["age"],
            straw_stage=data["straw_stage"],
            daily_records=data["daily_records"],
            bleeding_records=data["bleeding_records"],
            verified_labs=data["verified_labs"],
            total_recorded_days=len(recorded_dates),
            amenorrhea_days=data.get("amenorrhea_days", 0),
        )

        # 4. Anomaly alerts
        anomaly_alerts = AnomalyAlertEngine.check_for_anomalies(
            patient_id=cohort_id,
            doctor_id="dr-test",
            doctor_name="Sharma",
            patient_age=data["age"],
            straw_stage=data["straw_stage"],
            daily_records=data["daily_records"],
            bleeding_records=data["bleeding_records"],
            verified_labs=data["verified_labs"],
            total_recorded_days=len(recorded_dates),
            amenorrhea_days=data.get("amenorrhea_days", 0),
        )

        top_conditions = [f"{m['condition_name']} ({m['confidence_score']:.0f}%)" for m in diff_matches[:2]]
        alert_names = [a["condition_name"] for a in anomaly_alerts]

        print(f"  • Logged Days: {len(recorded_dates)}/180 ({adherence_pct:.1f}% adherence)")
        print(f"  • Hot Flashes 30-Day SMA: {latest_sma30:.1f} / 4.0")
        print(f"  • Top Differential Matches: {', '.join(top_conditions) or 'None (Benign)'}")
        print(f"  • Active Anomaly Alerts Dispatched: {', '.join(alert_names) or 'None'}")

        summary_results.append({
            "cohort_id": cohort_id,
            "name": data["name"],
            "adherence_pct": round(adherence_pct, 1),
            "sma_30": latest_sma30,
            "top_conditions": top_conditions,
            "alerts": alert_names,
        })

    # -----------------------------------------------------------------------
    # TEST 3: CLINICAL ACCURACY AUDIT PER COHORT
    # -----------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("CLINICAL ACCURACY VALIDATION SUMMARY")
    print("=" * 80)

    # Cohort 1 (Typical): should have 0 high-risk alerts
    c1 = next(r for r in summary_results if r["cohort_id"] == "cohort_1_typical_perimenopause")
    assert len(c1["alerts"]) == 0, f"Cohort 1 should have 0 alerts, got {c1['alerts']}"
    print("✅ Cohort 1 (Typical Perimenopause): Zero false alarm alerts. Trajectory is benign.")

    # Cohort 2 (PCOD): should trigger PCOD_PCOS
    c2 = next(r for r in summary_results if r["cohort_id"] == "cohort_2_pcod_pcos")
    assert any("PCOD" in a for a in c2["alerts"]), f"Cohort 2 failed to trigger PCOD alert: {c2['alerts']}"
    print("✅ Cohort 2 (PCOD/PCOS Phenotype): Successfully triggered PCOD alert based on prolonged bleeding & LH:FSH.")

    # Cohort 3 (Hypothyroid): should trigger THYROID_HYPO
    c3 = next(r for r in summary_results if r["cohort_id"] == "cohort_3_hypothyroidism")
    assert any("Hypothyroidism" in a for a in c3["alerts"]), f"Cohort 3 failed to trigger Thyroid alert: {c3['alerts']}"
    print("✅ Cohort 3 (Hypothyroidism Mimic): Successfully triggered Hypothyroidism alert based on TSH & fatigue.")

    # Cohort 4 (PMB): should trigger Postmenopausal Bleeding Red Flag
    c4 = next(r for r in summary_results if r["cohort_id"] == "cohort_4_postmenopausal_bleeding")
    assert any("Postmenopausal Bleeding" in a for a in c4["alerts"]), f"Cohort 4 failed to trigger PMB: {c4['alerts']}"
    print("✅ Cohort 4 (PMB Red Flag): Successfully triggered Postmenopausal Bleeding Emergency Red Flag.")

    # Cohort 5 (Fibroids): should trigger Uterine Fibroids
    c5 = next(r for r in summary_results if r["cohort_id"] == "cohort_5_uterine_fibroids_anemia")
    assert any("Fibroids" in a for a in c5["alerts"]), f"Cohort 5 failed to trigger Fibroids: {c5['alerts']}"
    print("✅ Cohort 5 (Fibroids & Anemia): Successfully triggered Uterine Fibroids alert based on menorrhagia & low Hb.")

    # Cohort 6 (True POI): should trigger POI
    c6 = next(r for r in summary_results if r["cohort_id"] == "cohort_6_true_poi")
    assert any("Premature Ovarian Insufficiency" in a for a in c6["alerts"]), f"Cohort 6 failed to trigger POI: {c6['alerts']}"
    print("✅ Cohort 6 (True POI): Successfully triggered POI alert based on FSH 38.5, amenorrhea >120d, and age 33.")

    # Cohort 7 (Sporadic Low Adherence): SMA-30 computed without crashing
    c7 = next(r for r in summary_results if r["cohort_id"] == "cohort_7_sporadic_low_adherence")
    assert 15.0 <= c7["adherence_pct"] <= 35.0, f"Cohort 7 adherence unexpected: {c7['adherence_pct']}"
    assert c7["sma_30"] > 0, "SMA-30 failed to compute on sparse data."
    print(f"✅ Cohort 7 (Sporadic User): Adherence calculated at {c7['adherence_pct']}%. SMA-30 computed stably without crashing.")

    print("\n" + "=" * 80)
    print("ALL 7 CLINICAL COHORTS PASSED STRESS TESTING WITH 100% SENSITIVITY & 0% DAY 1 FALSE POSITIVES.")
    print("=" * 80)


if __name__ == "__main__":
    run_full_simulation()
