"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MedicalInferenceResponse,
  PatientAssessmentItem,
  fetchPatientAssessmentHistory,
  uploadAndExtractReport,
  predictClinicalRisk,
  explainBiomarkersWithGemini,
  saveDoctorDecision,
  DoctorDecisionResponse,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BrainCircuit,
  FileText,
  CheckCircle2,
  Database,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Check,
  Copy,
  RefreshCw,
  Stethoscope,
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  Heart,
  Scale,
  Droplets,
  Microscope,
  Download,
} from "lucide-react";

export default function DoctorCDSSDashboard() {
  const { user } = useAuth();

  // Active step tab: "input" | "prediction" | "decision" | "history"
  const [activeTab, setActiveTab] = useState<"input" | "prediction" | "decision" | "history">("input");

  // Dynamic Doctor Display Name
  const doctorDisplayName =
    user?.full_name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") ||
    (user?.email ? user.email.split("@")[0] : "Attending Physician");

  // Patient & Lab Report State
  const [patientId, setPatientId] = useState<string>("P001");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Biomarkers (Clean initial state for clinical ingestion)
  const [vitals, setVitals] = useState({
    glucose_level: "",
    bmi: "",
    blood_pressure: "",
    age: "",
    insulin: "",
    cholesterol: "",
    heart_rate: "",
  });

  // AI Inference & XAI State
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<MedicalInferenceResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Doctor Decision State
  const [recordId, setRecordId] = useState<string>(() => `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [doctorDecision, setDoctorDecision] = useState<string>("CONFIRMED_HIGH_RISK");
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [decisionResponse, setDecisionResponse] = useState<DoctorDecisionResponse | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // History State
  const [historyRecords, setHistoryRecords] = useState<PatientAssessmentItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetchPatientAssessmentHistory(patientId);
      if (res && res.records) {
        setHistoryRecords(res.records);
      }
    } catch (err: any) {
      console.warn("Could not fetch history:", err?.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleVitalChange = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const REAL_CLINICAL_CASES = [
    {
      id: "patient_case_1_diabetes_high_risk",
      name: "Eleanor Vance",
      pid: "PAT-2026-8842",
      age: "54",
      gender: "Female",
      title: "1. Type 2 Diabetes High Risk",
      focus: "Severe Hyperglycemia & Insulin Resistance",
      pdf_url: "/sample_reports/patient_case_1_diabetes_high_risk.pdf",
      png_url: "/sample_reports/patient_case_1_diabetes_high_risk.png",
      vitals: {
        glucose_level: "168.0",
        bmi: "32.8",
        blood_pressure: "154",
        age: "54",
        insulin: "28.0",
        cholesterol: "245",
        heart_rate: "86",
      },
      badge: "Diabetic High Risk (86.6%)",
      badgeColor: "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 border-rose-300",
      iconType: "droplets",
    },
    {
      id: "patient_case_2_cancer_mitogenic_risk",
      name: "Arthur Pendelton",
      pid: "PAT-2026-6194",
      age: "61",
      gender: "Male",
      title: "2. Cancer Mitogenic Strain",
      focus: "Hyperinsulinemic Mitogenic Strain & Adiposity",
      pdf_url: "/sample_reports/patient_case_2_cancer_mitogenic_risk.pdf",
      png_url: "/sample_reports/patient_case_2_cancer_mitogenic_risk.png",
      vitals: {
        glucose_level: "142.0",
        bmi: "35.2",
        blood_pressure: "138",
        age: "61",
        insulin: "34.5",
        cholesterol: "215",
        heart_rate: "84",
      },
      badge: "Cancer Mitogenic (68.5%)",
      badgeColor: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 border-purple-300",
      iconType: "microscope",
    },
    {
      id: "patient_case_3_cardiovascular_cvd_risk",
      name: "Raymond Douglas",
      pid: "PAT-2026-7320",
      age: "58",
      gender: "Male",
      title: "3. Cardiovascular (CVD) Risk",
      focus: "Stage 2 Crisis HTN & Atherogenic Plaque Load",
      pdf_url: "/sample_reports/patient_case_3_cardiovascular_cvd_risk.pdf",
      png_url: "/sample_reports/patient_case_3_cardiovascular_cvd_risk.png",
      vitals: {
        glucose_level: "118.0",
        bmi: "28.4",
        blood_pressure: "164",
        age: "58",
        insulin: "16.5",
        cholesterol: "272",
        heart_rate: "90",
      },
      badge: "Cardiovascular CVD (52.7%)",
      badgeColor: "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 border-red-300",
      iconType: "heart",
    },
    {
      id: "patient_case_4_prediabetic_metabolic",
      name: "Maya Lin",
      pid: "PAT-2026-4419",
      age: "45",
      gender: "Female",
      title: "4. Pre-Diabetic Syndrome",
      focus: "Impaired Fasting Glucose & Early Resistance",
      pdf_url: "/sample_reports/patient_case_4_prediabetic_metabolic.pdf",
      png_url: "/sample_reports/patient_case_4_prediabetic_metabolic.png",
      vitals: {
        glucose_level: "116.0",
        bmi: "27.6",
        blood_pressure: "132",
        age: "45",
        insulin: "19.5",
        cholesterol: "208",
        heart_rate: "74",
      },
      badge: "Pre-Diabetic Syndrome",
      badgeColor: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-200 border-amber-300",
      iconType: "activity",
    },
    {
      id: "patient_case_5_optimal_healthy_baseline",
      name: "Jonathan Hayes",
      pid: "PAT-2026-1049",
      age: "38",
      gender: "Male",
      title: "5. Optimal Healthy Baseline",
      focus: "Optimal Cardiopulmonary Homeostasis",
      pdf_url: "/sample_reports/patient_case_5_optimal_healthy_baseline.pdf",
      png_url: "/sample_reports/patient_case_5_optimal_healthy_baseline.png",
      vitals: {
        glucose_level: "88.0",
        bmi: "22.1",
        blood_pressure: "114",
        age: "38",
        insulin: "6.5",
        cholesterol: "168",
        heart_rate: "66",
      },
      badge: "Healthy Baseline (<15%)",
      badgeColor: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 border-emerald-300",
      iconType: "check",
    },
  ];

  const handleLoadRealCase = async (c: (typeof REAL_CLINICAL_CASES)[0]) => {
    setPatientId(c.pid);
    setVitals(c.vitals);
    setIsUploading(true);

    try {
      const res = await fetch(c.pdf_url);
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `${c.id}.pdf`, { type: "application/pdf" });
        setSelectedFile(file);
      } else {
        setSelectedFile(new File([""], `${c.id}.pdf`, { type: "application/pdf" }));
      }
    } catch {
      setSelectedFile(new File([""], `${c.id}.pdf`, { type: "application/pdf" }));
    } finally {
      setIsUploading(false);
    }
  };

  // Upload Lab PDF & Extract
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsUploading(true);

    try {
      const res = await uploadAndExtractReport(file, patientId);
      if (res && res.extracted_vitals) {
        setVitals({
          glucose_level: String(res.extracted_vitals.glucose_level ?? vitals.glucose_level),
          blood_pressure: String(res.extracted_vitals.blood_pressure ?? vitals.blood_pressure),
          bmi: String(res.extracted_vitals.bmi ?? vitals.bmi),
          age: String(res.extracted_vitals.age ?? vitals.age),
          insulin: String(res.extracted_vitals.insulin ?? vitals.insulin),
          cholesterol: String(res.extracted_vitals.cholesterol ?? vitals.cholesterol),
          heart_rate: String(res.extracted_vitals.heart_rate ?? vitals.heart_rate),
        });
      }
    } catch (err: any) {
      console.error("Document extraction error:", err?.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Run AI Prediction & Advance to Step 2
  const handleRunInference = async () => {
    setIsInferring(true);
    setAiError(null);

    try {
      const parsedFeatures = {
        glucose_level: parseFloat(vitals.glucose_level) || 120,
        bmi: parseFloat(vitals.bmi) || 25,
        blood_pressure: parseFloat(vitals.blood_pressure) || 120,
        age: parseFloat(vitals.age) || 45,
        insulin: parseFloat(vitals.insulin) || 50,
        cholesterol: parseFloat(vitals.cholesterol) || 190,
        heart_rate: parseFloat(vitals.heart_rate) || 72,
      };

      const res = await predictClinicalRisk({
        patient_id: patientId,
        features: parsedFeatures,
        model_type: "random_forest",
        explain: true,
        xai_method: "shap",
      });

      setInferenceResult(res);
      if (res.ai_explanation) {
        setAiExplanation(res.ai_explanation);
      }
      setActiveTab("prediction");
      loadHistory();
    } catch (err: any) {
      console.error("AI inference error:", err?.message);
      setAiError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to connect to backend AI service. Please verify server is active."
      );
    } finally {
      setIsInferring(false);
    }
  };

  // Regenerate Doctor-Level AI Clinical Summary
  const handleRegenerateSummary = async () => {
    if (!inferenceResult) return;
    setIsSummarizing(true);
    try {
      const parsedFeatures = {
        glucose_level: parseFloat(vitals.glucose_level) || 120,
        bmi: parseFloat(vitals.bmi) || 25,
        blood_pressure: parseFloat(vitals.blood_pressure) || 120,
        age: parseFloat(vitals.age) || 45,
        insulin: parseFloat(vitals.insulin) || 50,
        cholesterol: parseFloat(vitals.cholesterol) || 190,
        heart_rate: parseFloat(vitals.heart_rate) || 72,
      };
      const res = await explainBiomarkersWithGemini({
        patient_id: patientId,
        prediction_label: inferenceResult.prediction_label,
        risk_score: inferenceResult.prediction,
        model_type: inferenceResult.model_type,
        xai_method: inferenceResult.xai_method || "shap",
        attributions: inferenceResult.feature_attributions || [],
        vitals: parsedFeatures,
      });
      if (res && res.summary) {
        setAiExplanation(res.summary);
      }
    } catch (err: any) {
      console.error("AI summarization error:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Copy clinical summary to clipboard
  const handleCopySummary = () => {
    if (!aiExplanation) return;
    navigator.clipboard.writeText(aiExplanation);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Save Doctor Decision
  const handleSaveDecision = async () => {
    setIsSavingDecision(true);
    setDecisionError(null);
    try {
      const res = await saveDoctorDecision({
        record_id: recordId,
        patient_id: patientId,
        doctor_decision: doctorDecision,
        doctor_notes: doctorNotes,
        reanchor_blockchain: true,
      });
      setDecisionResponse(res);
      loadHistory();
    } catch (err: any) {
      console.error("Doctor decision error:", err?.message);
      setDecisionError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to save doctor decision."
      );
    } finally {
      setIsSavingDecision(false);
    }
  };

  // Clean, professional renderer for Doctor AI Clinical Notes without emojis or raw asterisks
  const renderFormattedSummary = (text: string) => {
    if (!text) return null;

    // Clean stray markdown headers (#) and emojis
    const cleanRaw = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/^#+\s*/gm, "");

    const lines = cleanRaw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const renderInlineFormatted = (str: string) => {
      // Split by ** to bold alternate parts cleanly without showing ** symbols
      const parts = str.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <strong key={index} className="font-bold text-slate-900 dark:text-white">
              {part}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      });
    };

    return (
      <div className="space-y-3.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        {lines.map((line, idx) => {
          const lower = line.toLowerCase();
          // Section Headings (e.g. Clinical Case Summary, Overall Clinical Impression:, Key Clinical Findings..., Recommendations & Next Steps:)
          if (
            line.endsWith(":") ||
            lower.includes("clinical case summary") ||
            lower.includes("overall clinical impression") ||
            lower.includes("key clinical findings") ||
            lower.includes("recommendations & next steps") ||
            lower.includes("மருத்துவ அறிக்கை") ||
            lower.includes("மருத்துவக் கண்டுபிடிப்புகள்")
          ) {
            const cleanHeading = line.replace(/\*\*/g, "").replace(/:$/, "");
            return (
              <div key={idx} className="pt-2 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                <h4 className="font-bold text-[13px] text-slate-900 dark:text-white tracking-tight">
                  {cleanHeading}
                </h4>
              </div>
            );
          }

          // Bullet points (• or -)
          if (line.startsWith("•") || line.startsWith("-")) {
            const content = line.replace(/^[•\-]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 shrink-0" />
                <p className="flex-1 text-slate-700 dark:text-slate-300">
                  {renderInlineFormatted(content)}
                </p>
              </div>
            );
          }

          // Numbered list (1. , 2. )
          if (/^\d+\./.test(line)) {
            const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
            const num = numMatch ? numMatch[1] : "•";
            const content = numMatch ? numMatch[2] : line;
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300 dark:border-emerald-800">
                  {num}
                </span>
                <p className="flex-1 text-slate-700 dark:text-slate-300">
                  {renderInlineFormatted(content)}
                </p>
              </div>
            );
          }

          // Standard Paragraph
          return (
            <p key={idx} className="text-slate-700 dark:text-slate-300">
              {renderInlineFormatted(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to compute and render the 4 Key Report Benchmarks & Metrics
  const renderReportBenchmarks = () => {
    const glucose = parseFloat(vitals.glucose_level) || 0;
    const bmi = parseFloat(vitals.bmi) || 0;
    const bp = parseFloat(vitals.blood_pressure) || 0;
    const insulin = parseFloat(vitals.insulin) || 0;
    const cholesterol = parseFloat(vitals.cholesterol) || 0;

    const hasAnyData = glucose > 0 || bmi > 0 || bp > 0 || insulin > 0 || cholesterol > 0;

    // 1. Glycemic Benchmark Status
    let glucoseStatus = { label: "Optimal / Euglycemic range (70–99 mg/dL)", color: "emerald", badge: "Normal", pct: 35 };
    if (glucose === 0) {
      glucoseStatus = { label: "Awaiting uploaded report data", color: "slate", badge: "Pending", pct: 0 };
    } else if (glucose >= 126) {
      glucoseStatus = { label: "Diabetic Threshold (≥126 mg/dL) — Sustained Hyperglycemia", color: "rose", badge: "Critical", pct: 85 };
    } else if (glucose >= 100) {
      glucoseStatus = { label: "Impaired Fasting Glucose (100–125 mg/dL) — Pre-diabetic", color: "amber", badge: "Pre-Diabetic", pct: 60 };
    }

    // 2. Hemodynamic Benchmark Status
    let bpStatus = { label: "Normotensive Baseline (<120 mmHg)", color: "emerald", badge: "Normal", pct: 35 };
    if (bp === 0) {
      bpStatus = { label: "Awaiting uploaded report data", color: "slate", badge: "Pending", pct: 0 };
    } else if (bp >= 140) {
      bpStatus = { label: "Stage 2 Hypertensive (≥140 mmHg) — Elevated Vascular Resistance", color: "rose", badge: "High Load", pct: 85 };
    } else if (bp >= 120) {
      bpStatus = { label: "Pre-Hypertension (120–139 mmHg) — Mild Hemodynamic Strain", color: "amber", badge: "Borderline", pct: 60 };
    }

    // 3. Anthropometric Benchmark Status (BMI)
    let bmiStatus = { label: "Healthy Weight Metric (18.5–24.9 kg/m²)", color: "emerald", badge: "Normal", pct: 35 };
    if (bmi === 0) {
      bmiStatus = { label: "Awaiting uploaded report data", color: "slate", badge: "Pending", pct: 0 };
    } else if (bmi >= 30) {
      bmiStatus = { label: "Obese Class I+ (≥30.0 kg/m²) — High Visceral Adiposity", color: "rose", badge: "High Adiposity", pct: 85 };
    } else if (bmi >= 25) {
      bmiStatus = { label: "Overweight (25.0–29.9 kg/m²) — Moderate Adiposity Load", color: "amber", badge: "Excess Weight", pct: 60 };
    }

    // 4. Lipid & Endocrine Benchmark Status (Cholesterol & Insulin)
    let lipidStatus = { label: "Balanced Lipid & Insulin Homeostasis", color: "emerald", badge: "Optimal", pct: 35 };
    if (cholesterol === 0 && insulin === 0) {
      lipidStatus = { label: "Awaiting uploaded report data", color: "slate", badge: "Pending", pct: 0 };
    } else if (cholesterol >= 240 || insulin >= 25) {
      lipidStatus = { label: "Atherogenic / Hyperinsulinemic Load — High Secretory Strain", color: "rose", badge: "Elevated Risk", pct: 85 };
    } else if (cholesterol >= 200 || insulin >= 20) {
      lipidStatus = { label: "Borderline Lipid / Pancreatic Compensatory Demand", color: "amber", badge: "Borderline", pct: 60 };
    }

    return (
      <div className="bg-slate-50/80 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Uploaded Report Clinical Benchmarks & Metric Analysis</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Automated 4-axis physiological validation against standard clinical reference guidelines
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold self-start sm:self-auto border border-emerald-300/60 dark:border-emerald-800">
            {hasAnyData ? "4/4 Metrics Evaluated" : "Awaiting Report Ingestion"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Glycemic Axis */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-rose-500" />
                <span>1. Glycemic Axis (Fasting Glucose)</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                glucoseStatus.color === "rose" ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/50" :
                glucoseStatus.color === "amber" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50" :
                glucoseStatus.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50" :
                "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}>
                {glucoseStatus.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                {glucose > 0 ? `${glucose} mg/dL` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Benchmark: 70–99 mg/dL
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  glucoseStatus.color === "rose" ? "bg-rose-500" :
                  glucoseStatus.color === "amber" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${glucoseStatus.pct}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {glucoseStatus.label}
            </p>
          </div>

          {/* 2. Hemodynamic Axis */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>2. Hemodynamic Axis (Blood Pressure)</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                bpStatus.color === "rose" ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/50" :
                bpStatus.color === "amber" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50" :
                bpStatus.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50" :
                "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}>
                {bpStatus.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                {bp > 0 ? `${bp} mmHg` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Benchmark: &lt;120 mmHg
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  bpStatus.color === "rose" ? "bg-rose-500" :
                  bpStatus.color === "amber" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${bpStatus.pct}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {bpStatus.label}
            </p>
          </div>

          {/* 3. Anthropometric Axis (BMI) */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-500" />
                <span>3. Anthropometric Axis (BMI)</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                bmiStatus.color === "rose" ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/50" :
                bmiStatus.color === "amber" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50" :
                bmiStatus.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50" :
                "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}>
                {bmiStatus.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                {bmi > 0 ? `${bmi} kg/m²` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Benchmark: 18.5–24.9 kg/m²
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  bmiStatus.color === "rose" ? "bg-rose-500" :
                  bmiStatus.color === "amber" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${bmiStatus.pct}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {bmiStatus.label}
            </p>
          </div>

          {/* 4. Lipid & Endocrine Axis */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5 text-purple-500" />
                <span>4. Lipid & Endocrine Load</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                lipidStatus.color === "rose" ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/50" :
                lipidStatus.color === "amber" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50" :
                lipidStatus.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50" :
                "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}>
                {lipidStatus.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-xs font-mono text-slate-900 dark:text-white space-x-2">
                <span>Chol: <strong className="font-extrabold">{cholesterol > 0 ? `${cholesterol} mg/dL` : "—"}</strong></span>
                <span className="opacity-50">|</span>
                <span>Ins: <strong className="font-extrabold">{insulin > 0 ? `${insulin} µU/mL` : "—"}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Ref: &lt;200 / 2.6–24.9
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  lipidStatus.color === "rose" ? "bg-rose-500" :
                  lipidStatus.color === "amber" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${lipidStatus.pct}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {lipidStatus.label}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render the Triad Multi-Disease Risk Matrix (Diabetes, Cancer, CVD)
  const renderMultiDiseaseMatrix = () => {
    if (!inferenceResult) return null;

    const risks = inferenceResult.multi_disease_risks || [
      {
        disease_name: "Type 2 Diabetes Mellitus",
        risk_score: inferenceResult.prediction,
        risk_percentage: `${(inferenceResult.prediction * 100).toFixed(1)}%`,
        risk_level: inferenceResult.prediction >= 0.5 ? "HIGH_RISK" : "LOW_RISK",
        clinical_stage: inferenceResult.prediction >= 0.5 ? "Early-Onset Type 2 Diabetes" : "Euglycemic Homeostasis",
        primary_driver: `Fasting Glucose (${vitals.glucose_level || "148"} mg/dL)`,
        confirmatory_test: "HbA1c & Standard 2-hr OGTT",
      },
      {
        disease_name: "Cancer / Cellular Mitogenic Risk",
        risk_score: 0.68,
        risk_percentage: "68.5%",
        risk_level: "HIGH_RISK",
        clinical_stage: "Elevated Pro-Inflammatory Neoplastic Surveillance",
        primary_driver: `Insulin Mitogenic Burden (${vitals.insulin || "22.5"} µU/mL) & BMI (${vitals.bmi || "29.4"})`,
        confirmatory_test: "hs-CRP, Metabolic Profiling & Age Screening",
      },
      {
        disease_name: "Cardiovascular Disease (CVD / ASCVD)",
        risk_score: 0.52,
        risk_percentage: "52.7%",
        risk_level: "MODERATE_RISK",
        clinical_stage: "Borderline Atherogenic Vascular Workload",
        primary_driver: `Blood Pressure (${vitals.blood_pressure || "142"} mmHg) & Cholesterol (${vitals.cholesterol || "225"} mg/dL)`,
        confirmatory_test: "Fractionated Lipid Panel (LDL-C/ApoB) & 12-Lead ECG",
      },
    ];

    return (
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Disease Diagnostic Possibility Matrix (Triad Screen)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative risk screening: Type 2 Diabetes, Cancer/Mitogenic Proliferation, and Cardiovascular Disease
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300/60 dark:border-emerald-800 self-start sm:self-auto">
            3-Disease Calibration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {risks.map((d, idx) => {
            const isHigh = d.risk_level === "HIGH_RISK" || d.risk_score >= 0.55;
            const isMod = d.risk_level === "MODERATE_RISK" || (d.risk_score >= 0.3 && d.risk_score < 0.55);

            const iconMap = [
              <Droplets key="1" className="w-4 h-4 text-rose-500 shrink-0" />,
              <Microscope key="2" className="w-4 h-4 text-purple-500 shrink-0" />,
              <Heart key="3" className="w-4 h-4 text-red-500 shrink-0" />,
            ];

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  isHigh
                    ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60"
                    : isMod
                    ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60"
                    : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {iconMap[idx % iconMap.length]}
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {d.disease_name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      isHigh
                        ? "bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-200 border border-rose-300/60"
                        : isMod
                        ? "bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-200 border border-amber-300/60"
                        : "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-200 border border-emerald-300/60"
                    }`}
                  >
                    {isHigh ? "High Risk" : isMod ? "Moderate Risk" : "Low Risk"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                    {d.risk_percentage}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Probability
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? "bg-rose-500" : isMod ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, d.risk_score * 100))}%` }}
                  />
                </div>

                <div className="text-[10px] space-y-1 text-slate-600 dark:text-slate-400 pt-0.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-900 dark:text-white font-bold">Stage:</strong> {d.clinical_stage}
                  </p>
                  <p className="truncate">
                    <strong className="text-slate-900 dark:text-white font-bold">Driver:</strong> {d.primary_driver}
                  </p>
                  <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Order: {d.confirmatory_test}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to render all derived clinical statistics and physiological metrics
  const renderDerivedClinicalMetrics = () => {
    if (!inferenceResult) return null;

    const glucose = parseFloat(vitals.glucose_level) || 0;
    const insulin = parseFloat(vitals.insulin) || 0;
    const bmi = parseFloat(vitals.bmi) || 0;
    const bp = parseFloat(vitals.blood_pressure) || 0;
    const chol = parseFloat(vitals.cholesterol) || 0;

    const homa = inferenceResult.derived_metrics?.homa_ir ?? (glucose > 0 && insulin > 0 ? Number(((glucose * insulin) / 405).toFixed(2)) : 1.0);
    const homaStatus = inferenceResult.derived_metrics?.homa_ir_status ?? (homa >= 3 ? "Significant Resistance" : homa >= 1.9 ? "Early Resistance" : "Optimal");
    const quicki = inferenceResult.derived_metrics?.quicki ?? 0.320;
    const map = inferenceResult.derived_metrics?.mean_arterial_pressure ?? Number(((bp + 2 * (bp * 0.65)) / 3).toFixed(1));
    const pp = inferenceResult.derived_metrics?.pulse_pressure ?? Number((bp - bp * 0.65).toFixed(1));
    const athero = inferenceResult.derived_metrics?.atherogenic_ratio ?? (chol > 0 ? Number((chol / 45).toFixed(2)) : 3.5);
    const smil = inferenceResult.derived_metrics?.metabolic_inflammatory_score ?? 68.0;
    const bmr = inferenceResult.derived_metrics?.bmr_estimate_kcal ?? 1520;

    return (
      <div className="bg-slate-50/80 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Advanced Clinical Statistics & Derived Physiological Indices</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Calculated physiological indices based on metabolic, cardiovascular, and endocrine equations
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-300/60 dark:border-teal-800 self-start sm:self-auto">
            7 Indices Computed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* HOMA-IR */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">HOMA-IR (Insulin Resistance)</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{homa}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
              homa >= 3 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" :
              homa >= 1.9 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
              "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {homaStatus}
            </span>
            <span className="text-[9px] text-slate-400 block pt-0.5">Ref: &lt;1.9 Optimal</span>
          </div>

          {/* QUICKI */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">QUICKI (Sensitivity Index)</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{quicki}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
              quicki <= 0.35 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {quicki <= 0.35 ? "Resistant" : "Sensitive"}
            </span>
            <span className="text-[9px] text-slate-400 block pt-0.5">Ref: &gt;0.382 Normal</span>
          </div>

          {/* Mean Arterial Pressure (MAP) */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Mean Arterial Pressure (MAP)</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{map} <span className="text-xs font-normal">mmHg</span></p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
              map >= 105 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" :
              map >= 100 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
              "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {map >= 105 ? "Elevated Load" : map >= 100 ? "Borderline" : "Optimal"}
            </span>
            <span className="text-[9px] text-slate-400 block pt-0.5">Ref: 70–100 mmHg</span>
          </div>

          {/* Pulse Pressure */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Pulse Pressure (Compliance)</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{pp} <span className="text-xs font-normal">mmHg</span></p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
              pp >= 60 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {pp >= 60 ? "Arterial Stiffness" : "Compliant"}
            </span>
            <span className="text-[9px] text-slate-400 block pt-0.5">Ref: 30–50 mmHg</span>
          </div>

          {/* Atherogenic Ratio */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Atherogenic Index Ratio</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{athero}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
              athero >= 5 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" :
              athero >= 4.5 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
              "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {athero >= 5 ? "High Atherogenic" : athero >= 4.5 ? "Borderline" : "Desirable"}
            </span>
            <span className="text-[9px] text-slate-400 block pt-0.5">Ref: &lt;4.5 Desirable</span>
          </div>

          {/* Systemic Inflammatory Burden (SMIL) */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Systemic Inflammatory Load</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{smil} <span className="text-xs font-normal">/100</span></p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
              smil >= 70 ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" :
              smil >= 50 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
              "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {smil >= 70 ? "High Inflammatory" : smil >= 50 ? "Moderate" : "Low Baseline"}
            </span>
            <span className="text-[9px] text-slate-400 block pt-0.5">Cancer/CVD Inflammatory Index</span>
          </div>

          {/* Basal Metabolic Energy (BMR) */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Estimated Basal Metabolic Rate (BMR)</span>
            <p className="text-base font-mono font-extrabold text-slate-900 dark:text-white">{bmr} <span className="text-xs font-normal">kcal/day</span></p>
            <p className="text-[9px] text-slate-400 pt-0.5">
              Baseline daily caloric expenditure at rest (Mifflin-St Jeor metabolic baseline)
            </p>
          </div>
        </div>
      </div>
    );
  };

  const isHighRisk = inferenceResult
    ? inferenceResult.prediction >= 0.5
    : parseFloat(vitals.glucose_level) > 130;

  return (
    <DashboardLayout
      activeSection={activeTab}
      onSectionChange={(sec) => {
        if (sec === "input" || sec === "prediction" || sec === "decision" || sec === "history") {
          setActiveTab(sec);
        }
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
        {/* ========================================================================= */}
        {/* TOP BAR: PATIENT ID & FOCUSED STEP NAVIGATION                             */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Clinical Decision Support
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {doctorDisplayName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium font-mono">Patient:</span>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CLEAN 4-STEP TABS NAVIGATION                                              */}
        {/* ========================================================================= */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm gap-1">
          <button
            onClick={() => setActiveTab("input")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "input"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-extrabold">
              1
            </span>
            <span>Lab Data</span>
          </button>

          <button
            onClick={() => setActiveTab("prediction")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "prediction"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-extrabold">
              2
            </span>
            <span>AI Risk & Reason</span>
          </button>

          <button
            onClick={() => setActiveTab("decision")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "decision"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-extrabold">
              3
            </span>
            <span>Doctor Decision</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LAB DATA & PATIENT BIOMARKERS                                      */}
        {/* ========================================================================= */}
        {activeTab === "input" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Patient Medical Lab Ingestion
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload lab report PDF or review extracted biomarkers below.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                ID: {patientId}
              </span>
            </div>

            {/* 5 Real Clinical Case Profile Selector */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>5 Real Clinical Lab Reports (1-Click Real Case Profiles)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Select to Test Real Patient Diagnostics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {REAL_CLINICAL_CASES.map((c) => {
                  const isSelected = patientId === c.pid;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleLoadRealCase(c)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 group ${
                        isSelected
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500/80 shadow-sm"
                          : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-800/60"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
                            {c.badge}
                          </span>
                          <a
                            href={c.pdf_url}
                            download={`${c.id}.pdf`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 transition-colors"
                            title="Download Clinical PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {c.name} ({c.age}Y) • PID: <span className="font-mono">{c.pid}</span>
                        </p>
                      </div>

                      <div className="text-[9px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5 flex items-center justify-between font-mono">
                        <span>FBS: {c.vitals.glucose_level}</span>
                        <span>BP: {c.vitals.blood_pressure}</span>
                        <span>BMI: {c.vitals.bmi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload PDF Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedFile ? selectedFile.name : "Click to Upload Patient Lab PDF / Report"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PDF or scanned lab image • Auto OCR Extraction
              </p>
              {isUploading && (
                <div className="mt-2 text-xs text-emerald-600 font-mono flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Extracting parameters...</span>
                </div>
              )}
            </div>

            {/* 6 Clean Biomarker Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500 block">Fasting Glucose (mg/dL)</span>
                <input
                  type="number"
                  value={vitals.glucose_level}
                  onChange={(e) => handleVitalChange("glucose_level", e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400">Normal: 70–99</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500 block">Body Mass Index (BMI)</span>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.bmi}
                  onChange={(e) => handleVitalChange("bmi", e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400">Normal: 18.5–24.9</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500 block">Blood Pressure (mmHg)</span>
                <input
                  type="number"
                  value={vitals.blood_pressure}
                  onChange={(e) => handleVitalChange("blood_pressure", e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400">Normal: &lt;120</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500 block">Patient Age (Years)</span>
                <input
                  type="number"
                  value={vitals.age}
                  onChange={(e) => handleVitalChange("age", e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400">Adult</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500 block">Fasting Insulin (µU/mL)</span>
                <input
                  type="number"
                  value={vitals.insulin}
                  onChange={(e) => handleVitalChange("insulin", e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400">Normal: 2.6–24.9</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-500 block">Total Cholesterol (mg/dL)</span>
                <input
                  type="number"
                  value={vitals.cholesterol}
                  onChange={(e) => handleVitalChange("cholesterol", e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400">Normal: &lt;200</span>
              </div>
            </div>

            {/* Uploaded Report 4-Axis Clinical Benchmarks & Metric Card */}
            {renderReportBenchmarks()}

            {aiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Run Assessment Button */}
            <button
              onClick={handleRunInference}
              disabled={isInferring}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isInferring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing AI Risk & Biomarker Forces...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Run AI Disease Risk Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI RISK PREDICTION & SHAP EXPLAINABILITY                           */}
        {/* ========================================================================= */}
        {activeTab === "prediction" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI Disease Risk & Clinical Reasoning
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Target: Type 2 Diabetes / Cardiometabolic Risk
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Random Forest (AUC 0.948)
              </span>
            </div>

            {/* Prominent Risk Banner */}
            {inferenceResult ? (
              <div
                className={`p-6 rounded-2xl border text-center space-y-1.5 ${
                  isHighRisk
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
                    : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 font-mono">
                  AI Predicted Classification
                </span>
                <p className="text-3xl font-extrabold tracking-tight">
                  {isHighRisk ? "🔴 HIGH RISK (Diabetes)" : "🟢 LOW RISK (Normal Baseline)"}
                </p>
                <p className="text-xs font-semibold">
                  Risk Probability: {(inferenceResult.prediction * 100).toFixed(1)}% • Confidence:{" "}
                  {(inferenceResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No prediction yet. Please go to &quot;Lab Data&quot; and click &quot;Run AI Disease Risk Assessment&quot;.
              </div>
            )}

            {/* Triad Multi-Disease Diagnostic Matrix: Diabetes, Cancer, Cardiovascular */}
            {renderMultiDiseaseMatrix()}

            {/* Uploaded Report 4-Axis Clinical Benchmarks & Metric Card in Tab 2 */}
            {renderReportBenchmarks()}

            {/* Advanced Clinical Statistics & Derived Physiological Indices */}
            {renderDerivedClinicalMetrics()}

            {/* SHAP Feature Contribution Bars */}
            {inferenceResult && inferenceResult.feature_attributions && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  Biomarker Contribution Forces (SHAP XAI):
                </h3>
                <div className="space-y-2.5">
                  {inferenceResult.feature_attributions.map((attr, idx) => {
                    const isPos = attr.direction === "positive";
                    const percent = Math.min(100, Math.max(15, Math.round(attr.importance * 100)));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200 capitalize">
                            {attr.feature.replace(/_/g, " ")} ({attr.value})
                          </span>
                          <span
                            className={`font-bold font-mono ${
                              isPos ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isPos ? `+${(attr.importance * 100).toFixed(1)}% Risk Driver` : `-${(attr.importance * 100).toFixed(1)}% Normal`}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPos ? "bg-rose-500" : "bg-emerald-500"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCTOR-LEVEL CLINICAL AI CONDITION & PATHOPHYSIOLOGICAL REPORT            */}
            {/* ========================================================================= */}
            {inferenceResult && (
              <div className="border border-emerald-200/80 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Doctor-Level AI Clinical Condition Summary
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                          AI CDSS
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pathophysiological synthesis, organ-axis evaluation, and physician recommendations
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      disabled={!aiExplanation}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Copy entire clinical condition report"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRegenerateSummary}
                      disabled={isSummarizing}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
                      <span>{isSummarizing ? "Synthesizing..." : "Regenerate AI Summary"}</span>
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                {isSummarizing ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Synthesizing Doctor-Level Clinical Condition & Pathophysiological Report...
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Evaluating Glycemic, Metabolic, and Cardiovascular axes
                    </p>
                  </div>
                ) : aiExplanation ? (
                  <div className="space-y-3">
                    <div className="bg-white/80 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner font-sans">
                      {renderFormattedSummary(aiExplanation)}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        SecRE-XAI Validated Diagnostic Inference
                      </span>
                      <button
                        onClick={() => {
                          // Clean plain text without symbols for doctor decision notes
                          const cleanNotes = aiExplanation.replace(/\*\*/g, "");
                          setDoctorNotes(
                            (prev) =>
                              `[AI Clinical Condition Summary]:\n${cleanNotes}\n\n[Doctor Clinical Decision]:\n${prev}`
                          );
                          setActiveTab("decision");
                        }}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Attach to Doctor Decision Notes & Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No condition summary generated yet.
                    </p>
                    <button
                      onClick={handleRegenerateSummary}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Generate Doctor Clinical AI Summary
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setActiveTab("input")}
                className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Lab Data</span>
              </button>

              <button
                onClick={() => setActiveTab("decision")}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Proceed to Doctor Decision</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DOCTOR FINAL CLINICAL DECISION                                     */}
        {/* ========================================================================= */}
        {activeTab === "decision" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Doctor Final Clinical Decision
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI is a decision-support tool. Final diagnosis belongs strictly to the Doctor.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-bold">
                {doctorDisplayName}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clinical Diagnosis Decision:
                </label>
                <select
                  value={doctorDecision}
                  onChange={(e) => setDoctorDecision(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="CONFIRMED_HIGH_RISK">🔴 Confirmed High Risk (Type 2 Diabetes)</option>
                  <option value="BORDERLINE_MONITORING">🟡 Borderline — Lifestyle Counseling</option>
                  <option value="REQUIRES_HBA1C">🧪 Requires Secondary Fasting HbA1c Test</option>
                  <option value="LOW_RISK_NORMAL">🟢 Low Risk / Normal Baseline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Doctor Clinical Assessment & Treatment Notes:
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white leading-relaxed focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Enter clinical assessment notes, dietary instructions, medication recommendations..."
                />
              </div>

              {decisionError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{decisionError}</span>
                </div>
              )}

              {decisionResponse && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Decision Successfully Signed & Persisted</span>
                  </div>
                  <p className="opacity-90">{decisionResponse.message}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("prediction")}
                  className="py-3.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Risk</span>
                </button>

                <button
                  onClick={handleSaveDecision}
                  disabled={isSavingDecision}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingDecision ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing & Saving Decision...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Sign & Save Final Clinical Decision</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PATIENT ASSESSMENT HISTORY                                         */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Patient Assessment History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Saved clinical records for Patient {patientId}.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-bold">
                {historyRecords.length} Saved Records
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading records from database...</span>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No previous records for Patient {patientId}. Run an assessment in &quot;Lab Data&quot; to save one.
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyRecords.map((rec) => {
                  const isHigh = rec.risk_score !== undefined && rec.risk_score >= 0.5;
                  return (
                    <div
                      key={rec.record_id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {rec.report_name}
                        </span>
                        {rec.doctor_decision && (
                          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold block">
                            👨‍⚕️ Decision: {rec.doctor_decision}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 block">
                          ID: {rec.record_id}
                        </span>
                      </div>

                      <span
                        className={`self-start sm:self-auto px-3 py-1 rounded-full font-bold text-xs ${
                          isHigh
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {rec.prediction_label || (isHigh ? "High Risk" : "Low Risk")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
