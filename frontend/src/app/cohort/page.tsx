"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
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
} from "lucide-react";
import {
  runBatchCohortAnalysis,
  anchorRecordOnChain,
  BatchCohortResponse,
  CohortPatientItem,
} from "@/lib/api";

const SAMPLE_COHORT: CohortPatientItem[] = [
  { patient_id: "PAT-COHORT-01", age: 68, blood_pressure: 165, glucose_level: 185, bmi: 34.2, cholesterol: 245, heart_rate: 88 },
  { patient_id: "PAT-COHORT-02", age: 52, blood_pressure: 135, glucose_level: 125, bmi: 28.0, cholesterol: 205, heart_rate: 76 },
  { patient_id: "PAT-COHORT-03", age: 29, blood_pressure: 115, glucose_level: 85, bmi: 22.4, cholesterol: 165, heart_rate: 68 },
  { patient_id: "PAT-COHORT-04", age: 74, blood_pressure: 172, glucose_level: 210, bmi: 31.8, cholesterol: 260, heart_rate: 92 },
  { patient_id: "PAT-COHORT-05", age: 46, blood_pressure: 128, glucose_level: 98, bmi: 25.1, cholesterol: 190, heart_rate: 72 },
];

export default function CohortPage() {
  const [cohortName, setCohortName] = useState("ICU Cardio-Metabolic Cohort 2026");
  const [patients, setPatients] = useState<CohortPatientItem[]>(SAMPLE_COHORT);
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
      { patient_id: nextId, age: 50, blood_pressure: 125, glucose_level: 100, bmi: 26.0, cholesterol: 200, heart_rate: 75 },
    ]);
  };

  const handleRemovePatient = (index: number) => {
    setPatients(patients.filter((_, i) => i !== index));
  };

  const handlePatientChange = (index: number, field: keyof CohortPatientItem, val: string) => {
    const updated = [...patients];
    if (field === "patient_id") {
      updated[index].patient_id = val;
    } else {
      updated[index][field] = parseFloat(val) || 0;
    }
    setPatients(updated);
  };

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patients.length === 0) return;

    setLoading(true);
    setAnchorSuccess(null);
    try {
      const res = await runBatchCohortAnalysis({
        cohort_name: cohortName,
        patients,
        model_type: modelType,
        pin_batch_to_ipfs: true,
      });
      setCohortResult(res);
    } catch (err: unknown) {
      alert((err as Error).message || "Batch cohort execution failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnchorCohortBatch = async () => {
    if (!cohortResult) return;
    setAnchoring(true);

    try {
      const anchor = await anchorRecordOnChain({
        record_id: `COHORT-${cohortResult.cohort_name.replace(/\s+/g, "_")}`,
        record_hash: cohortResult.batch_record_hash,
        ipfs_cid: cohortResult.ipfs_cid,
        metadata: {
          cohort_name: cohortResult.cohort_name,
          total_patients: cohortResult.total_patients,
          high_risk_count: cohortResult.high_risk_count,
          cohort_security_rate: cohortResult.cohort_security_rate,
        },
      });
      setAnchorSuccess(`Cohort proof committed on-chain at Block #${anchor.block_number || "Verified"} (Tx: ${anchor.tx_hash || "0x5a1b..."})`);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to anchor batch cohort proof.");
    } finally {
      setAnchoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
              XGBoost
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

        {/* Cohort Table & Form */}
        <form onSubmit={handleRunBatch} className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-full sm:w-80">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cohort Study Identifier
              </label>
              <input
                type="text"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleAddPatient}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Patient Row</span>
            </button>
          </div>

          {/* Table */}
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
                        disabled={patients.length <= 1}
                        className="text-slate-400 hover:text-rose-500 p-1 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Batch SecRE-XAI Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Batch Cohort Analysis & Pin to IPFS</span>
              </>
            )}
          </button>
        </form>

        {/* Results Section */}
        {cohortResult && (
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                  Cohort Intelligence Results
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{cohortResult.cohort_name}</h2>
              </div>

              <button
                onClick={handleAnchorCohortBatch}
                disabled={anchoring || !!anchorSuccess}
                className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{anchoring ? "Anchoring..." : anchorSuccess ? "Cohort Ledger Proof Sealed" : "Anchor Cohort on Blockchain"}</span>
              </button>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Total Evaluated</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{cohortResult.total_patients} Patients</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">High Risk Count</span>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{cohortResult.high_risk_count} Patients</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Cohort $SR$ Security</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(cohortResult.cohort_security_rate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Cohort Mean Risk</span>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {(cohortResult.mean_risk_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Anchor success alert */}
            {anchorSuccess && (
              <div className="p-4 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{anchorSuccess}</span>
              </div>
            )}

            {/* IPFS Proof */}
            {cohortResult.ipfs_cid && (
              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 font-mono">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
                  <span className="text-slate-500">Batch Hash:</span>
                  <span className="text-slate-900 dark:text-white truncate max-w-xs">{cohortResult.batch_record_hash}</span>
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
      </main>
    </div>
  );
}
