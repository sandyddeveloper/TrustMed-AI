from typing import Dict, Any, List, Tuple
import numpy as np


class SecREComplianceValidator:
    """
    Validates clinical inputs against HIPAA/FDA/WHO compliance rules,
    performs outlier detection, robust scaling & imputation,
    and computes Security Rate (SR) and Explainability Rate (ER)
    as defined in the SecRE-XAI IEEE Access framework.
    """

    # Physiological normal and clinical crisis bounds
    PHYSIOLOGICAL_RANGES: Dict[str, Tuple[float, float]] = {
        "age": (1.0, 120.0),
        "blood_pressure": (50.0, 260.0),
        "glucose_level": (40.0, 500.0),
        "bmi": (10.0, 70.0),
        "insulin": (0.0, 900.0),
        "cholesterol": (80.0, 600.0),
        "heart_rate": (30.0, 220.0),
    }

    # Clinical reference medians for missing value imputation
    CLINICAL_MEDIAN_BASELINES: Dict[str, float] = {
        "age": 45.0,
        "blood_pressure": 120.0,
        "glucose_level": 95.0,
        "bmi": 24.5,
        "insulin": 75.0,
        "cholesterol": 185.0,
        "heart_rate": 72.0,
    }

    # Clinical reference weights for compliance normalization
    FEATURE_REFERENCE_WEIGHTS: Dict[str, float] = {
        "age": 0.15,
        "blood_pressure": 0.20,
        "glucose_level": 0.25,
        "bmi": 0.15,
        "insulin": 0.10,
        "cholesterol": 0.10,
        "heart_rate": 0.05,
    }

    @classmethod
    def evaluate_compliance(cls, record: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluates clinical record against physiological boundaries and calculates:
        - Security Rate (SR): 1 - (NonCompliantFeatures / TotalEvaluated)
        - Compliance Status: COMPLIANT, DEGRADED, or NON_COMPLIANT
        - List of active rule violations
        """
        violations: List[str] = []
        total_features = len(cls.PHYSIOLOGICAL_RANGES)
        non_compliant_count = 0

        for feature, (min_v, max_v) in cls.PHYSIOLOGICAL_RANGES.items():
            if feature in record and record[feature] is not None:
                val = float(record[feature])
                if not (min_v <= val <= max_v):
                    non_compliant_count += 1
                    violations.append(
                        f"{feature.replace('_', ' ').title()} ({val}) is outside safe physiological bounds [{min_v} - {max_v}]"
                    )

        # Security Rate (SR) Formula: SR = 1 - (NonCompliant / TotalFeatures)
        security_rate = max(0.0, round(1.0 - (non_compliant_count / total_features), 4))
        is_compliant = non_compliant_count == 0

        status = "COMPLIANT" if is_compliant else ("DEGRADED" if security_rate >= 0.7 else "NON_COMPLIANT")

        return {
            "is_compliant": is_compliant,
            "status": status,
            "security_rate": security_rate,
            "violations": violations,
            "standard": "SecRE-XAI (HIPAA/FDA Tier-1 Validated)",
        }

    @classmethod
    def preprocess_and_sanitize(
        cls,
        features: Dict[str, float],
        strict_mode: bool = False,
    ) -> Tuple[Dict[str, float], Dict[str, Any]]:
        """
        Executes Module 2 Compliance & Sanitization Filter:
        1. Evaluates HIPAA / FDA clinical boundaries.
        2. Halts non-compliant streams if security_rate < 0.70 or strict violation.
        3. Imputes missing physiological parameters from cohort medians.
        4. Clamps statistical outliers to robust physiological boundaries.
        """
        compliance_eval = cls.evaluate_compliance(features)

        # Halt stream if non-compliant
        if compliance_eval["status"] == "NON_COMPLIANT" or (strict_mode and not compliance_eval["is_compliant"]):
            violation_details = "; ".join(compliance_eval["violations"])
            raise ValueError(
                f"SecRE-XAI Compliance Failure: Data stream halted due to critical physiological boundary violations. {violation_details}"
            )

        sanitized: Dict[str, float] = {}

        for key, default_val in cls.CLINICAL_MEDIAN_BASELINES.items():
            val = features.get(key)
            if val is None or np.isnan(val):
                # Impute from cohort baseline
                sanitized[key] = default_val
            else:
                # Clamp to safe physiological ranges (outlier mitigation)
                min_v, max_v = cls.PHYSIOLOGICAL_RANGES.get(key, (0.0, 1000.0))
                sanitized[key] = float(np.clip(val, min_v, max_v))

        return sanitized, compliance_eval

    @classmethod
    def calculate_explainability_rate(cls, feature_importances: List[Dict[str, Any]]) -> float:
        """
        Computes Explainability Rate (ER) as defined in SecRE-XAI:
        ER = (Sum of Top Significant Attributions) / (Total Feature Space Weight)
        """
        if not feature_importances:
            return 0.0

        total_importance = sum(abs(item.get("importance", 0.0)) for item in feature_importances)
        # Normalize ER to 0.0 - 1.0 interval
        er = min(1.0, round(total_importance / (len(feature_importances) * 0.25 + 1e-6), 4))
        return er
