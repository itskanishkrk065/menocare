"""Unit tests for the 100% Local OCR & Lab Analyte Parser."""

import pytest
from backend.app.services.local_ocr import LocalOCRExtractionEngine


def test_parse_lab_analytes_from_simulated_text():
    """Verifies that the local parser accurately extracts blood test analytes, units, and ranges from raw OCR text."""
    sample_ocr_report_text = """
    CENTRAL PATHOLOGY CLINICAL LABORATORY REPORT
    PATIENT: JANE DOE | AGE: 47 | SEX: FEMALE
    DATE: 12-FEB-2026

    TEST NAME                    RESULT      UNIT        REFERENCE INTERVAL
    -----------------------------------------------------------------------
    Serum FSH                    42.5        mIU/mL      (3.5 - 12.5)
    Serum LH                     14.2        mIU/mL      (2.4 - 12.6)
    17-Beta Estradiol (E2)       18.0        pg/mL       (30.0 - 400.0)
    Thyroid Stimulating Hormone  6.80        uIU/mL      (0.40 - 4.50)
    Hemoglobin (Hb)              10.5        g/dL        (12.0 - 15.5)
    Serum Ferritin               18.4        ng/mL       (30.0 - 200.0)
    Fasting Blood Sugar (FBS)    115.0       mg/dL       (70.0 - 99.0)
    HbA1c                        6.1         %           (4.0 - 5.6)
    25-OH Vitamin D Total        14.2        ng/mL       (30.0 - 100.0)
    Total Cholesterol            220.0       mg/dL       (120.0 - 200.0)
    HDL Cholesterol              42.0        mg/dL       (50.0 - 90.0)
    LDL Cholesterol              145.0       mg/dL       (50.0 - 100.0)
    Triglycerides                185.0       mg/dL       (50.0 - 150.0)
    -----------------------------------------------------------------------
    """

    analytes = LocalOCRExtractionEngine.parse_lab_analytes(sample_ocr_report_text)
    extracted_map = {a["analyte_name"]: a for a in analytes}

    # 1. FSH: 42.5 (High, in postmenopausal range)
    assert "FSH" in extracted_map
    assert extracted_map["FSH"]["numeric_value"] == 42.5
    assert extracted_map["FSH"]["flag"] == "high"

    # 2. TSH: 6.80 (High)
    assert "TSH" in extracted_map
    assert extracted_map["TSH"]["numeric_value"] == 6.80
    assert extracted_map["TSH"]["flag"] == "high"

    # 3. Hemoglobin: 10.5 (Low)
    assert "Hemoglobin" in extracted_map
    assert extracted_map["Hemoglobin"]["numeric_value"] == 10.5
    assert extracted_map["Hemoglobin"]["flag"] == "low"

    # 4. Ferritin: 18.4 (Low)
    assert "Ferritin" in extracted_map
    assert extracted_map["Ferritin"]["numeric_value"] == 18.4
    assert extracted_map["Ferritin"]["flag"] == "low"

    # 5. Fasting Glucose: 115.0 (High)
    assert "Fasting Glucose" in extracted_map
    assert extracted_map["Fasting Glucose"]["numeric_value"] == 115.0
    assert extracted_map["Fasting Glucose"]["flag"] == "high"

    # 6. Vitamin D3: 14.2 (Low)
    assert "Vitamin D3" in extracted_map
    assert extracted_map["Vitamin D3"]["numeric_value"] == 14.2
    assert extracted_map["Vitamin D3"]["flag"] == "low"
