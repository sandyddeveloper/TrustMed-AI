"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Sliders,
  Cpu,
  ShieldCheck,
  Lock,
  Database,
  Bell,
  CheckCircle2,
  RefreshCw,
  Save,
} from "lucide-react";
import { fetchSystemSettings, updateSystemSettings, SystemSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg(null);
    try {
      const updated = await updateSystemSettings(settings);
      setSettings(updated);
      setSuccessMsg("System configuration successfully updated and persisted across active endpoints.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Platform & AI Hyperparameter Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Clinician & System Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure dual ensemble hyperparameters, AORE privacy constraints, Pinata IPFS gateways, and EVM network routing.
            </p>
          </div>
        </div>

        {loading || !settings ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
            <p className="text-xs font-mono">Loading system configuration from backend...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: AI Diagnostic & XAI Hyperparameters */}
            <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>AI Diagnostic Engine & Explainability</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default Ensemble Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Primary Ensemble Model
                  </label>
                  <select
                    value={settings.default_model}
                    onChange={(e) => setSettings({ ...settings, default_model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="xgboost">XGBoost Classifier (AUC: 0.965, Latency: 12ms)</option>
                    <option value="random_forest">Random Forest Classifier (AUC: 0.942, Latency: 8ms)</option>
                  </select>
                </div>

                {/* Default XAI Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary XAI Attribution Algorithm
                  </label>
                  <select
                    value={settings.default_xai_method}
                    onChange={(e) => setSettings({ ...settings, default_xai_method: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="shap">SHAP (TreeExplainer Exact Shapley Values)</option>
                    <option value="lime">LIME (Local Interpretable Model-Agnostic Explanations)</option>
                  </select>
                </div>

                {/* Risk Threshold Slider */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Clinical Risk Classification Threshold (P_cutoff)</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {(settings.risk_threshold * 100).toFixed(0)}% Probability
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.80"
                    step="0.05"
                    value={settings.risk_threshold}
                    onChange={(e) => setSettings({ ...settings, risk_threshold: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Scores equal or exceeding {(settings.risk_threshold * 100).toFixed(0)}% are classified as High Risk.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: AORE Privacy & Compliance Controls */}
            <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>AORE Privacy & SecRE Compliance Controls</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Enforce Strict Physiological Invariants Rejection
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instantly flag and downgrade Security Rate ($SR$) on out-of-distribution vitals.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.strict_boundary_enforcement}
                    onChange={(e) => setSettings({ ...settings, strict_boundary_enforcement: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      AORE Automated Demographic Feature Redaction
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mask sensitive age and demographic markers on public explainability vectors.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.auto_mask_demographics}
                    onChange={(e) => setSettings({ ...settings, auto_mask_demographics: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Web3 Blockchain & IPFS Configuration */}
            <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Web3 Multi-Network Ledger & Decentralized IPFS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Active EVM Network for Ledger Anchoring
                  </label>
                  <select
                    value={settings.active_evm_network}
                    onChange={(e) => setSettings({ ...settings, active_evm_network: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="sepolia">Ethereum Sepolia Testnet (ChainId: 11155111)</option>
                    <option value="amoy">Polygon Amoy Testnet (ChainId: 80002)</option>
                    <option value="localhost">Local Hardhat Devnet (ChainId: 31337)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Public IPFS Gateway Resolver
                  </label>
                  <input
                    type="text"
                    value={settings.ipfs_gateway_url}
                    onChange={(e) => setSettings({ ...settings, ipfs_gateway_url: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Pinata Cloud Auto-Pinning
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Automatically upload XAI metadata and Grad-CAM PNG heatmaps to IPFS upon diagnosis.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.ipfs_auto_pin}
                      onChange={(e) => setSettings({ ...settings, ipfs_auto_pin: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Toast Feedback */}
            {successMsg && (
              <div className="p-4 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Persisting Configuration...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save System Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
