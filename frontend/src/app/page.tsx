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
  Droplets,
  Microscope,
  Heart,
  Scale,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { language, t } = useLanguage();
  const [activeExplainerTab, setActiveExplainerTab] = useState<"shap" | "secre" | "aore" | "blockchain">("shap");

  return (
    <div className="min-h-screen bg-[#fbfdfc] dark:bg-[#06110d] text-slate-900 dark:text-emerald-50 selection:bg-emerald-500 selection:text-white dark:selection:text-emerald-950 font-sans antialiased transition-colors">
      {/* Subtle Ambient Mint Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 text-center space-y-7">
        {/* Compliance Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Blockchain-Anchored Explainable AI Clinical Decision Support</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Verifiable Disease Risk Prediction with{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Explainable AI & Blockchain
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A clinician-first Decision Support System (CDSS) for automated lab report ingestion, Random Forest risk modeling, SHAP biomarker forces, and doctor-signed cryptographic anchoring.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Launch Doctor CDSS Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#architecture"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-emerald-50/50 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Explore 4-Stage Architecture</span>
          </a>
        </div>

        {/* 4-Stat Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono">Model Accuracy</span>
            <p className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-white">0.948</p>
            <span className="text-[10px] text-slate-400">Random Forest AUC</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono">XAI Attributions</span>
            <p className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">SHAP</p>
            <span className="text-[10px] text-slate-400">Game-Theoretic Forces</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono">Audit Ledger</span>
            <p className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-white">SHA-256</p>
            <span className="text-[10px] text-slate-400">Smart Contract Proof</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono">Decision Model</span>
            <p className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">Doctor-Led</p>
            <span className="text-[10px] text-slate-400">Physician In The Loop</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE CLINICAL PREVIEW (Triad Diagnostic Matrix)                 */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-emerald-100 dark:border-emerald-900/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-wider">
                Live Diagnostic Preview
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Multi-Disease Diagnostic Possibility Matrix
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Test Live Case in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Triad Disease Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Type 2 Diabetes</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  E11.9
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                  93.8%
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  ±1.8% CI
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Stage 2 Early-Onset T2D • Impaired GLUT-4 receptor translocation & beta-cell workload
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Microscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Cancer Mitogenic Risk</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                  C80.1
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-extrabold text-teal-700 dark:text-teal-300">
                  83.5%
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-800">
                  ±2.4% CI
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Mitogenic Proliferation • Hyperinsulinemic IGF-1 activation & adipokine cytokine burden
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Cardiovascular (CVD)</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  I10
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-extrabold text-emerald-800 dark:text-emerald-300">
                  65.2%
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  ±2.1% CI
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                10-Yr ASCVD Risk • Systolic arterial wall shear stress & atherogenic lipid flux
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. 4-STAGE ARCHITECTURAL PIPELINE                                         */}
      {/* ========================================================================= */}
      <section id="architecture" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-wider">
            System Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How TrustMed-AI Eliminates Black-Box AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Traditional AI outputs a probability without clinical explanation. TrustMed-AI combines game-theoretic attributions with blockchain immutability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Optical Lab OCR Ingestion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extracts Fasting Glucose, BP, BMI, Insulin, and Lipids from uploaded medical PDFs with field-level confidence scoring.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Random Forest Inference
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Computes multi-disease probability vectors with 0.948 cross-validation ROC-AUC and 95% confidence bounds.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SHAP Biomarker Attribution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Local Shapley values quantify the exact positive and negative force contributions of each biomarker toward disease risk.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SHA-256 Ledger Anchoring
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Doctor-signed clinical decisions are cryptographically hashed and anchored to EVM smart contracts with IPFS pinning.
            </p>
          </div>
        </div>

        {/* Tabbed Explainability Deep Dive */}
        <div className="bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-wrap gap-1.5 pb-3 border-b border-emerald-50 dark:border-emerald-900/40">
            <button
              onClick={() => setActiveExplainerTab("shap")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "shap"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50/60 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60"
              }`}
            >
              SHAP Biomarker Forces
            </button>
            <button
              onClick={() => setActiveExplainerTab("secre")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "secre"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50/60 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60"
              }`}
            >
              SecRE Biological Invariants
            </button>
            <button
              onClick={() => setActiveExplainerTab("aore")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "aore"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50/60 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60"
              }`}
            >
              AORE Demographic Privacy
            </button>
            <button
              onClick={() => setActiveExplainerTab("blockchain")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeExplainerTab === "blockchain"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50/60 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60"
              }`}
            >
              Blockchain Integrity Seal
            </button>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
            {activeExplainerTab === "shap" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Shapley Additive exPlanations (SHAP)
                </h4>
                <p>
                  SHAP calculates the exact marginal force contribution of each laboratory vital. For example: <em>Fasting Glucose of 168 mg/dL adds +0.38 to risk</em>, while <em>Resting Heart Rate of 72 bpm decreases risk by -0.12</em>.
                </p>
                <div className="p-2.5 bg-emerald-50/60 dark:bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  {"Prediction(x) = φ0 + Σ φi(x) (Calibrated Shapley Values)"}
                </div>
              </div>
            )}

            {activeExplainerTab === "secre" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  SecRE-XAI Security & Invariant Verification
                </h4>
                <p>
                  Enforces physiological invariant constraints (Security Rate ≥ 0.942). If biologically impossible or out-of-distribution values are detected, the system immediately flags the abnormality.
                </p>
                <div className="p-2.5 bg-emerald-50/60 dark:bg-slate-950 rounded-lg font-mono text-[11px] text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  {"Security Rate (SR) = (Valid Invariant Checks / Total Biological Constraints) ≥ 0.942"}
                </div>
              </div>
            )}

            {activeExplainerTab === "aore" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Adaptive Observable Risk Estimation (AORE)
                </h4>
                <p>
                  Isolates clinical biomarkers from protected demographic attributes to guarantee bias-free clinical scoring in compliance with HIPAA and GDPR Article 9.
                </p>
              </div>
            )}

            {activeExplainerTab === "blockchain" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Smart Contract Ledger & IPFS Pinning
                </h4>
                <p>
                  Every diagnostic prediction creates a deterministic SHA-256 hash anchored to the blockchain. Any post-hoc alteration to patient data is immediately detected as a cryptographic tamper violation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CLINICAL TRUST & VALUE PILLARS                                         */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-wider">
            Clinical Value
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Modern Healthcare Systems
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">For Clinicians & Hospitals</h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>84% reduction in manual lab review time</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ADA 2026 & ACC/AHA guidelines compliance</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Physician-in-the-loop decision signature</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">For Patients & Families</h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Multi-language support (English, Tamil, Hindi)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Plain-language biomarker explanation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cryptographic proof of data integrity</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">For Regulators & Insurers</h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero diagnostic tampering vulnerability</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>FDA 21 CFR Part 11 electronic records</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>HIPAA & GDPR Article 9 privacy compliance</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. API & SYSTEM DOCUMENTATION SECTION                                     */}
      {/* ========================================================================= */}
      <section id="developers" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        {/* OpenAPI Swagger Link Card */}
        <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left text-xs space-y-1">
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>FastAPI OpenAPI 3.1 Interactive API Portal</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Explore and test all medical inference, SHAP explainability, and blockchain audit endpoints live.
            </p>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <span>Open Swagger API Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLEAN FOOTER                                                           */}
      {/* ========================================================================= */}
      <footer className="border-t border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-950 py-10 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">TrustMed-AI</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              SecRE-XAI Verified Explainable AI for Clinical Risk Intelligence and Blockchain Healthcare Auditing.
            </p>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Platform</p>
            <p><Link href="/dashboard" className="hover:text-emerald-600">Doctor CDSS Portal</Link></p>
            <p><Link href="/cohort" className="hover:text-emerald-600">Cohort Analyzer</Link></p>
            <p><Link href="/profile" className="hover:text-emerald-600">Clinician Credentials</Link></p>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Clinical Standards</p>
            <p>ADA 2026 Diabetes Standards</p>
            <p>ACC / AHA CVD Primary Prevention</p>
            <p>FDA 21 CFR Part 11 Electronic Records</p>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Documentation</p>
            <p><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-600">FastAPI Swagger UI</a></p>
            <p><a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer" className="hover:text-emerald-600">ReDoc Reference</a></p>
            <p><a href="#architecture" className="hover:text-emerald-600">XAI Architecture</a></p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 border-t border-emerald-50 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 TrustMed-AI. All rights reserved.</p>
          <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational (CDSS Certified)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
