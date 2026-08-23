"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  RefreshCw,
  Stethoscope,
  Key,
  LogIn,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function SessionExpiredModal() {
  const {
    isSessionExpired,
    setIsSessionExpired,
    user,
    lastKnownPhone,
    lastKnownName,
    reAuthenticate,
    reAuthenticateDemo,
    logout,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isSessionExpired) return null;

  const clinicianName =
    user?.full_name ||
    lastKnownName ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") ||
    "Authorized Clinician";

  const clinicianIdentifier =
    user?.phone_number ||
    lastKnownPhone ||
    user?.email ||
    "9345693386";

  const handlePasswordReAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password to renew session.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await reAuthenticate(password.trim());
      setSuccess(true);
      setTimeout(() => {
        setIsSessionExpired(false);
        setSuccess(false);
        setPassword("");
      }, 1000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Re-authentication failed. Please verify your password.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoReAuth = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await reAuthenticateDemo();
      setSuccess(true);
      setTimeout(() => {
        setIsSessionExpired(false);
        setSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      setError((err as Error).message || "1-Click re-authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-lg w-full space-y-6 text-slate-900 dark:text-slate-100 relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 text-[11px] font-bold tracking-wide uppercase">
              <span>Security Re-Authentication</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Clinical Session Expired
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your security access token has expired. Re-authenticate to renew your access token and continue your work without losing unsaved changes.
            </p>
          </div>
        </div>

        {/* Current User Snapshot */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{clinicianName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {clinicianIdentifier}
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {user?.role || "Doctor"}
          </span>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Access token replaced successfully! Resuming clinical workspace...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePasswordReAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Enter Password to Replace Access Token</span>
            </label>
            <input
              type="password"
              placeholder="e.g. 250825"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Renewing Access Token...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Re-Authenticate & Replace Access Token</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Renewal */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 tracking-wider">
              Or Quick 1-Click Renewal
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoReAuth}
          disabled={isSubmitting || success}
          className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>1-Click Re-Authenticate as Dr. Sarah Mitchell (NPI: 1487290145)</span>
        </button>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/auth"
            onClick={() => {
              setIsSessionExpired(false);
              logout();
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Sign in with different account</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
          >
            Log Out Completely
          </button>
        </div>
      </div>
    </div>
  );
}
