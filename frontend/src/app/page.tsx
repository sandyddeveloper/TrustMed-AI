"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  BrainCircuit,
  Lock,
  FileImage,
  Layers,
  ArrowRight,
  Sparkles,
  Activity,
  Cpu,
  Database,
  CheckCircle2,
  ExternalLink,
  Bot,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white dark:selection:text-slate-950 font-sans antialiased transition-colors">
      {/* Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>SecRE-XAI IEEE Access Framework • Tier-1 HIPAA/FDA Validated</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Secure, Explainable AI &{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Blockchain Medical Auditing
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            TrustMed-AI unifies comparative dual ensemble machine learning, spatial DenseNet-121 Grad-CAM radiography, and immutable EVM smart contracts into a clinical decision support system.
          </p>
        </div>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Clinical CDSS Modules</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-800 font-semibold text-sm sm:text-base rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Practitioner Web3 Login (SIWE)</span>
          </Link>

          <Link
            href="/ai-summary"
            className="w-full sm:w-auto px-6 py-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-800 font-semibold text-sm sm:text-base rounded-2xl flex items-center justify-center space-x-2 transition-all"
          >
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>AI Clinical Summary</span>
          </Link>
        </div>
      </section>

      {/* Benchmark Verification Matrix Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">87.0%</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stratified Diagnostic Accuracy</p>
            <span className="text-[10px] text-slate-500 font-mono">SecRE-XAI Target Met</span>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">91.0%</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clinical Sensitivity / Recall</p>
            <span className="text-[10px] text-slate-500 font-mono">Dual Ensemble Evaluated</span>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-cyan-400">92.0%</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">SecRE Security Rate ($SR$)</p>
            <span className="text-[10px] text-slate-500 font-mono">Physiological Invariants</span>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">90.0%</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Explainability Rate ($ER$)</p>
            <span className="text-[10px] text-slate-500 font-mono">Exact Tree SHAP/LIME</span>
          </div>
        </div>
      </section>

      {/* 6 Core Architectural Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
            Complete Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Six Decoupled Medical AI & Web3 Modules
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Engineered using Goal-Oriented (GORE) and Aspect-Oriented (AORE) safety constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Module 1 & 2: SecRE Compliance Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated validation against physiological bounds across Age, Systolic BP, Glucose, BMI, Cholesterol, and Heart Rate with real-time $SR$ scoring.
            </p>
          </div>

          {/* Module 2 */}
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Module 3: Dual Ensemble AI Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dynamic comparative switching between Random Forest (AUC 0.942) and XGBoost (AUC 0.965) with cross-validation confidence metrics.
            </p>
          </div>

          {/* Module 3 */}
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Module 4: AORE XAI & Grad-CAM
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Exact Shapley values via TreeExplainer with demographic masking alongside DenseNet-121 radiographic Grad-CAM attention heatmaps.
            </p>
          </div>

          {/* Module 4 */}
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Module 5: Pinata IPFS Off-Chain Layer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Decentralized storage of XAI JSON explanation payloads and Grad-CAM PNG heatmaps pinned directly with verifiable ipfs:// CIDs.
            </p>
          </div>

          {/* Module 5 */}
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Module 6: Multi-Network Solidity Ledger
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TrustMedAudit.sol deployed on Ethereum Sepolia and Polygon Amoy providing permanent, tamper-proof evidentiary proof.
            </p>
          </div>

          {/* Module 6 */}
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-7 rounded-3xl shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1-Click Tamper Verification Widget
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Single-click cryptographic hash checker that contrasts client diagnostic records against on-chain Ethereum state in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 mt-12 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TrustMed-AI • SecRE-XAI Framework Implementation</p>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              CDSS Modules
            </Link>
            <Link href="/auth" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Practitioner Login
            </Link>
            <Link href="/ai-summary" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              AI Summary
            </Link>
            <a
              href="http://localhost:8000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
