"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FeatureContribution } from "@/lib/api";
import { BarChart3, HelpCircle, Eye, EyeOff, Layers } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
}

export default function XaiPlot({ attributions, method, patientId, modelType = "random_forest" }: XaiPlotProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"directional" | "absolute">("directional");

  if (!attributions || attributions.length === 0) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
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
  const cardBg = isLight ? "#ffffff" : "#020617";

  return (
    <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="uppercase">{method} Feature Importance Spectrum</span>
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-semibold">
              {modelType.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualizing individual biomarker contributions towards diagnostic classification for {patientId}.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setViewMode("directional")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === "directional"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Directional (+/- Risk)
          </button>
          <button
            onClick={() => setViewMode("absolute")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === "absolute"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Absolute Magnitude
          </button>
        </div>
      </div>

      {/* Plotly Visual Container */}
      <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/80 p-2 border border-slate-200 dark:border-slate-800/80">
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
                text: viewMode === "directional" ? "Shapley Attribution (<- Decreases Risk | Increases Risk ->)" : "Absolute Feature Weight",
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

      {/* Legend & Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-rose-600 dark:bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300">Elevates Risk (+)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">Protective / Lowers Risk (-)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-slate-400 dark:bg-slate-500" />
            <span className="text-slate-700 dark:text-slate-300">AORE Masked</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 font-mono text-[11px]">
          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>SHAP TreeExplainer v2.0</span>
        </div>
      </div>
    </div>
  );
}
