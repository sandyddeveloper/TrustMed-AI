"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Sun,
  Moon,
  UserCheck,
  LogIn,
  Globe,
  Check,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/85 border-b border-emerald-100/80 dark:border-slate-800/80 px-3 sm:px-6 2xl:px-8 py-2.5 sm:py-3.5 2xl:py-5 transition-colors shadow-sm">
      <div className="max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {t("nav.brand", "TrustMed-AI")}
            </span>
            <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 whitespace-nowrap">
              AI + Web3
            </span>
          </div>
        </Link>

        {/* Action Items: Language Selector, Theme Toggle & Login CTA */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Multi-Language Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 whitespace-nowrap shrink-0"
              title={t("common.language", "Language")}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                {language === "en" ? "EN" : language === "ta" ? "தமிழ்" : "हिन्दी"}
              </span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fade-in text-xs">
                <button
                  onClick={() => handleLanguageSelect("en")}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer ${
                    language === "en"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>English</span>
                  {language === "en" && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleLanguageSelect("ta")}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer ${
                    language === "ta"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>தமிழ் (Tamil)</span>
                  {language === "ta" && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleLanguageSelect("hi")}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer ${
                    language === "hi"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>हिन्दी (Hindi)</span>
                  {language === "hi" && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-800 transition-all shadow-sm cursor-pointer shrink-0"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />}
          </button>

          {/* Auth / Login Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 shrink-0">
              <span className="hidden lg:inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold whitespace-nowrap">
                NPI: {user.npi_number || "1487290145"}
              </span>
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>{t("auth.signIn", "Login")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
