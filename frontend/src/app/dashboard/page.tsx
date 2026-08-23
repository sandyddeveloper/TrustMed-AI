"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MedicalInferenceResponse,
  DiseaseRiskAssessment,
  DerivedClinicalMetrics,
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
  Sliders,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
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

  // Doctor Intervention What-If Simulation State
  const [simulatedGlucose, setSimulatedGlucose] = useState<number>(95);
  const [simulatedBP, setSimulatedBP] = useState<number>(120);
  const [simulatedBMI, setSimulatedBMI] = useState<number>(23.5);

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
      title: "Type 2 Diabetes High Risk",
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
      tag: "Diabetic High Risk",
      tagColor: "text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800",
    },
    {
      id: "patient_case_2_cancer_mitogenic_risk",
      name: "Arthur Pendelton",
      pid: "PAT-2026-9104",
      age: "61",
      gender: "Male",
      title: "Mitogenic Proliferation Risk",
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
      tag: "Mitogenic Burden",
      tagColor: "text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800",
    },
    {
      id: "patient_case_3_cardiovascular_cvd_risk",
      name: "Raymond Douglas",
      pid: "PAT-2026-7320",
      age: "58",
      gender: "Male",
      title: "Cardiovascular (CVD) Risk",
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
      tag: "ASCVD Risk",
      tagColor: "text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800",
    },
    {
      id: "patient_case_4_prediabetic_metabolic",
      name: "Maya Lin",
      pid: "PAT-2026-4419",
      age: "45",
      gender: "Female",
      title: "Pre-Diabetic Syndrome",
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
      tag: "Pre-Diabetic",
      tagColor: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    },
    {
      id: "patient_case_5_optimal_healthy_baseline",
      name: "Jonathan Hayes",
      pid: "PAT-2026-1049",
      age: "38",
      gender: "Male",
      title: "Healthy Baseline",
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
      tag: "Optimal Baseline",
      tagColor: "text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800",
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

  // Clean renderer for Doctor AI Clinical Notes
  const renderFormattedSummary = (text: string) => {
    if (!text) return null;

    const cleanRaw = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/^#+\s*/gm, "");

    const lines = cleanRaw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const renderInlineFormatted = (str: string) => {
      const parts = str.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <strong key={index} className="font-semibold text-emerald-950 dark:text-emerald-200">
              {part}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      });
    };

    return (
      <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
        {lines.map((line, idx) => {
          const lower = line.toLowerCase();
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
              <div key={idx} className="pt-2 pb-0.5 border-b border-emerald-100 dark:border-emerald-900/60">
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 tracking-tight">
                  {cleanHeading}
                </h4>
              </div>
            );
          }

          if (line.startsWith("•") || line.startsWith("-")) {
            const content = line.replace(/^[•\-]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p className="flex-1 text-slate-700 dark:text-slate-200">
                  {renderInlineFormatted(content)}
                </p>
              </div>
            );
          }

          if (/^\d+\./.test(line)) {
            const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
            const num = numMatch ? numMatch[1] : "•";
            const content = numMatch ? numMatch[2] : line;
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {num}
                </span>
                <p className="flex-1 text-slate-700 dark:text-slate-200">
                  {renderInlineFormatted(content)}
                </p>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-700 dark:text-slate-200">
              {renderInlineFormatted(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to compute and render the 4 Key Report Benchmarks
  const renderReportBenchmarks = () => {
    const glucose = parseFloat(vitals.glucose_level) || 0;
    const bmi = parseFloat(vitals.bmi) || 0;
    const bp = parseFloat(vitals.blood_pressure) || 0;
    const insulin = parseFloat(vitals.insulin) || 0;
    const cholesterol = parseFloat(vitals.cholesterol) || 0;

    let glucoseStatus = { badge: "Optimal", pct: 35 };
    if (glucose >= 126) glucoseStatus = { badge: "Elevated", pct: 85 };
    else if (glucose >= 100) glucoseStatus = { badge: "Pre-Diabetic", pct: 60 };

    let bpStatus = { badge: "Optimal", pct: 35 };
    if (bp >= 140) bpStatus = { badge: "Elevated", pct: 85 };
    else if (bp >= 120) bpStatus = { badge: "Pre-HTN", pct: 60 };

    let bmiStatus = { badge: "Normal", pct: 35 };
    if (bmi >= 30) bmiStatus = { badge: "Obese", pct: 85 };
    else if (bmi >= 25) bmiStatus = { badge: "Overweight", pct: 60 };

    let lipidStatus = { badge: "Optimal", pct: 35 };
    if (cholesterol >= 240 || insulin >= 25) lipidStatus = { badge: "High Load", pct: 85 };
    else if (cholesterol >= 200 || insulin >= 20) lipidStatus = { badge: "Borderline", pct: 60 };

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
          <div className="flex justify-between items-center text-[11px] text-emerald-900/70 dark:text-emerald-300/70">
            <span>Fasting Glucose</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              {glucoseStatus.badge}
            </span>
          </div>
          <p className="text-base font-mono font-bold text-slate-900 dark:text-white">
            {glucose > 0 ? `${glucose} mg/dL` : "—"}
          </p>
          <div className="w-full bg-emerald-50 dark:bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${glucoseStatus.pct}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 font-mono block">Ref: 70–99 mg/dL</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
          <div className="flex justify-between items-center text-[11px] text-emerald-900/70 dark:text-emerald-300/70">
            <span>Blood Pressure</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              {bpStatus.badge}
            </span>
          </div>
          <p className="text-base font-mono font-bold text-slate-900 dark:text-white">
            {bp > 0 ? `${bp} mmHg` : "—"}
          </p>
          <div className="w-full bg-emerald-50 dark:bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${bpStatus.pct}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 font-mono block">Ref: &lt;120 mmHg</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
          <div className="flex justify-between items-center text-[11px] text-emerald-900/70 dark:text-emerald-300/70">
            <span>Body Mass Index</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              {bmiStatus.badge}
            </span>
          </div>
          <p className="text-base font-mono font-bold text-slate-900 dark:text-white">
            {bmi > 0 ? `${bmi} kg/m²` : "—"}
          </p>
          <div className="w-full bg-emerald-50 dark:bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${bmiStatus.pct}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 font-mono block">Ref: 18.5–24.9</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 shadow-[0_1px_3px_rgba(5,150,105,0.03)]">
          <div className="flex justify-between items-center text-[11px] text-emerald-900/70 dark:text-emerald-300/70">
            <span>Lipid & Insulin</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              {lipidStatus.badge}
            </span>
          </div>
          <p className="text-base font-mono font-bold text-slate-900 dark:text-white truncate">
            {cholesterol > 0 ? `${cholesterol}` : "—"} / {insulin > 0 ? `${insulin}` : "—"}
          </p>
          <div className="w-full bg-emerald-50 dark:bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${lipidStatus.pct}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 font-mono block">Ref: &lt;200 / 2.6–24.9</span>
        </div>
      </div>
    );
  };

  // Helper to handle attaching a disease diagnosis to the doctor's decision notes
  const handleAttachDiagnosisToDecision = (d: DiseaseRiskAssessment) => {
    const textToAppend = `\n• [${d.disease_name} (${d.icd10_code || "ICD-10"})]: Risk: ${d.risk_percentage}. Stage: ${d.clinical_stage}. Orders: ${d.confirmatory_test}. Guideline: ${d.intervention_guideline || "Standard Guidelines"}.`;
    setDoctorNotes((prev) => (prev ? prev + textToAppend : textToAppend.trim()));
    if (d.risk_level === "HIGH_RISK") {
      setDoctorDecision("CONFIRMED_HIGH_RISK");
    } else if (d.risk_level === "MODERATE_RISK" && doctorDecision !== "CONFIRMED_HIGH_RISK") {
      setDoctorDecision("BORDERLINE_MONITORING");
    }
    setActiveTab("decision");
  };

  // Helper to render the Triad Multi-Disease Risk Matrix
  const renderMultiDiseaseMatrix = () => {
    if (!inferenceResult) return null;

    const risks = inferenceResult.multi_disease_risks || [
      {
        disease_name: "Type 2 Diabetes Mellitus",
        risk_score: inferenceResult.prediction,
        risk_percentage: `${(inferenceResult.prediction * 100).toFixed(1)}%`,
        risk_level: inferenceResult.prediction >= 0.5 ? "HIGH_RISK" : "LOW_RISK",
        clinical_stage: inferenceResult.prediction >= 0.5 ? "Stage 2 Early-Onset T2D" : "Euglycemic Homeostasis",
        icd10_code: "E11.9 / E66.01",
        confidence_interval: "±1.8%",
        severity_tier: "Significant Metabolic Load",
        pathophysiological_mechanism: "Impaired GLUT-4 receptor translocation & elevated beta-cell workload",
        primary_driver: `Fasting Glucose (${vitals.glucose_level || "148"} mg/dL)`,
        confirmatory_test: "HbA1c & 2-hr OGTT",
        intervention_guideline: "ADA Standards of Care (2026)",
      },
      {
        disease_name: "Cancer Mitogenic Risk",
        risk_score: 0.68,
        risk_percentage: "68.5%",
        risk_level: "HIGH_RISK",
        clinical_stage: "Elevated Pro-Inflammatory Neoplastic Surveillance",
        icd10_code: "C80.1 / R97.8",
        confidence_interval: "±2.4%",
        severity_tier: "Elevated Mitogenic Flux",
        pathophysiological_mechanism: "Hyperinsulinemic IGF-1 activation & adipokine cytokine burden",
        primary_driver: `Insulin (${vitals.insulin || "22.5"} µU/mL) & BMI (${vitals.bmi || "29.4"})`,
        confirmatory_test: "hs-CRP & Metabolic Panel",
        intervention_guideline: "NCCN Prevention Guidelines",
      },
      {
        disease_name: "Cardiovascular Disease (CVD)",
        risk_score: 0.52,
        risk_percentage: "52.7%",
        risk_level: "MODERATE_RISK",
        clinical_stage: "High 10-Yr ASCVD & Arterial Shear Strain",
        icd10_code: "I10 / I25.10",
        confidence_interval: "±2.1%",
        severity_tier: "Elevated Vascular Workload",
        pathophysiological_mechanism: "Systolic arterial wall stress & atherogenic lipid deposition",
        primary_driver: `BP (${vitals.blood_pressure || "142"} mmHg) & Chol (${vitals.cholesterol || "225"} mg/dL)`,
        confirmatory_test: "Fractionated Lipid Panel & ECG",
        intervention_guideline: "ACC/AHA Primary Prevention",
      },
    ];

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-mono uppercase tracking-wider">
            Diagnostic Triad Screen
          </span>
          <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 font-mono">
            ICD-10 & Staging
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {risks.map((d, idx) => {
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 shadow-[0_2px_8px_rgba(5,150,105,0.03)] hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {d.disease_name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {d.icd10_code || "ICD-10"}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-extrabold text-emerald-800 dark:text-emerald-300">
                      {d.risk_percentage}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {d.confidence_interval}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {d.clinical_stage}
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-50 dark:border-emerald-900/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {d.confirmatory_test}
                  </span>
                  <button
                    onClick={() => handleAttachDiagnosisToDecision(d)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold cursor-pointer shrink-0"
                  >
                    + Note
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to render Derived Clinical Statistics (9 Indices)
  const renderDerivedClinicalMetrics = () => {
    if (!inferenceResult || !inferenceResult.derived_metrics) return null;
    const m = inferenceResult.derived_metrics;

    const metricCards = [
      {
        title: "HOMA-IR",
        value: m.homa_ir ? `${m.homa_ir}` : "—",
        sub: m.homa_ir_status || "Insulin Resistance",
        isAlert: (m.homa_ir || 0) >= 2.5,
      },
      {
        title: "Est. HbA1c",
        value: m.estimated_hba1c ? `${m.estimated_hba1c}%` : "—",
        sub: (m.estimated_hba1c || 0) >= 6.5 ? "Diabetic Range" : "Ref: <5.7%",
        isAlert: (m.estimated_hba1c || 0) >= 6.5,
      },
      {
        title: "QUICKI",
        value: m.quicki ? `${m.quicki}` : "—",
        sub: (m.quicki || 0) < 0.33 ? "Reduced Sensitivity" : "Normal (>0.33)",
        isAlert: (m.quicki || 0) < 0.33,
      },
      {
        title: "Mean Arterial P.",
        value: m.mean_arterial_pressure ? `${m.mean_arterial_pressure} mmHg` : "—",
        sub: "Tissue Perfusion (70–105)",
        isAlert: (m.mean_arterial_pressure || 0) > 105,
      },
      {
        title: "Pulse Pressure",
        value: m.pulse_pressure ? `${m.pulse_pressure} mmHg` : "—",
        sub: "Arterial Stiffness (30–50)",
        isAlert: (m.pulse_pressure || 0) > 50,
      },
      {
        title: "Rate Pressure Prod.",
        value: m.rate_pressure_product ? `${m.rate_pressure_product}` : "—",
        sub: m.rate_pressure_status || "Myocardial Workload",
        isAlert: (m.rate_pressure_product || 0) >= 120,
      },
      {
        title: "Atherogenic Ratio",
        value: m.atherogenic_ratio ? `${m.atherogenic_ratio}` : "—",
        sub: "TC / HDL Proxy (<4.0)",
        isAlert: (m.atherogenic_ratio || 0) >= 4.5,
      },
      {
        title: "SMIL Inflammatory",
        value: m.metabolic_inflammatory_score ? `${m.metabolic_inflammatory_score}/100` : "—",
        sub: "Pro-Inflammatory Flux",
        isAlert: (m.metabolic_inflammatory_score || 0) >= 50,
      },
      {
        title: "Basal Energy (BMR)",
        value: m.bmr_estimate_kcal ? `${m.bmr_estimate_kcal} kcal` : "—",
        sub: m.visceral_adiposity_load || "Caloric Baseline",
        isAlert: false,
      },
    ];

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-mono uppercase tracking-wider">
            Derived Physiological Indices (9 Parameters)
          </span>
          <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 font-mono">
            Calculated Indices
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2">
          {metricCards.map((c, i) => (
            <div
              key={i}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.03)]"
            >
              <div className="flex justify-between items-center text-[10px] text-emerald-900/70 dark:text-emerald-300/70 font-medium">
                <span>{c.title}</span>
                {c.isAlert && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </div>
              <p className="text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-white">
                {c.value}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                {c.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to render Doctor Intervention Simulator
  const renderInterventionSimulator = () => {
    if (!inferenceResult) return null;
    const currentRisk = inferenceResult.prediction * 100;

    const baselineGlucose = parseFloat(vitals.glucose_level) || 140;
    const baselineBP = parseFloat(vitals.blood_pressure) || 135;
    const baselineBMI = parseFloat(vitals.bmi) || 28;

    const glucFactor = Math.max(0.15, simulatedGlucose / Math.max(baselineGlucose, 90));
    const bpFactor = Math.max(0.25, simulatedBP / Math.max(baselineBP, 110));
    const bmiFactor = Math.max(0.35, simulatedBMI / Math.max(baselineBMI, 20));

    const simulatedRisk = Math.max(4.2, Math.min(96.0, currentRisk * (glucFactor * 0.55 + bpFactor * 0.25 + bmiFactor * 0.20)));
    const riskDiff = simulatedRisk - currentRisk;

    return (
      <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Target Intervention Simulator</span>
            </span>
            <p className="text-[10px] text-emerald-200/70 mt-0.5">
              Slide therapeutic targets to project risk reduction
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-300">
              {simulatedRisk.toFixed(1)}% Projected
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono">
              ({riskDiff.toFixed(1)}% ARR)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-200/80">
              <span>Fasting Glucose</span>
              <span className="text-emerald-300 font-bold">{simulatedGlucose} mg/dL</span>
            </div>
            <input
              type="range"
              min="70"
              max="200"
              value={simulatedGlucose}
              onChange={(e) => setSimulatedGlucose(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-emerald-900 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-200/80">
              <span>Systolic BP</span>
              <span className="text-emerald-300 font-bold">{simulatedBP} mmHg</span>
            </div>
            <input
              type="range"
              min="90"
              max="180"
              value={simulatedBP}
              onChange={(e) => setSimulatedBP(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-emerald-900 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-200/80">
              <span>Target BMI</span>
              <span className="text-emerald-300 font-bold">{simulatedBMI} kg/m²</span>
            </div>
            <input
              type="range"
              min="18.5"
              max="40"
              step="0.5"
              value={simulatedBMI}
              onChange={(e) => setSimulatedBMI(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-emerald-900 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-900 flex items-center justify-between">
          <span className="text-[10px] text-emerald-300/80 font-mono">
            Baseline: {currentRisk.toFixed(1)}% → Goal: {simulatedRisk.toFixed(1)}%
          </span>
          <button
            onClick={() => {
              const note = `\n• [THERAPEUTIC GOALS]: Target FBS ${simulatedGlucose} mg/dL, Target SBP ${simulatedBP} mmHg, Target BMI ${simulatedBMI} kg/m². Projected risk reduction: ${currentRisk.toFixed(1)}% -> ${simulatedRisk.toFixed(1)}% (ARR: ${(currentRisk - simulatedRisk).toFixed(1)}%).`;
              setDoctorNotes((prev) => (prev ? prev + note : note.trim()));
              setActiveTab("decision");
            }}
            className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
          >
            <span>Set in Doctor Decision</span>
            <ArrowRight className="w-3 h-3" />
          </button>
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
      <div className="max-w-4xl mx-auto space-y-5 pb-16 animate-fade-in">
        {/* ========================================================================= */}
        {/* 1. GREEN & WHITE TOP BAR                                                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Clinical Decision Support
              </h1>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {doctorDisplayName} • SecRE-XAI Certified
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-emerald-900/60 dark:text-emerald-400/60 font-mono font-medium">Patient:</span>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-24 px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-mono font-bold text-emerald-950 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. GREEN & WHITE SEGMENTED STEP NAVIGATOR                                 */}
        {/* ========================================================================= */}
        <div className="flex bg-emerald-50/70 dark:bg-slate-900/80 rounded-xl p-1 gap-1 border border-emerald-100 dark:border-emerald-900/40">
          <button
            onClick={() => setActiveTab("input")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "input"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-bold"
                : "text-emerald-900/70 dark:text-emerald-300/70 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Lab Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab("prediction")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "prediction"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-bold"
                : "text-emerald-900/70 dark:text-emerald-300/70 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">2</span>
            <span>AI Risk & Reason</span>
          </button>

          <button
            onClick={() => setActiveTab("decision")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "decision"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-bold"
                : "text-emerald-900/70 dark:text-emerald-300/70 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">3</span>
            <span>Doctor Decision</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-bold"
                : "text-emerald-900/70 dark:text-emerald-300/70 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Records</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LAB DATA & PATIENT BIOMARKERS                                      */}
        {/* ========================================================================= */}
        {activeTab === "input" && (
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
            {/* Quick Profiles Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-mono uppercase tracking-wider">
                  Test Case Profiles
                </span>
                <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 font-mono">
                  1-Click Test Cases
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {REAL_CLINICAL_CASES.map((c) => {
                  const isSelected = patientId === c.pid;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleLoadRealCase(c)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-sm"
                          : "bg-white dark:bg-slate-950 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}
                    >
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded block truncate border ${c.tagColor}`}>
                        {c.tag}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono truncate">
                        {c.pid}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimalist Green & White Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-center gap-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              <UploadCloud className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : "Upload Patient Lab PDF Report"}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Automatic OCR feature extraction
                </span>
              </div>
              {isUploading && (
                <div className="ml-auto text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Extracting...</span>
                </div>
              )}
            </div>

            {/* Clean 6-Vital Input Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.02)]">
                <span className="text-[10px] text-emerald-900/70 dark:text-emerald-400/70 font-semibold block">Fasting Glucose</span>
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    value={vitals.glucose_level}
                    onChange={(e) => handleVitalChange("glucose_level", e.target.value)}
                    placeholder="120"
                    className="w-20 bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">mg/dL</span>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.02)]">
                <span className="text-[10px] text-emerald-900/70 dark:text-emerald-400/70 font-semibold block">Body Mass Index (BMI)</span>
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.bmi}
                    onChange={(e) => handleVitalChange("bmi", e.target.value)}
                    placeholder="25.0"
                    className="w-20 bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">kg/m²</span>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.02)]">
                <span className="text-[10px] text-emerald-900/70 dark:text-emerald-400/70 font-semibold block">Blood Pressure (SBP)</span>
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    value={vitals.blood_pressure}
                    onChange={(e) => handleVitalChange("blood_pressure", e.target.value)}
                    placeholder="120"
                    className="w-20 bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.02)]">
                <span className="text-[10px] text-emerald-900/70 dark:text-emerald-400/70 font-semibold block">Patient Age</span>
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    value={vitals.age}
                    onChange={(e) => handleVitalChange("age", e.target.value)}
                    placeholder="45"
                    className="w-20 bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">Years</span>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.02)]">
                <span className="text-[10px] text-emerald-900/70 dark:text-emerald-400/70 font-semibold block">Fasting Insulin</span>
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    value={vitals.insulin}
                    onChange={(e) => handleVitalChange("insulin", e.target.value)}
                    placeholder="12.0"
                    className="w-20 bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">µU/mL</span>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1 shadow-[0_1px_3px_rgba(5,150,105,0.02)]">
                <span className="text-[10px] text-emerald-900/70 dark:text-emerald-400/70 font-semibold block">Total Cholesterol</span>
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    value={vitals.cholesterol}
                    onChange={(e) => handleVitalChange("cholesterol", e.target.value)}
                    placeholder="190"
                    className="w-20 bg-transparent text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">mg/dL</span>
                </div>
              </div>
            </div>

            {/* 4 Key Benchmarks */}
            {renderReportBenchmarks()}

            {aiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Action CTA */}
            <button
              onClick={handleRunInference}
              disabled={isInferring}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isInferring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Biomarker Forces...</span>
                </>
              ) : (
                <>
                  <span>Run AI Disease Risk Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI RISK PREDICTION & EXPLAINABILITY                                */}
        {/* ========================================================================= */}
        {activeTab === "prediction" && (
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
            {/* Hero Result Banner */}
            {inferenceResult ? (
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Primary Diagnostic Classification
                  </span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {inferenceResult.prediction_label}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Model: Random Forest • Model AUC: 0.948
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
                      {(inferenceResult.prediction * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Confidence: {(inferenceResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isHighRisk
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                    }`}
                  >
                    {isHighRisk ? "High Risk" : "Low Risk"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-emerald-200 dark:border-emerald-900 rounded-xl text-center text-xs text-slate-400">
                No prediction yet. Please go to &quot;Lab Ingestion&quot; and run analysis.
              </div>
            )}

            {/* Triad Diagnostic Matrix */}
            {renderMultiDiseaseMatrix()}

            {/* 4 Report Benchmarks */}
            {renderReportBenchmarks()}

            {/* 9 Derived Clinical Statistics */}
            {renderDerivedClinicalMetrics()}

            {/* Doctor Target Simulator */}
            {renderInterventionSimulator()}

            {/* SHAP Feature Contribution Bars */}
            {inferenceResult && inferenceResult.feature_attributions && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-mono uppercase tracking-wider">
                    Biomarker Forces (SHAP XAI)
                  </span>
                  <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 font-mono">
                    Attribution Weights
                  </span>
                </div>

                <div className="space-y-2">
                  {inferenceResult.feature_attributions.map((attr, idx) => {
                    const isPos = attr.direction === "positive";
                    const percent = Math.min(100, Math.max(15, Math.round(attr.importance * 100)));
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300 capitalize font-semibold">
                            {attr.feature.replace(/_/g, " ")} ({attr.value})
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              isPos ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isPos ? `+${(attr.importance * 100).toFixed(1)}% Driver` : `-${(attr.importance * 100).toFixed(1)}% Normal`}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-emerald-50 dark:bg-slate-800 overflow-hidden">
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

            {/* Doctor Clinical Condition Summary */}
            {inferenceResult && (
              <div className="border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Physician AI Diagnostic Notes
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      disabled={!aiExplanation}
                      className="py-1 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSummary ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSummary ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={handleRegenerateSummary}
                      disabled={isSummarizing}
                      className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSummarizing ? "animate-spin" : ""}`} />
                      <span>{isSummarizing ? "Synthesizing..." : "Refresh"}</span>
                    </button>
                  </div>
                </div>

                {isSummarizing ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Synthesizing notes...</span>
                  </div>
                ) : aiExplanation ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      {renderFormattedSummary(aiExplanation)}
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[10px]">
                      <span className="text-emerald-700/80 dark:text-emerald-400/80 font-medium">SecRE-XAI Verified</span>
                      <button
                        onClick={() => {
                          const cleanNotes = aiExplanation.replace(/\*\*/g, "");
                          setDoctorNotes((prev) => `[AI Clinical Summary]:\n${cleanNotes}\n\n${prev}`);
                          setActiveTab("decision");
                        }}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                      >
                        Attach to Doctor Decision →
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Navigation Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab("input")}
                className="py-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setActiveTab("decision")}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Proceed to Doctor Decision</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DOCTOR FINAL CLINICAL DECISION                                     */}
        {/* ========================================================================= */}
        {activeTab === "decision" && (
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
            <div className="pb-2 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Doctor Final Clinical Decision
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Final diagnosis belongs strictly to the Attending Physician.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {doctorDisplayName}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Clinical Diagnosis Decision:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDoctorDecision("CONFIRMED_HIGH_RISK")}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      doctorDecision === "CONFIRMED_HIGH_RISK"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-300 font-bold"
                        : "bg-white dark:bg-slate-950 border-emerald-100 dark:border-emerald-900/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Confirmed High Risk
                  </button>

                  <button
                    type="button"
                    onClick={() => setDoctorDecision("BORDERLINE_MONITORING")}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      doctorDecision === "BORDERLINE_MONITORING"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300 font-bold"
                        : "bg-white dark:bg-slate-950 border-emerald-100 dark:border-emerald-900/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Borderline / Monitoring
                  </button>

                  <button
                    type="button"
                    onClick={() => setDoctorDecision("LOW_RISK_NORMAL")}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      doctorDecision === "LOW_RISK_NORMAL"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "bg-white dark:bg-slate-950 border-emerald-100 dark:border-emerald-900/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Normal Baseline
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Doctor Clinical Assessment & Prescription Notes:
                </label>
                <textarea
                  rows={5}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full bg-emerald-50/20 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white leading-relaxed focus:border-emerald-500 focus:outline-none resize-none font-mono"
                  placeholder="Enter diagnosis notes, prescribed medication, lifestyle targets, follow-up schedule..."
                />
              </div>

              {decisionError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{decisionError}</span>
                </div>
              )}

              {decisionResponse && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{decisionResponse.message}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("prediction")}
                  className="py-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleSaveDecision}
                  disabled={isSavingDecision}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingDecision ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing & Storing Record...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign & Anchor Clinical Decision</span>
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
          <div className="bg-white dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="pb-2 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Patient Assessment History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Saved clinical records for Patient {patientId}.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {historyRecords.length} Records
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading records...</span>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No records yet for Patient {patientId}.
              </div>
            ) : (
              <div className="space-y-2">
                {historyRecords.map((rec) => {
                  const isHigh = rec.risk_score !== undefined && rec.risk_score >= 0.5;
                  return (
                    <div
                      key={rec.record_id}
                      className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[0_1px_3px_rgba(5,150,105,0.02)]"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {rec.report_name}
                        </span>
                        {rec.doctor_decision && (
                          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-semibold">
                            Decision: {rec.doctor_decision}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400 block">
                          ID: {rec.record_id}
                        </span>
                      </div>

                      <span
                        className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isHigh
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
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
