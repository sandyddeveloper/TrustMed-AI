"use client";

import React, { useState } from "react";
import { Sparkles, BrainCircuit, CheckCircle2, Lock, RefreshCw, AlertTriangle } from "lucide-react";
import { predictClinicalRisk, MedicalInferenceResponse, anchorRecordOnChain, AnchorRecordResponse } from "@/lib/api";

interface RiskPredictorProps {
  onPredictionComplete: (res: MedicalInferenceResponse) => void;
  onRecordAnchored: (anchor: AnchorRecordResponse) => void;
}

export default function RiskPredictor({ onPredictionComplete, onRecordAnchored }: RiskPredictorProps) {
  const [patientId, setPatientId] = useState("");
  const [formData, setFormData] = useState({
    age: "",
    blood_pressure: "",
    glucose_level: "",
    bmi: "",
    cholesterol: "",
    heart_rate: "",
  });
  const [modelType, setModelType] = useState<"random_forest" | "xgboost">("xgboost");
  const [xaiMethod, setXaiMethod] = useState<"shap" | "lime">("shap");
  const [maskDemographics, setMaskDemographics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [result, setResult] = useState<MedicalInferenceResponse | null>(null);
  const [anchorResult, setAnchorResult] = useState<AnchorRecordResponse | null>(null);

  const handleInputChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      alert("Please provide a Patient Identifier.");
      return;
    }

    setIsLoading(true);
    setAnchorResult(null);

    const numericFeatures: Record<string, number> = {
      age: parseFloat(formData.age) || 0,
      blood_pressure: parseFloat(formData.blood_pressure) || 0,
      glucose_level: parseFloat(formData.glucose_level) || 0,
      bmi: parseFloat(formData.bmi) || 0,
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
      });
      setResult(response);
      onPredictionComplete(response);
    } catch (err: unknown) {
      alert((err as Error).message || "Prediction failed. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnchor = async () => {
    if (!result) return;
    setIsAnchoring(true);

    try {
      const recordHash = "0x" + Array.from(new TextEncoder().encode(JSON.stringify(result)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 64);

      const anchor = await anchorRecordOnChain({
        record_id: result.patient_id,
        record_hash: recordHash,
        ipfs_cid: result.ipfs_cid || undefined,
        metadata: {
          prediction: result.prediction,
          model: result.model_version,
          method: result.xai_method,
          security_rate: result.secre_compliance.security_rate,
          explainability_rate: result.secre_compliance.explainability_rate,
        },
      });

      setAnchorResult(anchor);
      onRecordAnchored(anchor);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to anchor record on blockchain.");
    } finally {
      setIsAnchoring(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>SecRE-XAI Clinical Diagnostic & Dual Ensemble Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Input clinical patient parameters to run comparative inference (Random Forest vs XGBoost) with automated SecRE compliance metrics.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handlePredict} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Patient ID */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Identifier</label>
            <input
              type="text"
              placeholder="e.g. PAT-2026-001"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age (Years)</label>
            <input
              type="number"
              placeholder="e.g. 58"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              required
            />
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Systolic BP (mmHg)</label>
            <input
              type="number"
              placeholder="e.g. 138"
              value={formData.blood_pressure}
              onChange={(e) => handleInputChange("blood_pressure", e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              required
            />
          </div>

          {/* Glucose Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fasting Glucose (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 115"
              value={formData.glucose_level}
              onChange={(e) => handleInputChange("glucose_level", e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              required
            />
          </div>

          {/* BMI */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">BMI (kg/m²)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 27.4"
              value={formData.bmi}
              onChange={(e) => handleInputChange("bmi", e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              required
            />
          </div>

          {/* Cholesterol */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Cholesterol (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 210"
              value={formData.cholesterol}
              onChange={(e) => handleInputChange("cholesterol", e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              required
            />
          </div>
        </div>

        {/* Dual Ensemble & Controls Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Dual Ensemble Model Selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Dual Ensemble Model:</span>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModelType("xgboost")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  modelType === "xgboost"
                    ? "bg-emerald-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                XGBoost (AUC 0.965)
              </button>
              <button
                type="button"
                onClick={() => setModelType("random_forest")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  modelType === "random_forest"
                    ? "bg-emerald-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Random Forest (AUC 0.942)
              </button>
            </div>
          </div>

          {/* XAI Method & AORE Masking */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">XAI & Privacy Controls:</span>
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setXaiMethod("shap")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                    xaiMethod === "shap"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  SHAP
                </button>
                <button
                  type="button"
                  onClick={() => setXaiMethod("lime")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                    xaiMethod === "lime"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  LIME
                </button>
              </div>

              <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={maskDemographics}
                  onChange={(e) => setMaskDemographics(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>AORE Masking</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing SecRE-XAI Metrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run SecRE-XAI Diagnostic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Results & SecRE Compliance Card */}
      {result && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Risk Probability Card */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Risk Probability</span>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{(result.prediction * 100).toFixed(1)}%</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    result.prediction >= 0.5
                      ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  }`}
                >
                  {result.prediction_label}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.prediction >= 0.5 ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${result.prediction * 100}%` }}
                />
              </div>
            </div>

            {/* Model & Cross-Validation */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Ensemble Model</span>
              <div className="my-2">
                <span className="text-xl font-bold text-emerald-700 dark:text-teal-400 uppercase">{result.model_type}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Cross-Val AUC: {result.cross_val_auc}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
            </div>

            {/* SecRE Compliance Scorecard */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">SecRE Security Rate (SR)</span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(result.secre_compliance.security_rate * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                  {result.secre_compliance.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                Explainability (ER): {(result.secre_compliance.explainability_rate * 100).toFixed(1)}%
              </span>
            </div>

            {/* Anchor On Blockchain Action Card */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Web3 Immutability</span>
              {anchorResult ? (
                <div className="my-2 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Proof Anchored On-Chain</span>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-400 my-2">
                  Commit this clinical diagnosis and SHAP explanation to the blockchain audit trail.
                </p>
              )}
              <button
                type="button"
                onClick={handleAnchor}
                disabled={isAnchoring || !!anchorResult}
                className="w-full py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAnchoring ? "Anchoring..." : anchorResult ? "Audit Log Verified" : "Anchor to Blockchain"}</span>
              </button>
            </div>
          </div>

          {/* Violations Alert if Out of Bounds */}
          {result.secre_compliance.violations.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">SecRE Physiological Boundary Warnings:</p>
                <ul className="list-disc list-inside space-y-0.5 mt-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {result.secre_compliance.violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
