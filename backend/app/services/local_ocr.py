"""100% Local OCR & Medical Lab Report Extraction Engine.

Processes scanned PDFs, images, and camera captures using pdfplumber and PyTesseract.
Extracts clinical blood test analytes, values, units, reference intervals, and flags locally.
Zero external network calls, zero API token cost, maximum patient data privacy.
"""

import os
import re
from typing import Dict, List, Optional, Any, Tuple
from PIL import Image
import pdfplumber
import pytesseract
from backend.app.core.config import settings

# Configure Tesseract binary path if provided
if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


# Standard clinical reference intervals for adult females
CANONICAL_ANALYTE_RULES: Dict[str, Dict[str, Any]] = {
    "FSH": {
        "aliases": ["fsh", "follicle stimulating hormone", "s.fsh", "serum fsh"],
        "default_unit": "mIU/mL",
        "ref_low": 3.5,
        "ref_high": 12.5,  # Premenopausal follicular phase upper limit; >25 is postmenopausal
        "postmeno_cutoff": 25.0,
    },
    "LH": {
        "aliases": ["lh", "luteinizing hormone", "s.lh", "serum lh"],
        "default_unit": "mIU/mL",
        "ref_low": 2.4,
        "ref_high": 12.6,
    },
    "Estradiol": {
        "aliases": ["estradiol", "e2", "s.estradiol", "17-beta estradiol", "serum estradiol"],
        "default_unit": "pg/mL",
        "ref_low": 30.0,
        "ref_high": 400.0,
    },
    "TSH": {
        "aliases": ["tsh", "thyroid stimulating hormone", "s.tsh", "thyrotropin", "ultrasensitive tsh"],
        "default_unit": "uIU/mL",
        "ref_low": 0.4,
        "ref_high": 4.5,
    },
    "Free T4": {
        "aliases": ["free t4", "ft4", "free thyroxine"],
        "default_unit": "ng/dL",
        "ref_low": 0.8,
        "ref_high": 1.8,
    },
    "Hemoglobin": {
        "aliases": ["hemoglobin", "hb", "haemoglobin", "total hb"],
        "default_unit": "g/dL",
        "ref_low": 12.0,
        "ref_high": 15.5,
    },
    "Ferritin": {
        "aliases": ["ferritin", "serum ferritin", "s.ferritin"],
        "default_unit": "ng/mL",
        "ref_low": 30.0,
        "ref_high": 200.0,
    },
    "Testosterone": {
        "aliases": ["testosterone", "total testosterone", "s.testosterone"],
        "default_unit": "ng/dL",
        "ref_low": 15.0,
        "ref_high": 70.0,
    },
    "Fasting Glucose": {
        "aliases": ["fasting blood sugar", "fbs", "fasting glucose", "glucose fasting", "fbg"],
        "default_unit": "mg/dL",
        "ref_low": 70.0,
        "ref_high": 99.0,
    },
    "HbA1c": {
        "aliases": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c"],
        "default_unit": "%",
        "ref_low": 4.0,
        "ref_high": 5.6,
    },
    "Total Cholesterol": {
        "aliases": ["total cholesterol", "cholesterol total", "serum cholesterol"],
        "default_unit": "mg/dL",
        "ref_low": 120.0,
        "ref_high": 200.0,
    },
    "HDL": {
        "aliases": ["hdl", "hdl cholesterol", "high density lipoprotein"],
        "default_unit": "mg/dL",
        "ref_low": 50.0,
        "ref_high": 90.0,
    },
    "LDL": {
        "aliases": ["ldl", "ldl cholesterol", "low density lipoprotein"],
        "default_unit": "mg/dL",
        "ref_low": 50.0,
        "ref_high": 100.0,
    },
    "Triglycerides": {
        "aliases": ["triglycerides", "serum triglycerides", "tg"],
        "default_unit": "mg/dL",
        "ref_low": 50.0,
        "ref_high": 150.0,
    },
    "Vitamin D3": {
        "aliases": ["vitamin d3", "25-oh vitamin d", "vit d3", "vitamin d total", "25-hydroxy vitamin d"],
        "default_unit": "ng/mL",
        "ref_low": 30.0,
        "ref_high": 100.0,
    },
    "Vitamin B12": {
        "aliases": ["vitamin b12", "vit b12", "cyanocobalamin", "b12"],
        "default_unit": "pg/mL",
        "ref_low": 200.0,
        "ref_high": 900.0,
    },
    "Calcium": {
        "aliases": ["serum calcium", "calcium total", "s.calcium"],
        "default_unit": "mg/dL",
        "ref_low": 8.5,
        "ref_high": 10.5,
    },
    "CA-125": {
        "aliases": ["ca-125", "ca 125", "cancer antigen 125"],
        "default_unit": "U/mL",
        "ref_low": 0.0,
        "ref_high": 35.0,
    },
}


class LocalOCRExtractionEngine:
    """Extracts medical lab test analytes locally without sending files to any external API."""

    @classmethod
    def extract_text_from_file(cls, file_path: str, mime_type: str) -> str:
        """Extracts raw text from a PDF or image file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        extracted_text = ""

        # 1. Handle PDF files
        if "pdf" in mime_type.lower() or file_path.lower().endswith(".pdf"):
            try:
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            extracted_text += page_text + "\n"
            except Exception:
                pass

            # If pdfplumber returned empty or sparse text (scanned PDF), fallback to OCR via pdftoppm or Tesseract
            if len(extracted_text.strip()) < 50:
                try:
                    # Attempt image-based OCR on PDF page rendering if pypdfium2/pdf2image available
                    import pypdfium2 as pdfium
                    pdf = pdfium.PdfDocument(file_path)
                    for page in pdf:
                        pil_image = page.render().to_pil()
                        ocr_page = pytesseract.image_to_string(pil_image)
                        extracted_text += ocr_page + "\n"
                except Exception:
                    pass

        # 2. Handle Image files (PNG, JPG, TIFF)
        else:
            try:
                image = Image.open(file_path)
                extracted_text = pytesseract.image_to_string(image)
            except Exception as e:
                extracted_text = f"OCR Error: {str(e)}"

        return extracted_text

    @classmethod
    def parse_lab_analytes(cls, raw_text: str) -> List[Dict[str, Any]]:
        """Parses raw text to identify tested analytes, numerical results, and reference intervals."""
        found_analytes: List[Dict[str, Any]] = []
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        for canonical_name, config in CANONICAL_ANALYTE_RULES.items():
            matched_analyte = cls._find_analyte_in_lines(canonical_name, config, lines)
            if matched_analyte:
                found_analytes.append(matched_analyte)

        return found_analytes

    @classmethod
    def _find_analyte_in_lines(
        cls, canonical_name: str, config: Dict[str, Any], lines: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Scans lines to detect the analyte and its numerical result."""
        aliases = config["aliases"]
        ref_low = config["ref_low"]
        ref_high = config["ref_high"]
        default_unit = config["default_unit"]

        for line in lines:
            line_lower = line.lower()
            for alias in aliases:
                # Match alias with word boundaries or common delimiters (: , - | \t)
                pattern = rf"(?:\b|\A){re.escape(alias)}(?:\b|\Z|[:\s\-\|\t])"
                if re.search(pattern, line_lower):
                    # Extract numeric value that appears after or near the alias
                    numeric_val = cls._extract_numeric_value(line, alias)
                    if numeric_val is not None:
                        # Extract reference ranges if explicitly present in the line (e.g. 0.4 - 4.5)
                        line_ref = cls._extract_reference_range(line)
                        actual_ref_low = line_ref[0] if line_ref[0] is not None else ref_low
                        actual_ref_high = line_ref[1] if line_ref[1] is not None else ref_high

                        # Determine flag
                        flag = "normal"
                        if actual_ref_high is not None and numeric_val > actual_ref_high:
                            flag = "high"
                        elif actual_ref_low is not None and numeric_val < actual_ref_low:
                            flag = "low"

                        return {
                            "analyte_name": canonical_name,
                            "numeric_value": numeric_val,
                            "unit": default_unit,
                            "reference_range_low": actual_ref_low,
                            "reference_range_high": actual_ref_high,
                            "flag": flag,
                            "is_verified_by_user": False,
                        }
        return None

    @staticmethod
    def _extract_numeric_value(line: str, alias: str) -> Optional[float]:
        """Extracts the first valid floating-point number associated with the analyte."""
        # Split line around the alias to only look forward
        idx = line.lower().find(alias)
        search_region = line[idx + len(alias):] if idx != -1 else line

        # Regex for positive float/int, e.g. 14.2, 0.45, 120
        matches = re.findall(r"(?<![\w\.\-])(\d+(?:\.\d+)?)(?![\w\.\-])", search_region)
        if matches:
            try:
                val = float(matches[0])
                # Sanity check to avoid year numbers like 2026 or timestamps
                if val < 5000:
                    return val
            except ValueError:
                pass
        return None

    @staticmethod
    def _extract_reference_range(line: str) -> Tuple[Optional[float], Optional[float]]:
        """Detects reference ranges like '(0.4 - 4.5)' or '12.0 to 15.5'."""
        range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to|–)\s*(\d+(?:\.\d+)?)", line)
        if range_match:
            try:
                low = float(range_match.group(1))
                high = float(range_match.group(2))
                return low, high
            except ValueError:
                pass
        return None, None
