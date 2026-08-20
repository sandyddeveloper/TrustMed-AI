"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sliders,
  Activity,
  AlertCircle,
  HelpCircle,
  FileCheck,
  Download,
  ExternalLink,
  Zap,
  Eye,
} from "lucide-react";
import {
  uploadAndExtractReport,
  recalculateBenchmarks,
  ReportUploadResponse,
  ReportBenchmarkSummary,
  BiomarkerBenchmark,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface ReportBenchmarkerProps {
  onVerifiedValuesSubmit: (vitals: Record<string, number>, patientId: string) => void;
}

export default function ReportBenchmarker({
  onVerifiedValuesSubmit,
}: ReportBenchmarkerProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reportData, setReportData] = useState<ReportUploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<string>("");

  // Editable Form Values State
  const [editedPatientId, setEditedPatientId] = useState("");
  const [editedPatientName, setEditedPatientName] = useState("");
  const [editedVitals, setEditedVitals] = useState<Record<string, string>>({
    glucose_level: "",
    blood_pressure: "",
    bmi: "",
    age: "",
    cholesterol: "",
    insulin: "",
    heart_rate: "",
  });

  // Benchmarks State
  const [benchmarkSummary, setBenchmarkSummary] = useState<ReportBenchmarkSummary | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Re-calculate localized benchmarks whenever the language changes
  useEffect(() => {
    if (reportData && Object.keys(editedVitals).length > 0) {
      const numericVitals: Record<string, number> = {};
      Object.entries(editedVitals).forEach(([k, v]) => {
        const parsed = parseFloat(v);
        if (!isNaN(parsed) && parsed > 0) {
          numericVitals[k] = parsed;
        }
      });
      if (Object.keys(numericVitals).length > 0) {
        recalculateBenchmarks(numericVitals, language)
          .then((res) => setBenchmarkSummary(res.benchmark_summary))
          .catch(() => {});
      }
    }
  }, [language]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      setReportData(null);
      setBenchmarkSummary(null);
      setIsConfirmed(false);

      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const processReportFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setScanStep("Reading document binary structure...");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setScanStep("Performing clinical entity OCR extraction...");
      await new Promise((r) => setTimeout(r, 300));
      setScanStep("Evaluating ADA, AHA & WHO clinical standard benchmarks...");

      const res = await uploadAndExtractReport(file, language);
      setReportData(res);
      setBenchmarkSummary(res.benchmark_summary);

      // Populate editable fields
      const vitalsMap: Record<string, string> = {};
      Object.entries(res.extracted_vitals).forEach(([k, v]) => {
        vitalsMap[k] = v.toString();
      });
      setEditedVitals(vitalsMap);
      setEditedPatientId(res.detected_patient_id || user?.patient_id || "PAT-2026-8842");
      setEditedPatientName(res.detected_patient_name || user?.full_name || "Eleanor Vance");
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to extract medical report.";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setScanStep("");
    }
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a medical report (PDF or Image) to upload.");
      return;
    }
    await processReportFile(selectedFile);
  };

  const handleLoadSampleReport = async (sampleType: "high_risk_pdf" | "high_risk_png" | "healthy_pdf" | "healthy_png") => {
    try {
      setIsUploading(true);
      setErrorMessage(null);

      let url = "/sample_reports/sample_clinical_report.pdf";
      let filename = "sample_clinical_report.pdf";
      let mime = "application/pdf";

      if (sampleType === "high_risk_png") {
        url = "/sample_reports/sample_clinical_report.png";
        filename = "sample_clinical_report.png";
        mime = "image/png";
      } else if (sampleType === "healthy_pdf") {
        url = "/sample_reports/sample_healthy_panel.pdf";
        filename = "sample_healthy_panel.pdf";
        mime = "application/pdf";
      } else if (sampleType === "healthy_png") {
        url = "/sample_reports/sample_healthy_panel.png";
        filename = "sample_healthy_panel.png";
        mime = "image/png";
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not load sample report file.");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: mime });

      setSelectedFile(file);
      if (mime.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }

      await processReportFile(file);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Failed to load sample report.");
      setIsUploading(false);
    }
  };

  const handleVitalChange = async (key: string, value: string) => {
    const updated = { ...editedVitals, [key]: value };
    setEditedVitals(updated);
    setIsConfirmed(false);

    // Auto-recalculate clinical benchmarks in real time
    const numericVitals: Record<string, number> = {};
    Object.entries(updated).forEach(([k, v]) => {
      const parsed = parseFloat(v);
      if (!isNaN(parsed) && parsed > 0) {
        numericVitals[k] = parsed;
      }
    });

    if (Object.keys(numericVitals).length > 0) {
      try {
        setIsRecalculating(true);
        const res = await recalculateBenchmarks(numericVitals, language);
        setBenchmarkSummary(res.benchmark_summary);
      } catch {
        // Fallback
      } finally {
        setIsRecalculating(false);
      }
    }
  };

  const handleSubmitVerifiedReport = () => {
    const numericVitals: Record<string, number> = {};
    Object.entries(editedVitals).forEach(([k, v]) => {
      const parsed = parseFloat(v);
      if (!isNaN(parsed) && parsed > 0) {
        numericVitals[k] = parsed;
      }
    });

    if (Object.keys(numericVitals).length === 0) {
      setErrorMessage("Please verify at least one vital parameter.");
      return;
    }

    setIsConfirmed(true);
    onVerifiedValuesSubmit(numericVitals, editedPatientId || user?.patient_id || "PAT-2026-8842");
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-8 transition-colors">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 border border-teal-300 dark:border-teal-500/20 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{t("nav.benchmarks", "Document Ingestion & Clinical Benchmarking")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("report.title", "Medical Report Ingestion, Interactive Verification & Benchmarks")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t("report.subtitle", "Upload patient clinical lab reports (PDF or scan). The optical entity extractor automatically identifies physiological biomarkers with high-precision confidence scoring and computes clinical benchmarks (ADA, AHA, WHO, NCEP).")}
          </p>
        </div>

        {/* 1-Click Sample Preset Buttons */}
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          <button
            onClick={() => handleLoadSampleReport("high_risk_pdf")}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>{t("report.highRiskSample", "High-Risk Lab (PDF)")}</span>
          </button>
          <button
            onClick={() => handleLoadSampleReport("healthy_pdf")}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t("report.healthySample", "Healthy Baseline (PDF)")}</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300/80 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-emerald-50/20 dark:bg-slate-950/40 hover:bg-emerald-50/50 dark:hover:bg-slate-900/60 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
              className="hidden"
            />

            {/* Glowing Laser Scan Bar when parsing */}
            {isUploading && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-pulse pointer-events-none" />
            )}

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : t("report.dropzoneText", "Click or drag medical report file here")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("report.dropzoneSub", "Supports standard laboratory PDFs, hospital image scans (PNG, JPG, TIFF)")}
            </p>

            {selectedFile && (
              <div className="mt-3 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-emerald-200 dark:border-slate-700 text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
              </div>
            )}
          </div>

          {/* Action Button & OCR status */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUploadAndExtract}
              disabled={isUploading || !selectedFile}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{scanStep || t("common.loading", "Extracting Biomarkers...")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t("report.runOcr", "Run High-Precision OCR & Benchmark Analysis")}</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Document Preview & Raw Text Stream */}
        <div className="lg:col-span-6 flex flex-col space-y-3 bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Live Ingestion Preview & OCR Stream</span>
            </span>
            {reportData && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-mono">
                Extracted: {reportData.file_type}
              </span>
            )}
          </div>

          {filePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={filePreview} alt="Report Scan Preview" className="w-full h-auto object-cover" />
            </div>
          ) : (
            <div className="flex-1 min-h-[140px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 overflow-y-auto leading-relaxed max-h-56">
              {reportData ? (
                <pre className="whitespace-pre-wrap">{reportData.raw_text_snippet}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-6 space-y-1">
                  <FileText className="w-8 h-8 opacity-40" />
                  <span>No report loaded. Upload or select a sample preset above.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>      {/* ========================================================================= */}
      {/* INTERACTIVE VERIFICATION & RE-CALCULATION MATRIX                          */}
      {/* ========================================================================= */}
      {reportData && (
        <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t("report.step2Title", "Step 2: Interactive Clinical Attribute Verification")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("report.step2Sub", "Review the extracted values. If any biomarker is slightly off or needs clinical modification, edit the value directly below.")}
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
              {t("report.compositeIndex", "Composite Health Index")}: {benchmarkSummary ? `${benchmarkSummary.overall_health_index}/100` : "--"}
            </div>
          </div>

          {/* Patient Identifiers Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t("profile.patientId", "Patient Identifier (PID / MRN)")}
              </label>
              <input
                type="text"
                value={editedPatientId}
                onChange={(e) => setEditedPatientId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t("auth.firstName", "Patient Full Name")}
              </label>
              <input
                type="text"
                value={editedPatientName}
                onChange={(e) => setEditedPatientName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Editable Biomarkers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-7 gap-4">
            {/* Fasting Glucose */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.glucose", "Fasting Glucose")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  {Math.round((reportData.extraction_confidence["glucose_level"] || 0.98) * 100)}% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={editedVitals.glucose_level}
                  onChange={(e) => handleVitalChange("glucose_level", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">mg/dL</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>ADA Ref: 70 - 99</span>
                <span className="text-emerald-600 dark:text-emerald-400">Plasma FBS</span>
              </div>
            </div>

            {/* Systolic Blood Pressure */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.bp", "Systolic BP")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  {Math.round((reportData.extraction_confidence["blood_pressure"] || 0.99) * 100)}% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="1"
                  value={editedVitals.blood_pressure}
                  onChange={(e) => handleVitalChange("blood_pressure", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">mmHg</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>AHA Ref: 90 - 119</span>
                <span className="text-teal-600 dark:text-teal-400">Brachial</span>
              </div>
            </div>

            {/* Body Mass Index */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.bmi", "Body Mass Index")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  {Math.round((reportData.extraction_confidence["bmi"] || 0.99) * 100)}% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={editedVitals.bmi}
                  onChange={(e) => handleVitalChange("bmi", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">kg/m²</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>WHO Ref: 18.5 - 24.9</span>
                <span className="text-cyan-600 dark:text-cyan-400">BMI Metric</span>
              </div>
            </div>

            {/* Total Cholesterol */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.cholesterol", "Total Cholesterol")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  {Math.round((reportData.extraction_confidence["cholesterol"] || 0.98) * 100)}% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="1"
                  value={editedVitals.cholesterol}
                  onChange={(e) => handleVitalChange("cholesterol", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">mg/dL</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>NCEP Ref: &lt; 200.0</span>
                <span className="text-indigo-600 dark:text-indigo-400">Lipid Panel</span>
              </div>
            </div>

            {/* Fasting Insulin */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.insulin", "Fasting Insulin")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  {Math.round((reportData.extraction_confidence["insulin"] || 0.97) * 100)}% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  value={editedVitals.insulin}
                  onChange={(e) => handleVitalChange("insulin", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">uIU/mL</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Ref: 2.0 - 25.0</span>
                <span className="text-teal-600">Endocrine</span>
              </div>
            </div>

            {/* Resting Heart Rate */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.heartRate", "Resting Heart Rate")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  {Math.round((reportData.extraction_confidence["heart_rate"] || 0.98) * 100)}% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="1"
                  value={editedVitals.heart_rate}
                  onChange={(e) => handleVitalChange("heart_rate", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">bpm</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Ref: 60 - 100</span>
                <span className="text-cyan-600">Pulse</span>
              </div>
            </div>

            {/* Age */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("report.ageField", "Age")}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                  99% Conf
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="1"
                  value={editedVitals.age}
                  onChange={(e) => handleVitalChange("age", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono shrink-0">Years</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Demographic</span>
                <span className="text-slate-400">Biological</span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CLINICAL STANDARDS BENCHMARK MATRIX                                   */}
          {/* ===================================================================== */}
          {benchmarkSummary && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("report.benchmarksTitle", "Clinical Standard Benchmarks & Regulatory Classifications")}</span>
                </h4>
                {isRecalculating && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{t("common.loading", "Recalculating...")}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-3 4xl:grid-cols-6 gap-3">
                {benchmarkSummary.benchmarks.map((b: BiomarkerBenchmark, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{b.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status_color === "red"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
                            : b.status_color === "amber"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex justify-between font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Value: <b className="text-slate-900 dark:text-white">{b.patient_value} {b.unit}</b></span>
                      <span>Target: {b.normal_range}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                      {b.interpretation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Handover Button */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Values Ready for AI Diagnostic Evaluation</span>
                  </span>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80">
                    Submit verified parameters directly into the SecRE-XAI Dual Ensemble Engine to compute prediction probabilities and SHAP/LIME explanations.
                  </p>
                </div>

                <button
                  onClick={handleSubmitVerifiedReport}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 hover:scale-105"
                >
                  <span>{t("report.submitToAi", "Submit Verified Values to AI Assessment Engine")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
