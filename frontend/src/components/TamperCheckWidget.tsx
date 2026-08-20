"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { verifyRecordIntegrity, VerifyRecordResponse } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  contractAddress?: string;
  initialRecordId?: string;
  initialRecordHash?: string;
}

export default function TamperCheckWidget({
  contractAddress = "",
  initialRecordId = "",
  initialRecordHash = "",
}: Props) {
  const { t } = useLanguage();
  const [recordId, setRecordId] = useState(initialRecordId);
  const [localHash, setLocalHash] = useState(initialRecordHash);
  const [verificationResult, setVerificationResult] = useState<VerifyRecordResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedOnChain, setCopiedOnChain] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordId.trim()) return;

    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await verifyRecordIntegrity({
        record_id: recordId.trim(),
        claimed_hash: localHash.trim() || undefined,
      });
      setVerificationResult(res);
    } catch (err: unknown) {
      const msg = (err as Error).message || "Verification failed to reach the server or blockchain.";
      setVerificationResult({
        record_id: recordId,
        is_authentic: false,
        local_hash: localHash || "N/A",
        blockchain_hash: undefined,
        verified_at: new Date().toISOString(),
        authenticity_badge: "TAMPER_DETECTED",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopiedOnChain(true);
    setTimeout(() => setCopiedOnChain(false), 2000);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 transition-colors">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t("tamper.title", "1-Click Cryptographic Tamper & Integrity Verification")}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t("tamper.subtitle", "Verify the mathematical authenticity of clinical diagnostic records against the Ethereum smart contract ledger.")}
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("profile.patientId", "Patient Record ID")} <span className="text-rose-500">*</span>
            </label>
            <input
              placeholder="e.g. PAT-1042"
              value={recordId}
              required
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Claimed SHA-256 Record Hash (Optional)
            </label>
            <input
              placeholder="e.g. 0x4a5b6c7d8e9f..."
              value={localHash}
              onChange={(e) => setLocalHash(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading || !recordId.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t("common.loading", "Querying Smart Contract Ledger & Verifying Record Integrity...")}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{t("tamper.verifyBtn", "Verify Record Authenticity on Blockchain")}</span>
            </>
          )}
        </button>
      </form>

      {/* Result Card & Verified Authenticity Badge */}
      {verificationResult !== null && (
        <div
          className={`p-6 rounded-2xl border transition-all animate-fade-in ${
            verificationResult.is_authentic
              ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200"
          }`}
        >
          <div className="flex items-start gap-4">
            {verificationResult.is_authentic ? (
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 shadow-sm">
                <ShieldAlert className="w-7 h-7" />
              </div>
            )}

            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {verificationResult.is_authentic
                      ? "Record Authenticity Verified: Zero Tampering Detected"
                      : "Warning: Cryptographic Record Mismatch"}
                  </h3>
                </div>

                {/* Verified Authenticity Badge */}
                <div className="inline-flex">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                      verificationResult.is_authentic
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                        : "bg-rose-600 text-white dark:bg-rose-500 dark:text-slate-950"
                    }`}
                  >
                    {verificationResult.is_authentic ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Authenticity Badge</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Tamper Detected</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs opacity-90 leading-relaxed">
                {verificationResult.message}
              </p>

              {/* Cryptographic Hashes Comparison Matrix */}
              <div className="mt-4 pt-4 border-t border-current/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-current/10 space-y-1">
                  <span className="text-[10px] font-sans opacity-60 uppercase font-bold block">
                    Local Record Hash:
                  </span>
                  <span className="truncate block font-semibold">
                    {verificationResult.local_hash}
                  </span>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-current/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-sans opacity-60 uppercase font-bold block">
                      Blockchain Anchored Hash:
                    </span>
                    {verificationResult.blockchain_hash && (
                      <button
                        onClick={() => copyText(verificationResult.blockchain_hash!)}
                        className="opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        {copiedOnChain ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <span className="truncate block font-semibold text-emerald-700 dark:text-emerald-400">
                    {verificationResult.blockchain_hash || "Unanchored / No match"}
                  </span>
                </div>
              </div>

              {/* Verification Metadata Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-75 font-sans">
                <span>Verified At: {new Date(verificationResult.verified_at).toLocaleString()}</span>
                {verificationResult.tx_hash && (
                  <span className="font-mono">Tx: {verificationResult.tx_hash.slice(0, 14)}...</span>
                )}
                <span>Smart Contract: TrustMedAudit.sol (EVM)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
