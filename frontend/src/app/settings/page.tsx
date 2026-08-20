"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
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
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { fetchSystemSettings, updateSystemSettings, SystemSettings } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

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
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const updated = await updateSystemSettings(settings);
      setSettings(updated);
      setSuccessMsg("System configuration persisted successfully.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout activeSection="settings">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Platform & AI Hyperparameter Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              System & Security Settings
            </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Configure dual ensemble hyperparameters, AORE privacy constraints, Pinata IPFS gateways, and EVM network routing.
              </p>
            </div>

            <button
              onClick={loadSettings}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reload Defaults</span>
            </button>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs animate-fade-in font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {settings && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Section 1: AI Diagnostics & Compliance Parameters */}
              <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Clinical AI Engine & Compliance Parameters
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure baseline thresholds and privacy preservation bounds.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Diagnostic Model Backbone
                    </label>
                    <select
                      value={settings.default_model}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          default_model: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="xgboost">XGBoost Gradient Boosted Trees (AUC 0.942)</option>
                      <option value="random_forest">Random Forest Calibrated Ensemble</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Explainable AI (XAI) Method
                    </label>
                    <select
                      value={settings.default_xai_method}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          default_xai_method: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="shap">Kernel SHAP (Additive Feature Attributions)</option>
                      <option value="lime">LIME (Local Interpretable Model-Agnostic Explanations)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Risk Decision Threshold
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="0.9"
                      value={settings.risk_threshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          risk_threshold: parseFloat(e.target.value) || 0.5,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-3">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.strict_boundary_enforcement}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            strict_boundary_enforcement: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Strict Physiological Invariant Enforcement
                      </span>
                    </label>

                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.auto_mask_demographics}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            auto_mask_demographics: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        AORE Demographic Feature Masking
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Blockchain & Decentralized Storage Routing */}
              <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Blockchain Node & IPFS Storage Routing
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure EVM RPC networks and Pinata IPFS gateways.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                  <div>
                    <label className="block font-sans font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Active EVM Ledger Network
                    </label>
                    <input
                      type="text"
                      value={settings.active_evm_network}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          active_evm_network: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      IPFS Gateway URL
                    </label>
                    <input
                      type="text"
                      value={settings.ipfs_gateway_url}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ipfs_gateway_url: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2.5 cursor-pointer mt-4 font-sans">
                      <input
                        type="checkbox"
                        checked={settings.ipfs_auto_pin}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            ipfs_auto_pin: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        Auto-Pin Diagnostics to Pinata IPFS
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Persisting Configuration..." : "Save System Settings"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
    </DashboardLayout>
  );
}
