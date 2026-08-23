"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth, PractitionerRole } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Stethoscope,
  Hospital,
  Key,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loginWithCredentials,
    signupWithCredentials,
    loginWithDemo,
    logout,
    isLoading,
  } = useAuth();
  const { t } = useLanguage();

  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "signup">("login");

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupAge, setSignupAge] = useState<number | "">("");
  const [signupGender, setSignupGender] = useState("Female");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupRole, setSignupRole] = useState<PractitionerRole>("Chief Medical Officer");
  const [signupNpi, setSignupNpi] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyRegistered, setNewlyRegistered] = useState<{
    patient_id?: string;
    record_number?: string;
    name: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!loginPhone.trim() || !loginPassword.trim()) {
        throw new Error("Please enter both phone number/email and password.");
      }
      await loginWithCredentials(loginPhone.trim(), loginPassword.trim());
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Authentication failed.";
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!signupEmail.trim() || !signupPassword.trim() || !signupPhone.trim()) {
        throw new Error("Email, Phone Number, and Password are required.");
      }
      if (!signupFirstName.trim() || !signupLastName.trim()) {
        throw new Error("First and Last Name are required.");
      }
      if (signupPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const createdUser = await signupWithCredentials({
        email: signupEmail.trim(),
        phone_number: signupPhone.trim(),
        password: signupPassword,
        first_name: signupFirstName.trim(),
        last_name: signupLastName.trim(),
        age: Number(signupAge) || 35,
        gender: signupGender,
        address: signupAddress.trim() || "Residential Address",
        role: signupRole,
        npi_number: signupNpi.trim() || undefined,
      });

      setNewlyRegistered({
        patient_id: createdUser.patient_id,
        record_number: createdUser.record_number,
        name: createdUser.full_name || `${signupFirstName} ${signupLastName}`,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error).message ||
        "Registration failed.";
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithDemo();
      router.push("/dashboard");
    } catch (err: unknown) {
      setAuthError((err as Error).message || "Demo login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPatientId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor & Clinician CDSS Security Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Clinician & Doctor{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Access Gateway
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Authorized portal for medical doctors and clinical specialists to evaluate AI disease risk predictions and sign clinical decisions.
          </p>
        </div>

        {/* Newly Registered Success Card */}
        {newlyRegistered ? (
          <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 max-w-xl mx-auto text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Clinician Registration Successful
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Welcome, {newlyRegistered.name}!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your medical clinician profile has been registered in the CDSS directory:
              </p>
            </div>

            {/* Generated Identifiers Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                  Clinician NPI / License Identifier
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-lg font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                    {newlyRegistered.patient_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => newlyRegistered.patient_id && copyPatientId(newlyRegistered.patient_id)}
                    className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                  Clinical Registry ID
                </span>
                <span className="text-lg font-mono font-extrabold text-teal-700 dark:text-teal-400 block">
                  {newlyRegistered.record_number}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Enter Doctor CDSS Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : isAuthenticated && user ? (
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 max-w-xl mx-auto animate-fade-in">
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  {t("nav.activeAccount", "Active User Session")}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user.full_name || user.role}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Role: {user.role}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              {user.patient_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans font-semibold">Clinician ID:</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{user.patient_id}</span>
                </div>
              )}
              {user.record_number && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans font-semibold">Record Number:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{user.record_number}</span>
                </div>
              )}
              {user.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Email:</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
              )}
              {user.phone_number && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Phone Number:</span>
                  <span className="font-semibold">{user.phone_number}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t("landing.getStarted", "Launch Workspace")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="py-3 px-5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                {t("nav.logout", "Sign Out")}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 max-w-xl mx-auto animate-fade-in">
            {/* Tabs Header */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveAuthTab("login");
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeAuthTab === "login"
                    ? "bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Doctor Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAuthTab("signup");
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeAuthTab === "signup"
                    ? "bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Clinician Registration</span>
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Authentication Notice</p>
                  <p>{authError}</p>
                </div>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {activeAuthTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Doctor Phone Number or Email</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9345693386 or admin@trustmed.ai"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter clinician password (e.g. 250825)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Clinician Credentials...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Doctor CDSS Portal</span>
                    </>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">
                      Quick Clinician Access
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>1-Click Demo Login (Dr. Sarah Mitchell, MD • NPI: 1487290145)</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SIGNUP */}
            {activeAuthTab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Doctor First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah"
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Doctor Last Name & Degree <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mitchell, MD"
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Hospital Email <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.org"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Phone Number <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9345693386"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Password <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Create secure password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Hospital className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>NPI License Number</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1487290145"
                      value={signupNpi}
                      onChange={(e) => setSignupNpi(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Clinical Role / Specialization
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as PractitionerRole)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Chief Medical Officer">Chief Medical Officer</option>
                      <option value="Endocrinologist">Endocrinologist</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Attending Physician">Attending Physician</option>
                      <option value="Clinical Radiologist">Clinical Radiologist</option>
                      <option value="Clinical AI Auditor">Clinical AI Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Hospital Department / Medical Center</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TrustMed Endocrinology Center"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering Clinician Credentials...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Complete Clinician Registration</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
