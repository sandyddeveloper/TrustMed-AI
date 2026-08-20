"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  Lock,
  RefreshCw,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  predictClinicalRisk,
  MedicalInferenceResponse,
  anchorRecordOnChain,
  AnchorRecordResponse,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface RiskPredictorProps {
  onPredictionComplete: (res: MedicalInferenceResponse) => void;
  onRecordAnchored?: (anchor: AnchorRecordResponse) => void;
  initialVitals?: Record<string, string | number>;
  initialPatientId?: string;
}

export default function RiskPredictor({
  onPredictionComplete,
  onRecordAnchored,
  initialVitals,
  initialPatientId,
}: RiskPredictorProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [patientId, setPatientId] = useState(initialPatientId || user?.patient_id || "");

  useEffect(() => {
    if (initialPatientId) {
      setPatientId(initialPatientId);
    } else if (user?.patient_id && !patientId) {
      setPatientId(user.patient_id);
    }
  }, [user, patientId, initialPatientId]);

  const [formData, setFormData] = useState({
    age: "",
    blood_pressure: "",
    glucose_level: "",
    bmi: "",
    insulin: "",
    cholesterol: "",
    heart_rate: "",
  });

  useEffect(() => {
    if (initialVitals) {
      setFormData((prev) => ({
        ...prev,
        age: initialVitals.age ? String(initialVitals.age) : prev.age,
        blood_pressure: initialVitals.blood_pressure ? String(initialVitals.blood_pressure) : prev.blood_pressure,
        glucose_level: initialVitals.glucose_level ? String(initialVitals.glucose_level) : prev.glucose_level,
        bmi: initialVitals.bmi ? String(initialVitals.bmi) : prev.bmi,
        insulin: initialVitals.insulin ? String(initialVitals.insulin) : prev.insulin,
        cholesterol: initialVitals.cholesterol ? String(initialVitals.cholesterol) : prev.cholesterol,
        heart_rate: initialVitals.heart_rate ? String(initialVitals.heart_rate) : prev.heart_rate,
      }));
    }
  }, [initialVitals]);
  const [modelType, setModelType] = useState<"random_forest" | "xgboost">("xgboost");
  const [xaiMethod, setXaiMethod] = useState<"shap" | "lime">("shap");
  const [maskDemographics, setMaskDemographics] = useState(false);
  const [strictCompliance, setStrictCompliance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MedicalInferenceResponse | null>(null);
  const [anchorResult, setAnchorResult] = useState<AnchorRecordResponse | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!patientId.trim()) {
      setErrorMessage("Please specify a Patient ID / Record Number.");
      return;
    }

    if (!formData.glucose_level || !formData.blood_pressure || !formData.age) {
      setErrorMessage("Please fill in the required vital parameters (Age, Blood Pressure, Glucose).");
      return;
    }

    setIsLoading(true);
    setAnchorResult(null);

    const numericFeatures: Record<string, number> = {
      age: parseFloat(formData.age) || 0,
      blood_pressure: parseFloat(formData.blood_pressure) || 0,
      glucose_level: parseFloat(formData.glucose_level) || 0,
      bmi: parseFloat(formData.bmi) || 0,
      insulin: parseFloat(formData.insulin) || 0,
      cholesterol: parseFloat(formData.cholesterol) || 0,
      heart_rate: parseFloat(formData.heart_rate) || 0,
    };

    try {
      const response = await predictClinicalRisk({
        patient_id: patientId.trim(),
        features: numericFeatures,
        model_type: modelType,
        explain: true,
        xai_method: xaiMethod,
        mask_demographics: maskDemographics,
        strict_compliance: strictCompliance,
        pin_to_ipfs: true,
        language: language,
      });
      setResult(response);
      onPredictionComplete(response);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Diagnostic calculation failed.";
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnchor = async () => {
    if (!result) return;
    setIsAnchoring(true);

    try {
      const recordHash =
        result.deterministic_hash ||
        "0x" +
          Array.from(new TextEncoder().encode(JSON.stringify(result)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 64);

      const anchor = await anchorRecordOnChain({
        record_id: result.patient_id,
        record_hash: recordHash,
        ipfs_cid: result.ipfs_cid || undefined,
        patient_id: result.patient_id,
        diagnostic_result: result.prediction_label,
        confidence_score: result.confidence,
        risk_score: result.prediction,
        metadata: {
          prediction: result.prediction,
          model: result.model_version,
          method: result.xai_method,
          security_rate: result.secre_compliance.security_rate,
          explainability_rate: result.secre_compliance.explainability_rate,
        },
      });

      setAnchorResult(anchor);
      onRecordAnchored?.(anchor);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to anchor record on blockchain.");
    } finally {
      setIsAnchoring(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 transition-colors">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t("predictor.title", "Patient Physiological Vitals & AI Diagnostic Assessment")}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t("predictor.subtitle", "Run dual-ensemble ML inference with strict physiological invariant checks and compute local explainability.")}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Clinical Input Alert</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handlePredict} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-8 gap-4">
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("profile.patientId", "Patient ID / Record No.")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PAT-1042"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.ageField", "Age")} (Years) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={120}
              placeholder="e.g. 54"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.bp", "Blood Pressure")} (mmHg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 138"
              value={formData.blood_pressure}
              onChange={(e) => handleInputChange("blood_pressure", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.glucose", "Fasting Blood Glucose")} (mg/dL) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 140"
              value={formData.glucose_level}
              onChange={(e) => handleInputChange("glucose_level", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.bmi", "Body Mass Index (BMI)")}
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 28.5"
              value={formData.bmi}
              onChange={(e) => handleInputChange("bmi", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.insulin", "Insulin Level")} (&mu;U/mL)
            </label>
            <input
              type="number"
              placeholder="e.g. 95"
              value={formData.insulin}
              onChange={(e) => handleInputChange("insulin", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.cholesterol", "Total Cholesterol")} (mg/dL)
            </label>
            <input
              type="number"
              placeholder="e.g. 210"
              value={formData.cholesterol}
              onChange={(e) => handleInputChange("cholesterol", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("report.heartRate", "Resting Heart Rate")} (bpm)
            </label>
            <input
              type="number"
              placeholder="e.g. 76"
              value={formData.heart_rate}
              onChange={(e) => handleInputChange("heart_rate", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Options Bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-600 dark:text-slate-400">{t("predictor.model", "Diagnostic Model")}:</span>
            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModelType("xgboost")}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                  modelType === "xgboost"
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                XGBoost Ensemble
              </button>
              <button
                type="button"
                onClick={() => setModelType("random_forest")}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                  modelType === "random_forest"
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Random Forest
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maskDemographics}
                onChange={(e) => setMaskDemographics(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-slate-600 dark:text-slate-400">
                Privacy-Mask Demographics
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t("common.loading", "Analyzing Biomarkers & Running Explainability Engine...")}</span>
            </>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4" />
              <span>{t("predictor.runBtn", "Run SecRE-XAI Diagnostic Risk Inference")}</span>
            </>
          )}
        </button>
      </form>

      {/* Patient Assessment Result Card */}
      {result && (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-950 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-sm ${
                  result.prediction >= 0.5
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30"
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                }`}
              >
                {Math.round(result.prediction * 100)}%
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("predictor.resultTitle", "Diagnostic Risk Assessment Result")}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {result.prediction_label}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Assessment for Patient <span className="font-mono font-bold text-slate-900 dark:text-white">{result.patient_id}</span> with {(result.confidence * 100).toFixed(0)}% model certainty
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("common.verified", "Verified Clean Vitals")}</span>
              </span>
            </div>
          </div>

          {/* Cryptographic Proof & Decentralized Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-sans text-slate-400 uppercase font-bold block">
                Tamper-Proof SHA-256 Record Hash:
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-emerald-700 dark:text-emerald-400 font-semibold">
                  {result.deterministic_hash}
                </span>
                <button
                  type="button"
                  onClick={() => result.deterministic_hash && copyToClipboard(result.deterministic_hash)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {copiedHash ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-sans text-slate-400 uppercase font-bold block">
                Decentralized IPFS Storage Identifier:
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-cyan-700 dark:text-cyan-400 font-semibold">
                  {result.ipfs_cid || "ipfs://QmSecRE..."}
                </span>
                <a
                  href={`https://ipfs.io/ipfs/${result.ipfs_cid?.replace("ipfs://", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Anchor to Blockchain Button */}
          {!anchorResult ? (
            <button
              type="button"
              onClick={handleAnchor}
              disabled={isAnchoring}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isAnchoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t("common.loading", "Anchoring Immutable Proof to Smart Contract...")}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t("predictor.anchorBtn", "Lock & Anchor Patient Diagnostic Record on Blockchain")}</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-xl space-y-2 text-xs font-mono text-emerald-900 dark:text-emerald-300 animate-fade-in">
              <div className="flex items-center space-x-2 font-bold font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("predictor.anchored", "Diagnostic Record Successfully Anchored into Blockchain Ledger!")}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Transaction Hash:</span>
                <span className="truncate max-w-xs">{anchorResult.tx_hash}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Block Number:</span>
                <span>#{anchorResult.block_number}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
