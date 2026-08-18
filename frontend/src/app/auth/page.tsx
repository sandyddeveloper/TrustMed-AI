"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth, PractitionerRole } from "@/context/AuthContext";
import { ShieldCheck, Lock, UserCheck, Stethoscope, Hospital, Key, ArrowRight, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { formatAddress } from "@/lib/utils";

const ROLES: PractitionerRole[] = [
  "Chief Medical Officer",
  "Clinical Radiologist",
  "Cardiologist",
  "AI Safety Auditor",
];

export default function AuthPage() {
  const router = useRouter();
  const { user, isAuthenticated, loginWithWeb3, logout, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<PractitionerRole>("Chief Medical Officer");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!licenseNumber.trim()) {
      setAuthError("Please enter your Practitioner License Number.");
      return;
    }
    if (!institution.trim()) {
      setAuthError("Please specify your Healthcare Institution or Clinic.");
      return;
    }

    try {
      await loginWithWeb3(selectedRole, licenseNumber.trim(), institution.trim());
      router.push("/dashboard");
    } catch (err: unknown) {
      setAuthError((err as Error).message || "Web3 authentication failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Decentralized Healthcare Authentication & SIWE Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Practitioner <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">Web3 Login</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Sign a cryptographic challenge with your Ethereum wallet to verify practitioner identity and access the SecRE-XAI clinical diagnostic engine.
          </p>
        </div>

        {isAuthenticated && user ? (
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 max-w-xl mx-auto animate-fade-in">
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Active Verified Practitioner Session
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.role}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.institution}</p>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Wallet Address:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{formatAddress(user.address)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">License Identifier:</span>
                <span>{user.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Issued Timestamp:</span>
                <span>{new Date(user.issuedAt).toLocaleTimeString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-sans block mb-1">Cryptographic Signature:</span>
                <span className="truncate block max-w-full text-[10px] text-slate-400">{user.authSignature}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch CDSS Modules Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="py-3 px-5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleAuthSubmit}
            className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 max-w-xl mx-auto animate-fade-in"
          >
            {/* Clinical Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Select Clinical Practitioner Role</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === role
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="block font-bold">{role}</span>
                    <span className="text-[10px] opacity-75">Verified Clinical Access</span>
                  </button>
                ))}
              </div>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Medical License Number / NPI</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MD-9847291 or NPI-104928"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            {/* Hospital / Clinic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Healthcare Institution / Research Medical Center</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Johns Hopkins Medicine or Stanford Health"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-medium">
                {authError}
              </div>
            )}

            {/* Submit Auth Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Requesting Wallet Cryptographic Signature...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign Challenge with Web3 Wallet & Login</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                ← Return to Platform Overview
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
