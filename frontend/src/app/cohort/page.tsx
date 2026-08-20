"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Lock,
  CheckCircle2,
  Database,
  ExternalLink,
  Plus,
  Trash2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  runBatchCohortAnalysis,
  anchorRecordOnChain,
  BatchCohortResponse,
  CohortPatientItem,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CohortPage() {
  const { user } = useAuth();

  const [cohortName, setCohortName] = useState("");
  const [patients, setPatients] = useState<CohortPatientItem[]>([]);
  const [modelType, setModelType] = useState("xgboost");
  const [loading, setLoading] = useState(false);
  const [cohortResult, setCohortResult] = useState<BatchCohortResponse | null>(null);

  // Anchoring state
  const [anchoring, setAnchoring] = useState(false);
  const [anchorSuccess, setAnchorSuccess] = useState<string | null>(null);

  const handleAddPatient = () => {
    const nextId = `PAT-COHORT-0${patients.length + 1}`;
    setPatients([
      ...patients,
      {
        patient_id: nextId,
        age: 45,
        blood_pressure: 120,
        glucose_level: 95,
        bmi: 24.5,
        insulin: 15,
        cholesterol: 180,
        heart_rate: 72,
      },
    ]);
  };

  const handleRemovePatient = (index: number) => {
    setPatients(patients.filter((_, i) => i !== index));
  };

  const handlePatientChange = (
    index: number,
    field: keyof CohortPatientItem,
    value: string | number
  ) => {
    const updated = [...patients];
    updated[index] = { ...updated[index], [field]: value };
    setPatients(updated);
  };

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patients.length === 0) {
      alert("Please add at least one patient record to the cohort.");
      return;
    }

    setLoading(true);
    setCohortResult(null);
    setAnchorSuccess(null);

    try {
      const res = await runBatchCohortAnalysis({
        cohort_name: cohortName || "Clinical Population Cohort",
        patients,
        model_type: modelType,
        pin_batch_to_ipfs: true,
      });
      setCohortResult(res);
    } catch (err: unknown) {
      alert((err as Error).message || "Batch cohort analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnchorCohortBatch = async () => {
    if (!cohortResult) return;
    setAnchoring(true);

    try {
      const res = await anchorRecordOnChain({
        record_id: `COHORT-${cohortResult.cohort_name.replace(/\s+/g, "_")}`,
        record_hash: cohortResult.batch_record_hash,
        ipfs_cid: cohortResult.ipfs_cid,
        patient_id: "BATCH-COHORT-AGGREGATE",
        diagnostic_result: `Cohort Average Risk: ${(cohortResult.mean_risk_score * 100).toFixed(1)}%`,
        confidence_score: 0.95,
        risk_score: cohortResult.mean_risk_score,
        metadata: {
          cohort_name: cohortResult.cohort_name,
          total_patients: cohortResult.total_patients,
          high_risk_count: cohortResult.high_risk_count,
          security_rate: cohortResult.cohort_security_rate,
        },
      });
      setAnchorSuccess(res.tx_hash || "Anchored on-chain successfully.");
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to anchor batch cohort proof.");
    } finally {
      setAnchoring(false);
    }
  };

  return (
    <DashboardLayout activeSection="cohort">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Multi-Patient Cohort Diagnostic & Risk Stratification</span>
            </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                Batch Clinical Cohort Analyzer
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Ingest patient cohorts to run concurrent dual ensemble inference, calculate aggregated SecRE compliance, and anchor batch proofs.
              </p>
            </div>

            {/* Model Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setModelType("xgboost")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modelType === "xgboost"
                    ? "bg-emerald-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                XGBoost (Fast)
              </button>
              <button
                onClick={() => setModelType("random_forest")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modelType === "random_forest"
                    ? "bg-emerald-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Random Forest
              </button>
            </div>
          </div>

          {/* Builder Form */}
          <form onSubmit={handleRunBatch} className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-full sm:w-80">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cohort Name / Study Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICU Cardiac Cohort Q3"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAddPatient}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-1.5 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Patient Row</span>
                </button>
              </div>
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Age</th>
                    <th className="p-3">Systolic BP</th>
                    <th className="p-3">Glucose</th>
                    <th className="p-3">BMI</th>
                    <th className="p-3">Cholesterol</th>
                    <th className="p-3">Heart Rate</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {patients.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/40">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={p.patient_id}
                          onChange={(e) => handlePatientChange(idx, "patient_id", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-28 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => handlePatientChange(idx, "age", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-16 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={p.blood_pressure}
                          onChange={(e) => handlePatientChange(idx, "blood_pressure", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-16 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={p.glucose_level}
                          onChange={(e) => handlePatientChange(idx, "glucose_level", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-16 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="0.1"
                          value={p.bmi}
                          onChange={(e) => handlePatientChange(idx, "bmi", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-16 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={p.cholesterol}
                          onChange={(e) => handlePatientChange(idx, "cholesterol", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-16 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={p.heart_rate}
                          onChange={(e) => handlePatientChange(idx, "heart_rate", e.target.value)}
                          className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs w-16 focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePatient(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                        No patients added to cohort yet. Click &quot;Add Patient Row&quot; above to build your study.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              disabled={loading || patients.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Multi-Patient Dual-Ensemble ML Inferences...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Population Batch Stratification & IPFS Pin</span>
                </>
              )}
            </button>
          </form>

          {/* Results Summary */}
          {cohortResult && (
            <div className="bg-white dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                    Cohort Analysis Complete
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Study Tag: {cohortResult.cohort_name}
                  </h2>
                </div>
                <button
                  onClick={handleAnchorCohortBatch}
                  disabled={anchoring || !!anchorSuccess}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{anchoring ? "Anchoring..." : anchorSuccess ? "Anchored On-Chain" : "Anchor Batch to Ethereum"}</span>
                </button>
              </div>

              {anchorSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs animate-fade-in font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{anchorSuccess}</span>
                </div>
              )}

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Cohort Size</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{cohortResult.total_patients}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 font-medium block">Mean Predicted Risk</span>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {(cohortResult.mean_risk_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 font-medium block">High Risk Subjects</span>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{cohortResult.high_risk_count}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 font-medium block">SecRE Rate ($SR$)</span>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {(cohortResult.cohort_security_rate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Hashes */}
              {cohortResult.ipfs_cid && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between text-xs font-mono gap-2">
                  <div>
                    <span className="text-slate-500">Batch Hash:</span>
                    <span className="text-slate-900 dark:text-white truncate max-w-xs ml-2">{cohortResult.batch_record_hash}</span>
                  </div>
                  <a
                    href={`https://ipfs.io/ipfs/${cohortResult.ipfs_cid.replace("ipfs://", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-cyan-400 flex items-center gap-1 font-bold"
                  >
                    <span>Verify Batch IPFS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Individual Patient Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Patient ID</th>
                      <th className="p-3">Risk Probability</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3">Top XAI Risk Driver</th>
                      <th className="p-3">Security Rate ($SR$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {cohortResult.patient_results.map((r, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold">{r.patient_id}</td>
                        <td className="p-3 font-bold">{(r.prediction * 100).toFixed(1)}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.prediction >= 0.5
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                            }`}
                          >
                            {r.prediction_label}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{r.top_risk_factor}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {(r.security_rate * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    </DashboardLayout>
  );
}
