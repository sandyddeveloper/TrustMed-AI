"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  UserCheck,
  ShieldCheck,
  Award,
  Hospital,
  Key,
  Mail,
  FileCheck,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Download,
  ExternalLink,
  Lock,
  AlertCircle,
} from "lucide-react";
import {
  fetchPractitionerProfile,
  updatePractitionerProfile,
  fetchAuditCertificate,
  PractitionerProfile as ProfileType,
  AuditCertificateResponse,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Certificate generation state
  const [certPatientId, setCertPatientId] = useState("");
  const [certificate, setCertificate] = useState<AuditCertificateResponse | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    specialty: "",
    institution: "",
    email: "",
    license_number: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchPractitionerProfile();
      setProfile(data);
      setEditForm({
        name: data.name || user?.full_name || "",
        specialty: data.specialty || "Endocrinology & Clinical Decision Support (CDSS)",
        institution: data.institution || user?.address || "TrustMed Clinical Decision Support Center",
        email: data.email || user?.email || "",
        license_number: data.license_number || user?.npi_number || "1487290145",
      });
    } catch (err: any) {
      console.error("Could not fetch practitioner profile:", err);
      setFetchError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load practitioner profile from server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    try {
      const updated = await updatePractitionerProfile(editForm);
      setProfile(updated);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || "Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!certPatientId.trim()) return;
    setCertLoading(true);
    setCertError(null);
    try {
      const cert = await fetchAuditCertificate(certPatientId.trim());
      setCertificate(cert);
    } catch (err: any) {
      setCertError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to generate clinical audit certificate."
      );
    } finally {
      setCertLoading(false);
    }
  };

  return (
    <DashboardLayout activeSection="profile">
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
        {/* Profile Header Banner */}
        <div className="bg-white/95 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 text-2xl font-bold uppercase shrink-0">
                {(profile?.name || user?.full_name || "Doctor").replace(/^Dr\.\s*/i, "").charAt(0) || "D"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {profile?.name || user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.email ? user.email.split("@")[0] : "Clinician Profile"))}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                    {profile?.role || user?.role || "Chief Medical Officer"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {profile?.specialty || "Endocrinology & Clinical Decision Support (CDSS)"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <Hospital className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{profile?.institution || user?.address || "TrustMed Clinical Decision Support Center"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? "Cancel Edit" : "Edit Credentials"}</span>
              </button>
              <button
                onClick={loadProfile}
                disabled={loading}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                title="Reload Profile from Server"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Doctor credentials successfully synchronized with database.</span>
            </div>
          )}

          {/* Edit Credentials Form */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Update Doctor Profile & Clinical Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Doctor Name & Titles
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hospital Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specialty / Department
                  </label>
                  <input
                    type="text"
                    value={editForm.specialty}
                    onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hospital / Medical Center
                  </label>
                  <input
                    type="text"
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NPI / License Number
                  </label>
                  <input
                    type="text"
                    value={editForm.license_number}
                    onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saveLoading}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {saveLoading ? "Saving to Server..." : "Save Changes via API"}
              </button>
            </form>
          )}

          {/* Practitioner Live Database Metrics Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                On-Chain Signed Diagnoses
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {profile?.total_signed_diagnoses !== undefined ? profile.total_signed_diagnoses : 0} Records
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                Live Database Count
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Average Security Rate ($SR$)
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {profile?.mean_security_rate ? (profile.mean_security_rate * 100).toFixed(0) : "100"}%
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                SecRE Safety Compliance
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Regulatory Standards
              </span>
              <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                IEEE & FDA
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                FDA 21 CFR Part 11 Standard
              </span>
            </div>
          </div>

          {/* Practitioner Identifiers & Personal Details Grid */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-sans">Practitioner ID:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                  {profile?.practitioner_id || user?.patient_id || "PRAC-0001-MD"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-sans">NPI Number:</span>
                <span className="text-teal-700 dark:text-teal-400 font-bold">
                  {profile?.npi_number || user?.npi_number || "1487290145"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-sans">Clinical License:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile?.license_number || "MD-LIC-ACTIVE"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-sans">Hospital Email:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile?.email || user?.email}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-sans">EVM Signer Wallet Address:</span>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold truncate">
                <span>{profile?.wallet_address || user?.wallet_address || "0x71C8401d2f9a941C618b7606e902123985Fda6f1"}</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${profile?.wallet_address || user?.wallet_address || "0x71C8401d2f9a941C618b7606e902123985Fda6f1"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-500"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Audit Certificate Generator */}
        <section className="bg-white/95 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Cryptographic Clinical Audit Certificate Generator</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Export verifiable, tamper-proof diagnostic certificates for clinical records adhering to FDA 21 CFR Part 11.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enter Patient Record Identifier
              </label>
              <input
                type="text"
                value={certPatientId}
                onChange={(e) => setCertPatientId(e.target.value)}
                placeholder="e.g. P001 or REC-P001-8842"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleGenerateCertificate}
              disabled={certLoading || !certPatientId.trim()}
              className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {certLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing Certificate on Blockchain...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Generate Verifiable Certificate</span>
                </>
              )}
            </button>
          </div>

          {certError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{certError}</span>
            </div>
          )}

          {/* Render Certificate if generated */}
          {certificate && (
            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-500/20">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    Official Regulatory Proof
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{certificate.certificate_id}</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                  VALID & SEALED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 font-sans block">Patient Subject:</span>
                  <span className="font-bold">{certificate.patient_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block">Signing Practitioner:</span>
                  <span className="font-bold">{certificate.practitioner_name} ({certificate.practitioner_license})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block">Diagnostic Risk & Model:</span>
                  <span>{certificate.risk_label} • {certificate.model_version}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block">SecRE Metrics:</span>
                  <span>SR: {(certificate.security_rate * 100).toFixed(0)}% • ER: {(certificate.explainability_rate * 100).toFixed(0)}%</span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-emerald-200 dark:border-emerald-500/20">
                  <span className="text-slate-500 font-sans block">Cryptographic Record Hash:</span>
                  <span className="truncate block text-slate-800 dark:text-slate-200 font-bold">{certificate.record_hash}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-sans block">EVM Smart Contract Ledger:</span>
                  <span className="truncate block text-slate-600 dark:text-slate-400">{certificate.evm_contract_address} ({certificate.blockchain_network})</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
