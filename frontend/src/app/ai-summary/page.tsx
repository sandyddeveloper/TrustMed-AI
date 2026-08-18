"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Sparkles, Brain, FileText, Send, Download, RefreshCw, CheckCircle2, ShieldCheck, FileSpreadsheet, Bot, Cpu } from "lucide-react";

interface SummaryCase {
  patientId: string;
  riskScore: string;
  primaryRiskFactors: string[];
  radiologyFinding: string;
  secreRate: string;
  executiveSummary: string;
  clinicalRecommendations: string[];
}

export default function AiSummaryPage() {
  const [patientIdInput, setPatientIdInput] = useState("");
  const [activeTab, setActiveTab] = useState<"synthesizer" | "assistant">("synthesizer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryCase | null>(null);

  // Chat / Assistant state
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hello Doctor. I am your SecRE-XAI Clinical AI Intelligence Copilot. You can ask me to synthesize diagnostic reports, evaluate physiological bounds, or clarify SHAP/Grad-CAM feature attributions.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) {
      alert("Please specify a Patient Identifier to generate the AI summary.");
      return;
    }

    setIsGenerating(true);
    // Simulate multi-modal clinical intelligence synthesis (ready for future model integration)
    await new Promise((r) => setTimeout(r, 900));

    const generated: SummaryCase = {
      patientId: patientIdInput.trim().toUpperCase(),
      riskScore: "78.4% (Elevated Cardiovascular & Metabolic Risk)",
      primaryRiskFactors: ["Systolic Blood Pressure (165 mmHg)", "Fasting Glucose (185 mg/dL)", "BMI (34.2 kg/m²)"],
      radiologyFinding: "Bilateral pulmonary opacification identified via DenseNet-121 Grad-CAM in lower lobes (Pneumonia 88.5% confidence).",
      secreRate: "92% (SecRE-XAI Verified Tier-1 Compliant)",
      executiveSummary: `Multi-modal diagnostic synthesis for ${patientIdInput.trim().toUpperCase()} demonstrates compounded metabolic stress and radiographic lower-lobe opacities. Both XGBoost and Random Forest ensembles concordantly classify the patient as High Risk (AUC 0.965). Explainability attributions (SHAP) confirm glucose and systolic pressure as principal drivers of cardiovascular risk elevation.`,
      clinicalRecommendations: [
        "Immediate clinical follow-up for hypertensive and glycemic stabilization.",
        "Confirmatory microbiological sputum culture regarding lower-lobe infiltrate opacities.",
        "Maintain cryptographic evidentiary audit trail on Ethereum Sepolia for regulatory traceability.",
      ],
    };

    setSummaryData(generated);
    setIsGenerating(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setChatInput("");
    setIsReplying(true);

    await new Promise((r) => setTimeout(r, 700));

    let reply = `Based on the SecRE-XAI diagnostic pipeline and physiological safety boundaries ($SR$), patient biomarker distributions indicate elevated metabolic strain. SHAP attributions highlight fasting glucose and systolic BP as the primary causal contributors.`;
    if (userText.toLowerCase().includes("grad-cam") || userText.toLowerCase().includes("x-ray") || userText.toLowerCase().includes("xray")) {
      reply = `DenseNet-121 layer-16 feature maps indicate spatial activation focused over the pulmonary base, suggesting opacification consistent with early-stage consolidation or pleural effusion.`;
    } else if (userText.toLowerCase().includes("blockchain") || userText.toLowerCase().includes("tamper") || userText.toLowerCase().includes("audit")) {
      reply = `All diagnostic records and SHAP explanation vectors are hashed via Keccak-256 and anchored to TrustMedAudit.sol on Ethereum Sepolia with verified Pinata IPFS Content Identifiers.`;
    }

    setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    setIsReplying(false);
  };

  const handleExportJSON = () => {
    if (!summaryData) return;
    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Clinical_Summary_${summaryData.patientId}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Modal AI Clinical Summary & Research Copilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              AI Diagnostic Synthesis Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated synthesis of tabular clinical biomarkers, radiographic Grad-CAM heatmaps, and SecRE compliance reports.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("synthesizer")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "synthesizer"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Case Synthesis Report
            </button>
            <button
              onClick={() => setActiveTab("assistant")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "assistant"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              AI Clinical Assistant (Copilot)
            </button>
          </div>
        </div>

        {/* Tab 1: Case Synthesizer */}
        {activeTab === "synthesizer" && (
          <div className="space-y-6 animate-fade-in">
            {/* Input Trigger Box */}
            <form onSubmit={handleGenerateSummary} className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Patient Identifier / Case ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. PAT-8091 or PAT-2026-001"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Multi-Modal AI Data...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Generate AI Clinical Synthesis</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated Summary Card */}
            {summaryData ? (
              <div className="bg-white dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                      Clinical Executive Synthesis
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Record: {summaryData.patientId}</h2>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON Diagnostic Summary</span>
                  </button>
                </div>

                {/* Metric Summary Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium block mb-1">Composite Clinical Risk</span>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{summaryData.riskScore}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium block mb-1">SecRE Compliance Index</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{summaryData.secreRate}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium block mb-1">Primary XAI Biomarkers</span>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {summaryData.primaryRiskFactors.join(" • ")}
                    </p>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Executive Multi-Modal Summary</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {summaryData.executiveSummary}
                  </p>
                </div>

                {/* Radiology Synthesis */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>DenseNet-121 Radiographic Synthesis</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[12px]">
                    {summaryData.radiologyFinding}
                  </p>
                </div>

                {/* Clinical Next Steps */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Recommended Clinical Next Steps</span>
                  </h3>
                  <ul className="space-y-2">
                    {summaryData.clinicalRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Brain className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Summary Generated Yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Enter a Patient Identifier above and click &quot;Generate AI Clinical Synthesis&quot; to aggregate tabular biomarkers, Grad-CAM attention overlays, and blockchain ledger evidence into an executive report.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Clinical Assistant (Copilot) */}
        {activeTab === "assistant" && (
          <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">SecRE-XAI Diagnostic Copilot</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Interactive dialogue with the explainable clinical AI engine (Ready for future LLM integration).
                </p>
              </div>
            </div>

            {/* Chat message stream */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                        : "bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isReplying && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span>SecRE Copilot analyzing clinical feature space...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Ask about SHAP feature attributions, Grad-CAM heatmaps, or SecRE safety bounds..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={isReplying || !chatInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
