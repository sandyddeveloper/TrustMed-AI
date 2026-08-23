"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Activity,
  BrainCircuit,
  Lock,
  Users,
  Bot,
  UserCheck,
  Sliders,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Sparkles,
  Database,
  Search,
  FileText,
  Globe,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function DashboardLayout({
  children,
  activeSection = "vitals",
  onSectionChange,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleNavClick = (sectionId: string, route?: string) => {
    if (route && pathname !== route) {
      router.push(route);
    } else if (onSectionChange) {
      onSectionChange(sectionId);
    }
    setSidebarOpen(false);
  };

  const navItems = [
    {
      id: "input",
      label: "Clinical Diagnosis (CDSS)",
      icon: Stethoscope,
      route: "/dashboard",
      badge: "Active",
    },
    {
      id: "history",
      label: "Patient Assessment History",
      icon: Database,
      route: "/dashboard",
      badge: "Records",
    },
    {
      id: "profile",
      label: "Doctor Credentials & NPI",
      icon: UserCheck,
      route: "/profile",
      badge: "MD",
    },
  ];

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ========================================================================= */}
      {/* 1. RESPONSIVE SIDEBAR NAVIGATION (Mobile Drawer + Collapsible Desktop)    */}
      {/* ========================================================================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-emerald-100 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed
            ? "w-20"
            : "w-72 2xl:w-80 3xl:w-96 4xl:w-[420px]"
        }`}
      >
        {/* Sidebar Header / Brand Logo */}
        <div className="p-4 sm:p-5 2xl:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group min-w-0">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl 2xl:rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Stethoscope className="w-5 h-5 2xl:w-6 2xl:h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="truncate animate-fade-in">
                <span className="text-base 2xl:text-lg 3xl:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                  {t("nav.brand", "TrustMed-AI")}
                </span>
                <span className="block text-[10px] 2xl:text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider truncate">
                  {t("nav.brandSubtitle", "Clinical Decision Support")}
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer touch-manipulation"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 2xl:p-4 space-y-1.5 custom-scrollbar">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor CDSS Workspace</span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isRouteActive = item.route && pathname === item.route;
            const isSectionActive =
              (!item.route || pathname === item.route) && activeSection === item.id;
            const isActive = isRouteActive && isSectionActive;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.route)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
                } py-2.5 2xl:py-3.5 rounded-2xl text-xs 2xl:text-sm font-semibold transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 2xl:w-5 2xl:h-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] 2xl:text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-tight uppercase shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: User Card & Collapse Toggle */}
        <div className="p-3 2xl:p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {isAuthenticated && user ? (
            <div className={`p-2.5 2xl:p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 transition-all ${
              isCollapsed ? "flex flex-col items-center space-y-2" : "space-y-2"
            }`}>
              <div className="flex items-center justify-between w-full min-w-0">
                <div className={`flex items-center space-x-2.5 min-w-0 ${isCollapsed ? "justify-center" : ""}`}>
                  <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs 2xl:text-sm shrink-0 shadow-sm uppercase">
                    {(user.full_name || user.role || "D").charAt(0)}
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0 truncate">
                      <p className="text-xs 2xl:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.full_name || (user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user.email ? user.email.split("@")[0] : "Clinician"))}
                      </p>
                      <p className="text-[10px] 2xl:text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                        {user.npi_number ? `NPI: ${user.npi_number}` : (user.role || "Attending Physician")}
                      </p>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <button
                    onClick={logout}
                    title={t("nav.logout", "Sign Out")}
                    className="p-1.5 2xl:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 2xl:w-5 2xl:h-5" />
                  </button>
                )}
              </div>
              {isCollapsed && (
                <button
                  onClick={logout}
                  title={t("nav.logout", "Sign Out")}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className={`w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs 2xl:text-sm flex items-center justify-center space-x-2 shadow-md transition-all ${
                isCollapsed ? "px-2" : ""
              }`}
            >
              <span>{isCollapsed ? "Login" : t("auth.signIn", "Sign In")}</span>
            </Link>
          )}

          {/* Desktop Sidebar Collapse / Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center space-x-2 py-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-xs font-mono cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-[11px] font-sans">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. TOPBAR & MAIN CONTENT WRAPPER                                         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 h-16 2xl:h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800/80 px-3 sm:px-6 2xl:px-8 flex items-center justify-between transition-colors shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer touch-manipulation shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Title & Status */}
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base 2xl:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {t("nav.vitals", "Patient Diagnostic Workspace")}
              </h2>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="hidden xs:inline">{t("nav.brand", "TrustMed-AI")}</span>
                <span className="hidden xs:inline">&bull;</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono truncate">
                  SecRE-XAI Certified
                </span>
              </div>
            </div>
          </div>

          {/* Topbar Right Quick Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 2xl:space-x-4 shrink-0">
            {/* Multi-Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs 2xl:text-sm font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm touch-manipulation"
                title={t("common.language", "Language")}
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {language === "en" ? "EN" : language === "ta" ? "தமிழ்" : "हिन्दी"}
                </span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fade-in text-xs">
                  <button
                    onClick={() => handleLanguageSelect("en")}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      language === "en"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>English</span>
                    {language === "en" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleLanguageSelect("ta")}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      language === "ta"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>தமிழ் (Tamil)</span>
                    {language === "ta" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleLanguageSelect("hi")}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      language === "hi"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === "hi" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Clinician NPI / Role Badge */}
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs 2xl:text-sm shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 font-sans">
                  NPI:
                </span>
                <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                  {user.npi_number || "1487290145"}
                </span>
              </div>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation border border-slate-200 dark:border-slate-700"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 2xl:w-5 2xl:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 2xl:w-5 2xl:h-5 text-slate-600" />
              )}
            </button>

            {/* User Profile Quick Link */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-100/80 hover:bg-emerald-200/70 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs 2xl:text-sm font-semibold shadow-sm transition-all touch-manipulation"
                title="View Profile"
              >
                <UserCheck className="w-4 h-4 2xl:w-5 2xl:h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="hidden lg:inline truncate max-w-[120px]">
                  {user.first_name || user.role}
                </span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs 2xl:text-sm shadow-md transition-all touch-manipulation"
              >
                {t("auth.signIn", "Sign In")}
              </Link>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. MAIN CONTENT CONTAINER (Mobile to 2K, 4K, 8K Fluid Responsive)         */}
        {/* ========================================================================= */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 2xl:p-10 3xl:p-12 4xl:p-16 max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[2240px] 4xl:max-w-[3000px] 5xl:max-w-[3800px] w-full mx-auto pb-24 lg:pb-10 transition-all">
          {children}
        </main>

        {/* ========================================================================= */}
        {/* 4. MOBILE BOTTOM QUICK NAVIGATION BAR (App-Like 1-Touch Switching)        */}
        {/* ========================================================================= */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-emerald-100 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isRouteActive = item.route && pathname === item.route;
            const isSectionActive =
              (!item.route || pathname === item.route) && activeSection === item.id;
            const isActive = isRouteActive && isSectionActive;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.route)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all touch-manipulation min-w-[54px] ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? "bg-emerald-100 dark:bg-emerald-500/20" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight truncate max-w-[62px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

