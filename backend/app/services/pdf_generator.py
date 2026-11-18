"""Certified Clinical PDF Report Generator using ReportLab.

Compiles longitudinal symptom trajectories, confirmed lab markers,
differential screening highlights, and AI clinical summaries into a
professional, watermarked medical consultation report.
"""

import io
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)


class ClinicalPDFGenerator:
    """Generates structured PDF reports for clinical consultations."""

    @classmethod
    def generate_report_pdf(
        cls,
        patient_info: Dict[str, Any],
        doctor_info: Optional[Dict[str, Any]],
        start_date: date,
        end_date: date,
        analytics_payload: Dict[str, Any],
        ai_summary: Dict[str, Any],
    ) -> bytes:
        """Generates PDF bytes."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()

        # Custom paragraph styles
        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#1e293b"),
            fontName="Helvetica-Bold",
        )
        subtitle_style = ParagraphStyle(
            "ReportSubtitle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#64748b"),
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0f766e"),  # Teal-700
            fontName="Helvetica-Bold",
            spaceBefore=12,
            spaceAfter=4,
        )
        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#334155"),
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#94a3b8"),
        )

        story = []

        # Header Banner
        story.append(Paragraph("CLINICAL DECISION SUPPORT REPORT", title_style))
        story.append(Paragraph(f"Menopause Longitudinal Symptom History & Lab Differential Summary | Generated: {datetime.now().strftime('%d %B %Y')}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f766e"), spaceAfter=10))

        # Metadata Table (Patient & Clinician)
        doc_name = f"Dr. {doctor_info.get('full_name')}" if doctor_info else "Attending Gynecologist"
        clinic = doctor_info.get("clinic_name", "Women's Health Practice") if doctor_info else "Consulting Clinic"

        meta_data = [
            [
                Paragraph(f"<b>Patient:</b> {patient_info.get('full_name', 'Patient')}", body_style),
                Paragraph(f"<b>Reporting Period:</b> {start_date} to {end_date}", body_style),
            ],
            [
                Paragraph(f"<b>Birth Year:</b> {patient_info.get('birth_year', 'N/A')} | <b>STRAW Stage:</b> {patient_info.get('straw_stage', 'Unknown').replace('_', ' ').title()}", body_style),
                Paragraph(f"<b>Assigned Physician:</b> {doc_name} ({clinic})", body_style),
            ],
            [
                Paragraph(f"<b>Tracking Adherence:</b> {analytics_payload.get('adherence_rate_pct', 0.0)}% ({analytics_payload.get('total_recorded_days', 0)} days logged)", body_style),
                Paragraph(f"<b>Document Status:</b> Verified Deterministic Summary", body_style),
            ],
        ]
        meta_table = Table(meta_data, colWidths=[270, 270])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # Executive Clinical Summary (from AI or Deterministic Template)
        story.append(Paragraph("1. Executive Overview & Longitudinal Trajectory", section_heading))
        story.append(Paragraph(ai_summary.get("executive_overview", "No narrative available."), body_style))
        story.append(Spacer(1, 8))

        # Primary Symptom Drivers Table
        story.append(Paragraph("2. Longitudinal Sentinel Symptoms (30-Day Trajectory)", section_heading))
        trends = analytics_payload.get("symptom_trends", {})
        symptom_table_data = [
            [
                Paragraph("<b>Symptom</b>", body_style),
                Paragraph("<b>Presence %</b>", body_style),
                Paragraph("<b>Current SMA-30</b>", body_style),
                Paragraph("<b>Trajectory</b>", body_style),
                Paragraph("<b>Confidence</b>", body_style),
            ]
        ]
        for code, data in trends.items():
            traj = data.get("trend", "stable").upper()
            traj_color = "#dc2626" if traj == "INCREASING" else ("#16a34a" if traj == "DECREASING" else "#475569")
            symptom_table_data.append([
                Paragraph(data.get("name", code), body_style),
                Paragraph(f"{data.get('presence_rate_pct', 0.0)}%", body_style),
                Paragraph(f"{data.get('current_sma_30', 0.0):.1f} / 4.0", body_style),
                Paragraph(f"<font color='{traj_color}'><b>{traj}</b></font>", body_style),
                Paragraph(data.get("confidence", "moderate").capitalize(), body_style),
            ])

        if len(symptom_table_data) > 1:
            sym_table = Table(symptom_table_data, colWidths=[160, 90, 100, 100, 90])
            sym_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(sym_table)
        else:
            story.append(Paragraph("No daily sentinel symptoms logged in this interval.", body_style))
        story.append(Spacer(1, 10))

        # Differential Screening & Comorbidity Matches
        story.append(Paragraph("3. Clinical Differential & Comorbidity Screening Matches", section_heading))
        screenings = analytics_payload.get("differential_screenings", [])
        if screenings:
            diff_table_data = [
                [
                    Paragraph("<b>Condition</b>", body_style),
                    Paragraph("<b>Confidence</b>", body_style),
                    Paragraph("<b>Risk Tier</b>", body_style),
                    Paragraph("<b>Key Matching Criteria</b>", body_style),
                ]
            ]
            for s in screenings:
                score = s.get("confidence_score", 0.0)
                tier = s.get("risk_tier", "low").upper()
                tier_color = "#dc2626" if tier in ["HIGH", "CRITICAL"] else "#ca8a04"
                diff_table_data.append([
                    Paragraph(f"<b>{s.get('condition_name')}</b><br/><font size=7.5 color='#64748b'>{s.get('category')}</font>", body_style),
                    Paragraph(f"<b>{score:.0f}%</b>", body_style),
                    Paragraph(f"<font color='{tier_color}'><b>{tier}</b></font>", body_style),
                    Paragraph("; ".join(s.get("matching_criteria_met", [])[:2]), body_style),
                ])
            diff_table = Table(diff_table_data, colWidths=[150, 70, 70, 250])
            diff_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(diff_table)
        else:
            story.append(Paragraph("No comorbidity or differential patterns triggered confidence thresholds in this period.", body_style))
        story.append(Spacer(1, 10))

        # Confirmed Local Lab Results
        story.append(Paragraph("4. Confirmed Local Laboratory Markers", section_heading))
        labs = analytics_payload.get("verified_lab_markers", [])
        if labs:
            lab_table_data = [
                [
                    Paragraph("<b>Analyte</b>", body_style),
                    Paragraph("<b>Result</b>", body_style),
                    Paragraph("<b>Unit</b>", body_style),
                    Paragraph("<b>Reference Interval</b>", body_style),
                    Paragraph("<b>Flag</b>", body_style),
                ]
            ]
            for l in labs:
                flag = l.get("flag", "normal").upper()
                flag_color = "#dc2626" if flag in ["HIGH", "LOW", "CRITICAL"] else "#16a34a"
                ref_text = f"{l.get('reference_range_low', '')} - {l.get('reference_range_high', '')}" if l.get('reference_range_low') is not None else "N/A"
                lab_table_data.append([
                    Paragraph(l.get("analyte_name", ""), body_style),
                    Paragraph(f"<b>{l.get('numeric_value', '')}</b>", body_style),
                    Paragraph(l.get("unit", ""), body_style),
                    Paragraph(ref_text, body_style),
                    Paragraph(f"<font color='{flag_color}'><b>{flag}</b></font>", body_style),
                ])
            lab_table = Table(lab_table_data, colWidths=[140, 80, 80, 140, 100])
            lab_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(lab_table)
        else:
            story.append(Paragraph("No laboratory reports verified for this patient interval.", body_style))
        story.append(Spacer(1, 15))

        # Recommendations
        story.append(Paragraph("5. Pertinent Clinical Recommendations", section_heading))
        for rec in ai_summary.get("pertinent_clinical_recommendations", []):
            story.append(Paragraph(f"• {rec}", body_style))
        story.append(Spacer(1, 15))

        # Medicolegal Disclaimer
        disclaimer_text = (
            "NOTICE & MEDICOLEGAL DISCLAIMER: This document is an automated clinical decision-support compilation "
            "synthesizing patient-reported daily symptom logs and local laboratory results. It does not constitute "
            "an autonomous medical diagnosis, staging determination, or prescription. Definitive diagnosis of menopause, "
            "PCOD, thyroid dysfunction, or pelvic masses requires comprehensive in-person medical evaluation, clinical "
            "examination, pelvic ultrasound, and physician discretion."
        )
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=5))
        story.append(Paragraph(disclaimer_text, disclaimer_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
