"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  FeatureContribution,
  explainBiomarkersWithGemini,
  BiomarkerExplanationResponse,
} from "@/lib/api";
import {
  BarChart3,
  Layers,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Volume2,
  VolumeX,
  Printer,
  Sliders,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Activity,
  Heart,
  ShieldCheck,
  Stethoscope,
  Info,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import Plotly to ensure SSR-safe client rendering in Next.js
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="h-80 flex items-center justify-center text-slate-400 font-mono text-sm">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Initializing High-Performance Plotly XAI Visualizer...</span>
      </div>
    </div>
  ),
});

interface XaiPlotProps {
  attributions: FeatureContribution[];
  method: string;
  patientId: string;
  modelType?: string;
  predictionLabel?: string;
  riskScore?: number;
  vitals?: Record<string, number>;
}

export default function XaiPlot({
  attributions,
  method,
  patientId,
  modelType = "random_forest",
  predictionLabel = "Clinical Assessment",
  riskScore = 0.0,
  vitals,
}: XaiPlotProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [viewMode, setViewMode] = useState<"directional" | "absolute">("directional");
  const [activeTab, setActiveTab] = useState<"guide" | "biomarkers" | "doctor" | "simulator">("guide");

  // Gemini Explanation State
  const [geminiExplanation, setGeminiExplanation] = useState<BiomarkerExplanationResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Audio Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // "What-If" Health Simulator State
  const [simGlucose, setSimGlucose] = useState<number>(() => {
    const g = attributions.find((a) => a.feature.toLowerCase().includes("glucose"))?.value;
    return typeof g === "number" ? g : 140;
  });
  const [simBmi, setSimBmi] = useState<number>(() => {
    const b = attributions.find((a) => a.feature.toLowerCase().includes("bmi"))?.value;
    return typeof b === "number" ? b : 29.5;
  });
  const [simBp, setSimBp] = useState<number>(() => {
    const bp = attributions.find((a) => a.feature.toLowerCase().includes("pressure") || a.feature.toLowerCase().includes("bp"))?.value;
    return typeof bp === "number" ? bp : 130;
  });

  // Calculate simulated risk reduction
  const calculateSimulatedRisk = () => {
    const baseline = riskScore || 0.8;
    let delta = 0;

    // Glucose effect: normal is ~90 mg/dL
    if (simGlucose < 100) delta -= 0.25;
    else if (simGlucose < 125) delta -= 0.12;

    // BMI effect: normal is ~23
    if (simBmi < 25) delta -= 0.22;
    else if (simBmi < 30) delta -= 0.10;

    // BP effect: normal is ~115
    if (simBp < 120) delta -= 0.15;
    else if (simBp < 130) delta -= 0.06;

    const projected = Math.max(0.05, Math.min(0.99, baseline + delta));
    return projected;
  };

  const simulatedRisk = calculateSimulatedRisk();
  const riskReductionPct = Math.max(0, ((riskScore - simulatedRisk) / (riskScore || 1)) * 100);

  // Auto-fetch explanation when attributions change
  useEffect(() => {
    if (attributions && attributions.length > 0) {
      handleGenerateExplanation();
    }
  }, [attributions, method, patientId, language]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerateExplanation = async () => {
    if (!attributions || attributions.length === 0) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await explainBiomarkersWithGemini({
        patient_id: patientId,
        prediction_label: predictionLabel,
        risk_score: riskScore,
        model_type: modelType,
        xai_method: method,
        attributions,
        vitals,
        language,
      });
      setGeminiExplanation(res);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to generate AI explanation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!geminiExplanation?.summary) return;
    navigator.clipboard.writeText(geminiExplanation.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (geminiExplanation?.summary) {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural voice
      const cleanText = geminiExplanation.summary
        .replace(/###/g, "")
        .replace(/\*\*/g, "")
        .replace(/[-*]/g, "")
        .replace(/💡|🌟|⚠️|🛡️/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!attributions || attributions.length === 0) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm">
        No feature attributions available. Run a clinical diagnostic to compute SHAP/LIME values.
      </div>
    );
  }

  const sorted = [...attributions].sort((a, b) => {
    return viewMode === "absolute" ? b.importance - a.importance : a.importance - b.importance;
  });

  const features = sorted.map((item) => item.feature);
  const values = sorted.map((item) => (item.direction === "negative" && viewMode === "directional" ? -item.importance : item.importance));
  const colors = sorted.map((item) => {
    if (item.is_masked) return "#94a3b8";
    if (viewMode === "absolute") return "#059669";
    return item.direction === "positive" ? "#e11d48" : "#059669";
  });

  const isLight = theme === "light";
  const textColor = isLight ? "#0f172a" : "#f8fafc";
  const gridColor = isLight ? "#e2e8f0" : "#1e293b";

  // Helper to render formatted plain-language summary cleanly into cards
  const renderFormattedSummary = (text: string) => {
    const rawSections = text.split(/(?=###\s)/g).filter((s) => s.trim().length > 0);

    if (rawSections.length === 0) {
      return <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{text}</p>;
    }

    return (
      <div className="space-y-4">
        {rawSections.map((sec, secIdx) => {
          const lines = sec.trim().split("\n");
          const headerLine = lines[0].replace(/^###\s*/, "").trim();
          const contentLines = lines.slice(1).filter((l) => l.trim().length > 0);

          const isOverview = headerLine.includes("🌟") || headerLine.toLowerCase().includes("mean") || headerLine.toLowerCase().includes("சொல்கிறது") || headerLine.toLowerCase().includes("मतलब");
          const isRiskDrivers = headerLine.includes("⚠️") || headerLine.toLowerCase().includes("raising") || headerLine.toLowerCase().includes("கவனம்") || headerLine.toLowerCase().includes("ध्यान");
          const isGoodNews = headerLine.includes("🛡️") || headerLine.toLowerCase().includes("good news") || headerLine.toLowerCase().includes("favor") || headerLine.toLowerCase().includes("சாதகமாக") || headerLine.toLowerCase().includes("रक्षा");
          const isRecommendations = headerLine.includes("💡") || headerLine.toLowerCase().includes("step") || headerLine.toLowerCase().includes("வழிகள்") || headerLine.toLowerCase().includes("कदम");

          let cardBorder = "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60";
          let icon = <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
          let headerColor = "text-slate-900 dark:text-white";

          if (isOverview) {
            cardBorder = "border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/40 dark:bg-cyan-950/20";
            icon = <HeartHandshake className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
            headerColor = "text-cyan-950 dark:text-cyan-200";
          } else if (isRiskDrivers) {
            cardBorder = "border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20";
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
            headerColor = "text-amber-950 dark:text-amber-200";
          } else if (isGoodNews) {
            cardBorder = "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20";
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
            headerColor = "text-emerald-950 dark:text-emerald-200";
          } else if (isRecommendations) {
            cardBorder = "border-teal-200 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/20";
            icon = <Lightbulb className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
            headerColor = "text-teal-950 dark:text-teal-200";
          }

          return (
            <div key={secIdx} className={`p-5 rounded-2xl border ${cardBorder} shadow-sm space-y-3 transition-all`}>
              <div className="flex items-center space-x-2.5 pb-2 border-b border-black/5 dark:border-white/5">
                {icon}
                <h4 className={`text-sm sm:text-base font-extrabold ${headerColor}`}>
                  {headerLine}
                </h4>
              </div>

              <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {contentLines.map((line, lIdx) => {
                  const trimmed = line.trim();

                  // Bullet points
                  if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                    const content = trimmed.replace(/^[-*]\s*/, "");
                    const parts = content.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={lIdx} className="flex items-start space-x-2 pl-1">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-1">&bull;</span>
                        <p>
                          {parts.map((p, pIdx) => {
                            if (p.startsWith("**") && p.endsWith("**")) {
                              return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
                            }
                            return p;
                          })}
                        </p>
                      </div>
                    );
                  }

                  // Numbered recommendations
                  if (/^\d+\./.test(trimmed)) {
                    const numberPrefix = trimmed.match(/^\d+\./)?.[0] || "";
                    const textAfterNumber = trimmed.replace(/^\d+\.\s*/, "");
                    const parts = textAfterNumber.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={lIdx} className="flex items-start space-x-2.5 pl-1 py-1">
                        <span className="w-6 h-6 rounded-full bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {numberPrefix.replace(".", "")}
                        </span>
                        <p className="pt-0.5">
                          {parts.map((p, pIdx) => {
                            if (p.startsWith("**") && p.endsWith("**")) {
                              return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
                            }
                            return p;
                          })}
                        </p>
                      </div>
                    );
                  }

                  // Normal paragraphs
                  const parts = trimmed.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={lIdx}>
                      {parts.map((p, pIdx) => {
                        if (p.startsWith("**") && p.endsWith("**")) {
                          return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
                        }
                        return p;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. TOP INTERACTIVE EXPLORATION TABS (State-of-the-Art Navigation)          */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "guide"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-900/5"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Plain-English Patient Guide</span>
          </button>

          <button
            onClick={() => setActiveTab("biomarkers")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "biomarkers"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-900/5"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Biomarker Range Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("doctor")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "doctor"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-900/5"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <Stethoscope className="w-4 h-4 text-cyan-600" />
            <span>Doctor Questions</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === "simulator"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-900/5"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>&quot;What-If&quot; Simulator</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${isSpeaking
                ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              }`}
            title={isSpeaking ? "Stop Reading Aloud" : "Listen to Explanation (Audio)"}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isSpeaking ? "Stop Voice" : "Listen"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Print Patient Summary"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1: PLAIN-ENGLISH PATIENT GUIDE (Empathetic, Zero-Jargon Summary)     */}
      {/* ========================================================================= */}
      {activeTab === "guide" && (
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Patient-First Health Translation

                  </h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    {geminiExplanation?.model || "gemini-2.5-flash"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Carefully written for zero medical knowledge: understanding your body with clarity and peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              {geminiExplanation && (
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-slate-400">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono animate-pulse">
                Translating health metrics into plain, encouraging language with Google Gemini 2.5 Flash...
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          ) : geminiExplanation ? (
            renderFormattedSummary(geminiExplanation.summary)
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: BIOMARKER RANGE MATRIX & PLOTLY SPECTRUM                         */}
      {/* ========================================================================= */}
      {activeTab === "biomarkers" && (
        <div className="space-y-6">
          {/* Biomarker Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(geminiExplanation?.biomarker_highlights || []).map((b, idx) => {
              const isElevated = b.status === "elevated";
              const isBorderline = b.status === "borderline";
              const isOptimal = b.status === "optimal";

              const badgeColor = isElevated
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : isBorderline
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {b.title}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase rounded-full border ${badgeColor}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {b.value !== undefined ? b.value : "--"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{b.unit}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Healthy Target:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{b.normal_range}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {b.why_it_matters}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plotly Attribution Visualizer */}
          <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Interactive Biomarker Impact Spectrum ({method.toUpperCase()})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How much each health factor pulled your score towards higher risk vs. lower risk.
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode("directional")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${viewMode === "directional"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                >
                  Directional (+/-)
                </button>
                <button
                  onClick={() => setViewMode("absolute")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${viewMode === "absolute"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                >
                  Absolute
                </button>
              </div>
            </div>

            <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/80 p-2 border border-slate-200 dark:border-slate-800/80">
              <Plot
                data={[
                  {
                    type: "bar",
                    x: values,
                    y: features,
                    orientation: "h",
                    marker: {
                      color: colors,
                      opacity: 0.9,
                    },
                    hoverinfo: "x+y",
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 140, r: 20, t: 20, b: 40 },
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                  font: {
                    color: textColor,
                    family: "var(--font-inter), sans-serif",
                    size: 11,
                  },
                  xaxis: {
                    title: {
                      text: viewMode === "directional" ? "Risk Pull (<- Lowers Risk | Raises Risk ->)" : "Impact Magnitude",
                      font: { size: 10, color: textColor },
                    },
                    gridcolor: gridColor,
                    zerolinecolor: isLight ? "#cbd5e1" : "#475569",
                  },
                  yaxis: {
                    autorange: "reversed",
                    gridcolor: gridColor,
                  },
                }}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 3: DOCTOR CONSULTATION CHECKLIST (Actionable, Printable)            */}
      {/* ========================================================================= */}
      {activeTab === "doctor" && (
        <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-cyan-100 dark:border-cyan-900/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-cyan-900/5 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Questions to Ask Your Doctor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or screenshot these questions to have an informed, collaborative conversation with your physician.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(geminiExplanation?.doctor_questions || [
              "What is my target HbA1c (3-month blood sugar average)?",
              "Are there specific dietary changes that can help improve my metabolic numbers?",
              "When should we recheck these blood markers to monitor progress?",
            ]).map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 flex items-start space-x-3.5 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {q}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Helps your doctor tailor clinical guidance to your exact numbers.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Lifestyle Tips */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Evidence-Based Daily Habits You Can Start Today:</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {(geminiExplanation?.lifestyle_tips || [
                "Aim for a 20-30 minute brisk walk after your largest meal of the day.",
                "Drink 2-3 liters of clean water daily and limit sweetened drinks.",
                "Incorporate more leafy greens, legumes, and whole grains into your daily meals.",
              ]).map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-600 mt-0.5">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 4: INTERACTIVE "WHAT-IF" HEALTH SIMULATOR (Live Motivation Tool)      */}
      {/* ========================================================================= */}
      {activeTab === "simulator" && (
        <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/5 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Interactive &quot;What-If&quot; Health Simulator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See how improving your daily biomarkers directly drops your projected risk into the safe zone.
              </p>
            </div>
          </div>

          {/* Live Outcome Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-teal-50/70 dark:from-slate-900 dark:via-indigo-950/20 dark:to-teal-950/20 border border-indigo-200 dark:border-indigo-800/40">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Measured Risk</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {(riskScore * 100).toFixed(1)}%
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Simulated Target Risk</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>{(simulatedRisk * 100).toFixed(1)}%</span>
                <TrendingDown className="w-5 h-5" />
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Potential Risk Reduction</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                -{riskReductionPct.toFixed(0)}% Lower
              </p>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-5 pt-2">
            {/* 1. Glucose Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">Simulate Target Blood Sugar (Glucose):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{simGlucose} mg/dL</span>
              </div>
              <input
                type="range"
                min={70}
                max={250}
                step={1}
                value={simGlucose}
                onChange={(e) => setSimGlucose(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>70 (Optimal)</span>
                <span>99 (Normal Cap)</span>
                <span>125 (Pre-diabetic)</span>
                <span>250 (High)</span>
              </div>
            </div>

            {/* 2. BMI Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">Simulate Target Body Mass Index (BMI):</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{simBmi.toFixed(1)} kg/m²</span>
              </div>
              <input
                type="range"
                min={18.5}
                max={45}
                step={0.5}
                value={simBmi}
                onChange={(e) => setSimBmi(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>18.5 (Healthy)</span>
                <span>24.9 (Healthy Cap)</span>
                <span>29.9 (Overweight)</span>
                <span>45 (Obese)</span>
              </div>
            </div>

            {/* 3. Blood Pressure Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">Simulate Target Blood Pressure (Systolic):</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{simBp} mmHg</span>
              </div>
              <input
                type="range"
                min={90}
                max={180}
                step={1}
                value={simBp}
                onChange={(e) => setSimBp(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>90 (Optimal)</span>
                <span>120 (Normal)</span>
                <span>140 (Hypertension)</span>
                <span>180 (Severe)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
