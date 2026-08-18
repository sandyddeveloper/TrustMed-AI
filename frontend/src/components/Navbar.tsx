"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Wallet,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Sun,
  Moon,
  UserCheck,
  Bot,
  Sliders,
  User,
  Users,
} from "lucide-react";
import { connectWallet, getWeb3Provider, hasEthereumWallet } from "@/lib/web3";
import { formatAddress } from "@/lib/utils";
import { fetchHealthCheck } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [backendHealth, setBackendHealth] = useState<"healthy" | "degraded" | "checking">("checking");

  useEffect(() => {
    fetchHealthCheck()
      .then((res) => setBackendHealth(res.status === "healthy" ? "healthy" : "degraded"))
      .catch(() => setBackendHealth("degraded"));

    getWeb3Provider().then(async (provider) => {
      if (provider) {
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const handleWalletConnectClick = async () => {
    if (walletAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!hasEthereumWallet()) {
      setIsModalOpen(true);
      return;
    }

    setIsConnecting(true);
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to connect Ethereum wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    if (isAuthenticated) {
      logout();
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/85 border-b border-emerald-100/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">TrustMed</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  AI + Web3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Explainable Clinical Decisions</p>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 text-xs font-semibold">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === "/"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className={`transition-colors ${
                pathname === "/dashboard"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              CDSS Modules
            </Link>

            <Link
              href="/cohort"
              className={`flex items-center gap-1 transition-colors ${
                pathname === "/cohort"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cohort Analyzer</span>
            </Link>

            <Link
              href="/ai-summary"
              className={`flex items-center gap-1 transition-colors ${
                pathname === "/ai-summary"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Summary</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-1 transition-colors ${
                pathname === "/profile"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              className={`flex items-center gap-1 transition-colors ${
                pathname === "/settings"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Action Items: Theme Toggle, Backend Health & Web3 Wallet */}
          <div className="flex items-center space-x-2.5">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-800 transition-all shadow-sm cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>

            {/* Backend Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-slate-900 border border-emerald-200/60 dark:border-slate-800 text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-slate-400" />
              {backendHealth === "healthy" ? (
                <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Ready
                </span>
              ) : (
                <span className="flex items-center text-rose-600 text-[11px]">
                  <AlertCircle className="w-3 h-3 mr-1" /> Offline
                </span>
              )}
            </div>

            {/* Web3 Practitioner Auth */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/80 hover:bg-emerald-200/70 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-semibold shadow-sm transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="truncate max-w-[100px]">{user.role.split(" ")[0]}</span>
              </Link>
            ) : walletAddress ? (
              <button
                onClick={handleWalletConnectClick}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-xs font-medium shadow-sm transition-all cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{formatAddress(walletAddress)}</span>
              </button>
            ) : (
              <Link
                href="/auth"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{walletAddress ? "Active Wallet Session" : "Connect Web3 Wallet"}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {walletAddress
                  ? "Connected to real EVM provider. Records anchored will be signed by your address."
                  : "Connect your MetaMask or EIP-1193 Web3 browser wallet extension to sign and anchor clinical diagnostic proofs."}
              </p>
            </div>

            {walletAddress ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                  <span className="text-slate-500 block mb-1 font-sans">Connected Address:</span>
                  {walletAddress}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">Install MetaMask</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">MetaMask browser extension not detected</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
