"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileImage, Sparkles, RefreshCw, Database, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface XrayAnalysisData {
  patient_id: string;
  primary_finding: string;
  confidence_score: number;
  findings_distribution: Record<string, number>;
  gradcam_ipfs_cid: string;
  gradcam_preview_base64: string;
  model_backbone: string;
}

export default function XrayVisualizer() {
  const [patientId, setPatientId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<XrayAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const uploadAndAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select or drop a chest radiograph image file.");
      return;
    }
    if (!patientId.trim()) {
      alert("Please enter a Patient Identifier.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("patient_id", patientId.trim());
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/xray-gradcam`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Inference error: ${res.statusText}`);
      }

      const data: XrayAnalysisData = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to analyze X-ray image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileImage className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
            <span>Multi-Modal NIH ChestX-ray8 Grad-CAM Visualizer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload a clinical chest radiograph to compute DenseNet-121 multi-label pathology classification and generate spatial Grad-CAM attention heatmaps pinned to Pinata IPFS.
          </p>
        </div>
      </div>

      {/* Patient ID Input & Upload Controls */}
      <div className="max-w-xs">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Identifier</label>
        <input
          type="text"
          placeholder="e.g. PAT-XRAY-001"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        />
      </div>

      {/* Upload Zone & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Upload Box */}
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-cyan-500/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/60 flex flex-col items-center justify-center space-y-3 min-h-[220px]"
          >
            <UploadCloud className="w-10 h-10 text-emerald-600/70 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedFile ? selectedFile.name : "Click or Drop Chest Radiograph"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Supports PNG, JPEG, DICOM-derived radiographs</p>
            </div>
          </div>

          <button
            onClick={uploadAndAnalyze}
            disabled={loading || !selectedFile || !patientId.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running DenseNet-121 Grad-CAM...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Radiograph & Pin to IPFS</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Visual Output (Raw vs Grad-CAM Overlay) */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center min-h-[220px]">
          {analysis ? (
            <div className="w-full space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Grad-CAM Spatial Heatmap Overlay</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
                  DenseNet-121 Layer 16
                </span>
              </div>

              {/* Heatmap Image */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56 flex items-center justify-center bg-black">
                <img
                  src={analysis.gradcam_preview_base64}
                  alt="Grad-CAM Radiographic Overlay"
                  className="max-h-56 w-auto object-contain"
                />
              </div>

              {/* IPFS Proof Link */}
              <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-cyan-400" />
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{analysis.gradcam_ipfs_cid}</span>
                </div>
                <a
                  href={`https://ipfs.io/ipfs/${analysis.gradcam_ipfs_cid.replace("ipfs://", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <span>Verify IPFS</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="text-center space-y-2">
              <img src={previewUrl} alt="Selected X-ray" className="max-h-44 w-auto rounded-xl object-contain mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Radiograph loaded. Click Analyze to run Grad-CAM.</p>
            </div>
          ) : (
            <div className="text-center text-slate-400 dark:text-slate-500 text-xs space-y-1">
              <FileImage className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-1" />
              <p>No radiograph selected.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-600">Drop or select an image file on the left to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pathology Breakdown Grid if analysis complete */}
      {analysis && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Primary Radiographic Finding:</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-emerald-700 dark:text-cyan-400">{analysis.primary_finding}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 font-mono">
                  {analysis.confidence_score}% Confidence
                </span>
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Benchmark: NIH ChestX-ray8</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {Object.entries(analysis.findings_distribution).map(([condition, score]) => (
              <div key={condition} className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{condition}</span>
                <span className={`font-bold font-mono ${score > 50 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
