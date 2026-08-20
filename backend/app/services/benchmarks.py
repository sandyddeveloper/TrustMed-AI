from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from backend.app.core.i18n import (
    normalize_language,
    get_biomarker_name,
    get_guideline_source,
    get_biomarker_interpretation,
    get_clinical_concern,
)


class BiomarkerBenchmark(BaseModel):
    name: str
    key: str
    patient_value: float
    unit: str
    normal_range: str
    min_optimal: float
    max_optimal: float
    status: str = Field(..., description="OPTIMAL, BORDERLINE, ELEVATED, CRITICAL, or LOW")
    status_color: str = Field(..., description="emerald, amber, rose, or blue")
    delta_from_median: float
    interpretation: str
    guideline_source: str
    severity_level: int = Field(..., description="1 (Safe) to 4 (High Risk)")


class ReportBenchmarkSummary(BaseModel):
    overall_health_index: float = Field(..., description="Composite health index from 0 to 100")
    total_metrics_evaluated: int
    optimal_count: int
    elevated_count: int
    critical_count: int
    primary_clinical_concerns: List[str]
    benchmarks: List[BiomarkerBenchmark]


def evaluate_clinical_benchmarks(vitals: Dict[str, float], language: str = "en") -> ReportBenchmarkSummary:
    """
    Evaluates patient physiological vitals against authoritative medical guidelines
    (American Diabetes Association 2026, American Heart Association 2026, WHO).
    Calculates exact deviations, classification statuses, and composite index.
    Outputs localized names, interpretations, and clinical concerns in English, Tamil, or Hindi.
    """
    lang = normalize_language(language)
    benchmarks_list: List[BiomarkerBenchmark] = []
    concerns: List[str] = []

    # 1. Fasting Blood Glucose (ADA Standard)
    if "glucose_level" in vitals and vitals["glucose_level"] > 0:
        val = round(float(vitals["glucose_level"]), 1)
        median_opt = 85.0
        if val < 70:
            status, color, sev = "LOW", "blue", 2
        elif val <= 99:
            status, color, sev = "OPTIMAL", "emerald", 1
        elif val <= 125:
            status, color, sev = "BORDERLINE", "amber", 2
        else:
            status, color, sev = "CRITICAL", "rose", 4

        interp = get_biomarker_interpretation("glucose_level", val, status, lang=lang)
        concern = get_clinical_concern("glucose_level", val, status, lang=lang)
        if concern:
            concerns.append(concern)

        benchmarks_list.append(
            BiomarkerBenchmark(
                name=get_biomarker_name("glucose_level", lang=lang),
                key="glucose_level",
                patient_value=val,
                unit="mg/dL",
                normal_range="70 - 99 mg/dL",
                min_optimal=70.0,
                max_optimal=99.0,
                status=status,
                status_color=color,
                delta_from_median=round(val - median_opt, 1),
                interpretation=interp,
                guideline_source=get_guideline_source("ADA", lang=lang),
                severity_level=sev,
            )
        )

    # 2. Systolic Blood Pressure (AHA/ACC Standard)
    if "blood_pressure" in vitals and vitals["blood_pressure"] > 0:
        val = round(float(vitals["blood_pressure"]), 1)
        median_opt = 110.0
        if val < 90:
            status, color, sev = "LOW", "blue", 2
        elif val <= 119:
            status, color, sev = "OPTIMAL", "emerald", 1
        elif val <= 129:
            status, color, sev = "BORDERLINE", "amber", 2
        elif val <= 139:
            status, color, sev = "ELEVATED", "amber", 3
        else:
            status, color, sev = "CRITICAL", "rose", 4

        interp = get_biomarker_interpretation("blood_pressure", val, status, lang=lang)
        concern = get_clinical_concern("blood_pressure", val, status, lang=lang)
        if concern:
            concerns.append(concern)

        benchmarks_list.append(
            BiomarkerBenchmark(
                name=get_biomarker_name("blood_pressure", lang=lang),
                key="blood_pressure",
                patient_value=val,
                unit="mmHg",
                normal_range="90 - 119 mmHg",
                min_optimal=90.0,
                max_optimal=119.0,
                status=status,
                status_color=color,
                delta_from_median=round(val - median_opt, 1),
                interpretation=interp,
                guideline_source=get_guideline_source("AHA", lang=lang),
                severity_level=sev,
            )
        )

    # 3. Body Mass Index (WHO Standard)
    if "bmi" in vitals and vitals["bmi"] > 0:
        val = round(float(vitals["bmi"]), 1)
        median_opt = 22.0
        if val < 18.5:
            status, color, sev = "LOW", "blue", 2
        elif val <= 24.9:
            status, color, sev = "OPTIMAL", "emerald", 1
        elif val <= 29.9:
            status, color, sev = "BORDERLINE", "amber", 2
        else:
            status, color, sev = "CRITICAL", "rose", 3

        interp = get_biomarker_interpretation("bmi", val, status, lang=lang)
        concern = get_clinical_concern("bmi", val, status, lang=lang)
        if concern:
            concerns.append(concern)

        benchmarks_list.append(
            BiomarkerBenchmark(
                name=get_biomarker_name("bmi", lang=lang),
                key="bmi",
                patient_value=val,
                unit="kg/m²",
                normal_range="18.5 - 24.9 kg/m²",
                min_optimal=18.5,
                max_optimal=24.9,
                status=status,
                status_color=color,
                delta_from_median=round(val - median_opt, 1),
                interpretation=interp,
                guideline_source=get_guideline_source("WHO", lang=lang),
                severity_level=sev,
            )
        )

    # 4. Total Serum Cholesterol (NCEP ATP III Standard)
    if "cholesterol" in vitals and vitals["cholesterol"] > 0:
        val = round(float(vitals["cholesterol"]), 1)
        median_opt = 165.0
        if val < 200:
            status, color, sev = "OPTIMAL", "emerald", 1
        elif val <= 239:
            status, color, sev = "BORDERLINE", "amber", 2
        else:
            status, color, sev = "CRITICAL", "rose", 4

        interp = get_biomarker_interpretation("cholesterol", val, status, lang=lang)
        concern = get_clinical_concern("cholesterol", val, status, lang=lang)
        if concern:
            concerns.append(concern)

        benchmarks_list.append(
            BiomarkerBenchmark(
                name=get_biomarker_name("cholesterol", lang=lang),
                key="cholesterol",
                patient_value=val,
                unit="mg/dL",
                normal_range="< 200 mg/dL",
                min_optimal=125.0,
                max_optimal=199.0,
                status=status,
                status_color=color,
                delta_from_median=round(val - median_opt, 1),
                interpretation=interp,
                guideline_source=get_guideline_source("NCEP", lang=lang),
                severity_level=sev,
            )
        )

    # 5. Resting Heart Rate
    if "heart_rate" in vitals and vitals["heart_rate"] > 0:
        val = round(float(vitals["heart_rate"]), 1)
        median_opt = 72.0
        if val < 60:
            status, color, sev = "LOW", "blue", 2
        elif val <= 100:
            status, color, sev = "OPTIMAL", "emerald", 1
        else:
            status, color, sev = "CRITICAL", "rose", 3

        interp = get_biomarker_interpretation("heart_rate", val, status, lang=lang)
        concern = get_clinical_concern("heart_rate", val, status, lang=lang)
        if concern:
            concerns.append(concern)

        benchmarks_list.append(
            BiomarkerBenchmark(
                name=get_biomarker_name("heart_rate", lang=lang),
                key="heart_rate",
                patient_value=val,
                unit="bpm",
                normal_range="60 - 100 bpm",
                min_optimal=60.0,
                max_optimal=100.0,
                status=status,
                status_color=color,
                delta_from_median=round(val - median_opt, 1),
                interpretation=interp,
                guideline_source=get_guideline_source("AHA", lang=lang),
                severity_level=sev,
            )
        )

    # 6. Fasting Serum Insulin
    if "insulin" in vitals and vitals["insulin"] > 0:
        val = round(float(vitals["insulin"]), 1)
        median_opt = 10.0
        if val <= 25.0:
            status, color, sev = "OPTIMAL", "emerald", 1
        else:
            status, color, sev = "ELEVATED", "amber", 3

        interp = get_biomarker_interpretation("insulin", val, status, lang=lang)
        concern = get_clinical_concern("insulin", val, status, lang=lang)
        if concern:
            concerns.append(concern)

        benchmarks_list.append(
            BiomarkerBenchmark(
                name=get_biomarker_name("insulin", lang=lang),
                key="insulin",
                patient_value=val,
                unit="uIU/mL",
                normal_range="2.0 - 25.0 uIU/mL",
                min_optimal=2.0,
                max_optimal=25.0,
                status=status,
                status_color=color,
                delta_from_median=round(val - median_opt, 1),
                interpretation=interp,
                guideline_source=get_guideline_source("ENDOCRINE", lang=lang),
                severity_level=sev,
            )
        )

    # Aggregate counts
    optimal_count = sum(1 for b in benchmarks_list if b.status == "OPTIMAL")
    elevated_count = sum(1 for b in benchmarks_list if b.status in ("BORDERLINE", "ELEVATED", "LOW"))
    critical_count = sum(1 for b in benchmarks_list if b.status == "CRITICAL")
    total_metrics = len(benchmarks_list)

    # Composite Health Index (0 to 100 scale)
    if total_metrics > 0:
        penalty = (elevated_count * 12.0) + (critical_count * 25.0)
        health_index = max(10.0, round(100.0 - penalty, 1))
    else:
        health_index = 85.0

    return ReportBenchmarkSummary(
        overall_health_index=health_index,
        total_metrics_evaluated=total_metrics,
        optimal_count=optimal_count,
        elevated_count=elevated_count,
        critical_count=critical_count,
        primary_clinical_concerns=concerns,
        benchmarks=benchmarks_list,
    )
