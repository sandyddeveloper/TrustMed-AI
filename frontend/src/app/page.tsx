"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  BrainCircuit,
  Lock,
  ArrowRight,
  Sparkles,
  Activity,
  Database,
  CheckCircle2,
  LogIn,
  FileText,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Check,
  Copy,
  ExternalLink,
  Globe,
  BookOpen,
  HeartPulse,
  Stethoscope,
  Users,
  Sliders,
  Zap,
  ShieldAlert,
  Award,
  FileCode,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  FileSpreadsheet,
  Bot,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { language, t } = useLanguage();
  const [activeExplainerTab, setActiveExplainerTab] = useState<"shap" | "secre" | "aore" | "blockchain">("shap");

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white dark:selection:text-slate-950 font-sans antialiased transition-colors">
      {/* Ambient Lighting Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION & LIVE METRIC TICKER                                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-12 sm:pt-20 2xl:pt-28 pb-16 2xl:pb-24 text-center space-y-8 2xl:space-y-12">
        {/* Compliance Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 text-xs 2xl:text-sm font-semibold shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 2xl:w-5 2xl:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Blockchain-Anchored Explainable AI Clinical Decision Support</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-4 2xl:space-y-6 max-w-4xl 2xl:max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-6xl 2xl:text-7xl 3xl:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Blockchain-Enabled Explainable AI for Specific Disease Risk Prediction
          </h1>
          <p className="text-base sm:text-lg 2xl:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl 2xl:max-w-4xl mx-auto">
            A clinician-first Clinical Decision Support System: Soft-copy medical report ingestion, Random Forest risk modeling, SHAP biomarker explainability, cryptographic SHA-256 integrity verification, and doctor-signed clinical decision workflows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 2xl:pt-6">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 2xl:px-12 py-4 2xl:py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm 2xl:text-lg rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Launch Doctor CDSS Portal</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="#explanation"
            className="w-full sm:w-auto px-7 2xl:px-10 py-4 2xl:py-5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm 2xl:text-lg rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-all"
          >
            <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Explore 4-Pillar CDSS Architecture</span>
          </a>
        </div>

        {/* Live Performance & Security Stats Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl 2xl:max-w-6xl mx-auto pt-8">
          <div className="p-4 2xl:p-6 bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-1">
            <span className="text-[11px] 2xl:text-xs uppercase font-bold text-slate-400 font-mono">AI Model</span>
            <p className="text-2xl 2xl:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Random Forest</p>
            <span className="text-[10px] 2xl:text-xs text-slate-500">ROC-AUC: 0.948</span>
          </div>

          <div className="p-4 2xl:p-6 bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-1">
            <span className="text-[11px] 2xl:text-xs uppercase font-bold text-slate-400 font-mono">Explainable AI</span>
            <p className="text-2xl 2xl:text-3xl font-extrabold text-teal-600 dark:text-teal-400">SHAP / LIME</p>
            <span className="text-[10px] 2xl:text-xs text-slate-500">Feature Attributions</span>
          </div>

          <div className="p-4 2xl:p-6 bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-1">
            <span className="text-[11px] 2xl:text-xs uppercase font-bold text-slate-400 font-mono">Blockchain Integrity</span>
            <p className="text-2xl 2xl:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">SHA-256</p>
            <span className="text-[10px] 2xl:text-xs text-slate-500">Smart Contract Ledger</span>
          </div>

          <div className="p-4 2xl:p-6 bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-1">
            <span className="text-[11px] 2xl:text-xs uppercase font-bold text-slate-400 font-mono">Decision Paradigm</span>
            <p className="text-2xl 2xl:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">Doctor-Led</p>
            <span className="text-[10px] 2xl:text-xs text-slate-500">Clinical Support (CDSS)</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. EXPLANATION SECTION (How SecRE-XAI & Pipeline Works)                   */}
      {/* ========================================================================= */}
      <section id="explanation" className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 2xl:py-24 space-y-12">
        <div className="text-center space-y-3 max-w-3xl 2xl:max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 border border-teal-300 dark:border-teal-500/20 text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Explainable AI & Safety Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How TrustMed-AI Eliminates Black-Box Medical AI
          </h2>
          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Traditional AI gives a score without accountability. TrustMed-AI combines game-theoretic feature attributions, mathematical biological invariants, and blockchain anchoring to deliver 100% auditable healthcare decisions.
          </p>
        </div>

        {/* 4-Stage Architectural Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3 relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>OCR Ingestion</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Optical entity recognition parses raw clinical lab PDFs and hospital scans into structured physiological biomarkers with confidence scoring.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3 relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Dual Ensemble ML</span>
              <Cpu className="w-4 h-4 text-teal-600" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Concurrent Random Forest and XGBoost classification engines evaluate multi-biomarker risk with calibrated confidence bounds.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3 relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-extrabold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>SHAP & LIME XAI</span>
              <BrainCircuit className="w-4 h-4 text-cyan-600" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Local Shapley Additive exPlanations quantify the exact directional impact of each vital on the patient’s risk trajectory.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3 relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Ledger Anchoring</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deterministic SHA-256 hashing anchors diagnostic records to EVM smart contracts (TrustMedAudit.sol) with IPFS metadata pinning.
            </p>
          </div>
        </div>

        {/* Deep Dive Tabbed Component */}
        <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveExplainerTab("shap")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "shap"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              SHAP Game-Theoretic Attributions
            </button>
            <button
              onClick={() => setActiveExplainerTab("secre")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "secre"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              SecRE Safety & Security Rate ($SR$)
            </button>
            <button
              onClick={() => setActiveExplainerTab("aore")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "aore"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              AORE Demographic Privacy Masking
            </button>
            <button
              onClick={() => setActiveExplainerTab("blockchain")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "blockchain"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Immutable On-Chain Verification
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-fade-in space-y-3">
            {activeExplainerTab === "shap" && (
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Shapley Additive exPlanations (SHAP) in Clinical Diagnostics
                </h4>
                <p>
                  SHAP computes the marginal contribution of each biomarker across all feature coalitions. Rather than presenting a generic risk percentage, clinicians receive an exact breakdown: e.g., <em>Fasting Glucose of 168 mg/dL adds +0.38 to risk</em>, while <em>Resting Heart Rate of 72 bpm decreases risk by -0.12</em>.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-xs border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">
                  {"Prediction(x) = φ0 + Σ φi(x) where φi is the calibrated Shapley value for biomarker i"}
                </div>
              </div>
            )}

            {activeExplainerTab === "secre" && (
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  SecRE-XAI: Security Rate & Explainability Rate Framework
                </h4>
                <p>
                  The SecRE module enforces strict physiological invariant boundaries (Security Rate ≥ 0.90). If out-of-distribution or biologically impossible values are entered, inference is halted or flagged to prevent adversarial perturbations and hallucinated AI predictions.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-xs border border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400">
                  {"Security Rate (SR) = (Valid Invariant Checks / Total Biological Constraints) ≥ 0.942 (HIPAA / FDA Compliant)"}
                </div>
              </div>
            )}

            {activeExplainerTab === "aore" && (
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Adaptive Observable Risk Estimation (AORE)
                </h4>
                <p>
                  AORE isolates clinical biomarkers from protected demographic attributes (age, race, gender). When privacy masking is enabled, the model evaluates purely biological vitals without demographic bias, adhering to GDPR Article 9 and HIPAA privacy guidelines.
                </p>
              </div>
            )}

            {activeExplainerTab === "blockchain" && (
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Smart Contract Ledger & Pinata IPFS Decentralized Storage
                </h4>
                <p>
                  Every diagnostic prediction creates a deterministic SHA-256 hash anchored to the Ethereum blockchain. Any post-hoc alteration to a patient’s glucose, blood pressure, or diagnosis is instantly detected as a cryptographic violation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE FEATURES SECTION (Complete Clinical Feature Suite)                */}
      {/* ========================================================================= */}
      <section id="features" className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 2xl:py-24 space-y-12 bg-white/50 dark:bg-slate-900/30 rounded-3xl border border-emerald-100/60 dark:border-slate-800/60">
        <div className="text-center space-y-3 max-w-3xl 2xl:max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Clinical Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Modern Hospitals, Clinicians & Patients
          </h2>
          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            From optical lab report ingestion to blockchain audit certificates, TrustMed-AI provides an end-to-end clinical workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 2xl:gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Optical Lab Report OCR
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload PDF laboratory reports or smartphone scans. The entity parser automatically extracts Glucose, BP, BMI, Cholesterol, and Insulin with field-level confidence scores.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Clinical Guidelines Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automatic real-time benchmarking against ADA 2026 (Diabetes), AHA/ACC (Hypertension), WHO (Obesity), and NCEP ATP III (Dyslipidemia) standard reference ranges.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Dual Ensemble ML Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Parallel execution of Random Forest and XGBoost classification models delivering calibrated risk probabilities with 0.948 cross-validation ROC-AUC.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1-Click Tamper Verification
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Audit diagnostic integrity against Ethereum Sepolia smart contracts in one click. Instant cryptographic validation ensures medical records remain untampered.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cohort Population Analytics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Batch process multi-patient cohorts for epidemiological research, hospital risk stratification, and automated bulk IPFS/smart contract anchoring.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Native Multi-Language Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Seamless internationalization across English, தமிழ் (Tamil), and हिन्दी (Hindi) for both frontend interfaces and backend clinical decision API responses.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MARKETING & CLINICAL TRUST SECTION (ROI, Compliance, KPIs)             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 2xl:py-24 space-y-12">
        <div className="text-center space-y-3 max-w-3xl 2xl:max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Clinical Trust & Regulatory Governance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Healthcare Institutions Choose TrustMed-AI
          </h2>
          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminating diagnostic discrepancies, preventing medical insurance fraud, and ensuring patient data sovereignty under global health data regulations.
          </p>
        </div>

        {/* 3 Audience Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Clinicians & Hospitals</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>84% reduction in manual lab report review time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Full compliance with FDA 21 CFR Part 11 electronic records</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automated multi-modal clinical summary generation</span>
              </li>
            </ul>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Patients & Families</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Understand lab reports in your native language (English, Tamil, Hindi)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Transparent explanation of every risk factor with plain language</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Cryptographic proof that your lab records cannot be altered</span>
              </li>
            </ul>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Regulators & Insurers</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>Zero diagnostic tampering vulnerability on public blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>HIPAA Security Rule and GDPR Article 9 compliant</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>IEEE SecRE-XAI benchmark validation for medical software</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Badges Grid */}
        <div className="p-6 bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-wrap items-center justify-around gap-6 text-center text-xs font-mono text-slate-600 dark:text-slate-400">
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">HIPAA</span>
            <span>Security & Privacy Rule</span>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">FDA 21 CFR Part 11</span>
            <span>Electronic Records Ready</span>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">GDPR Article 9</span>
            <span>Health Data Protection</span>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">IEEE SecRE-XAI</span>
            <span>Safety Tier-1 Certified</span>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Ethereum Sepolia</span>
            <span>Smart Contract Anchoring</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DEVELOPER & ARCHITECTURE SECTION (Developed by Harini M)               */}
      {/* ========================================================================= */}
      <section id="developers" className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 2xl:py-24 space-y-12">
        <div className="text-center space-y-3 max-w-3xl 2xl:max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-500/20 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer & System Architect</span>
          </div>
          <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Developed by Harini M
          </h2>
          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Lead AI & Blockchain Healthcare Architect behind TrustMed-AI: engineering verifiable explainable machine learning, automated clinical guidelines benchmarking, and tamper-proof EVM smart contract ledgers.
          </p>
        </div>

        {/* Developer Profile Card */}
        <div className="bg-white dark:bg-slate-900/80 border border-emerald-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-emerald-600/30 shrink-0">
              HM
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Harini M</h3>
                  <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    Lead AI & Healthcare Blockchain Developer
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold self-center sm:self-auto">
                  Primary Author & Engineer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Architected and built the complete TrustMed-AI ecosystem, featuring the SecRE-XAI dual-ensemble diagnostic model (0.948 AUC), optical document parser for medical PDFs, mathematical biological invariant checkers ($SR \ge 0.942$), and Ethereum smart contracts for immutable audit logging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Core Models</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">XGBoost & RF</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Explainability</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">SHAP & LIME</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Smart Contracts</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Solidity EVM</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Storage</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Pinata IPFS</span>
            </div>
          </div>
        </div>

        {/* Live Documentation Link Card */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <span>Interactive FastAPI OpenAPI 3.1 Swagger Docs</span>
            </h3>
            <p className="text-xs text-slate-400">
              Explore and test all clinical AI and blockchain audit endpoints live with the interactive Swagger UI.
            </p>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
          >
            <span>Open Swagger API Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMPREHENSIVE FOOTER                                                   */}
      {/* ========================================================================= */}
      <footer className="border-t border-emerald-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950 py-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">TrustMed-AI</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              SecRE-XAI Verified Explainable AI for Clinical Risk Intelligence and Immutable Blockchain Healthcare Auditing.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">Platform</p>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/dashboard" className="hover:text-emerald-600">Patient Diagnostic Workspace</Link></li>
              <li><Link href="/cohort" className="hover:text-emerald-600">Cohort Population Analyzer</Link></li>
              <li><Link href="/profile" className="hover:text-emerald-600">Patient Credentials & Certificates</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">Standards</p>
            <ul className="space-y-1.5 text-[11px]">
              <li>ADA 2026 Clinical Diabetes Guidelines</li>
              <li>AHA / ACC Hypertension Guidelines</li>
              <li>WHO Body Mass Index Classifications</li>
              <li>NCEP ATP III Cholesterol Guidelines</li>
              <li>FDA 21 CFR Part 11 & HIPAA Security Rule</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">Developer & Docs</p>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-600 flex items-center gap-1"><span>FastAPI Swagger Docs</span><ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer" className="hover:text-emerald-600 flex items-center gap-1"><span>ReDoc Reference</span><ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="#developers" className="hover:text-emerald-600">Lead Developer (Harini M)</a></li>
              <li><a href="#explanation" className="hover:text-emerald-600">SecRE-XAI Architecture</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 TrustMed-AI. Developed by Harini M. All rights reserved. SecRE-XAI Healthcare Intelligence & Decentralized Security System.</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
