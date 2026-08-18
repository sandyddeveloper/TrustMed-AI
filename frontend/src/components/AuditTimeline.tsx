"use client";

import React, { useState } from "react";
import { Shield, ExternalLink, Check, Copy, Database, Blocks, Inbox } from "lucide-react";
import { AnchorRecordResponse } from "@/lib/api";

interface AuditTimelineProps {
  anchors: AnchorRecordResponse[];
}

export default function AuditTimeline({ anchors }: AuditTimelineProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-emerald-900/5 dark:shadow-none space-y-6 transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Blocks className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Immutable Blockchain Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time ledger of cryptographically signed records anchored into the smart contract with verifiable IPFS snapshots.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/20 font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>{anchors.length} Anchored Records</span>
        </div>
      </div>

      {anchors.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No On-Chain Records Anchored Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Run a clinical diagnosis or X-ray Grad-CAM analysis above and click &quot;Anchor to Blockchain&quot; to commit the first proof to the ledger.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {anchors.map((item, idx) => (
            <div
              key={`${item.record_id}-${idx}`}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
            >
              {/* Left: Record Meta */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{item.record_id}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    {item.status}
                  </span>
                  {item.block_number && (
                    <span className="text-xs text-slate-500 font-mono">Block #{item.block_number}</span>
                  )}
                </div>

                {/* Hashes */}
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 dark:text-slate-500">Record Hash:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{item.record_hash}</span>
                    <button
                      onClick={() => handleCopy(item.record_hash, `hash-${idx}`)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {copiedIndex === `hash-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {item.tx_hash && (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 dark:text-slate-500">Tx Hash:</span>
                      <span className="text-emerald-700 dark:text-emerald-400/80 truncate max-w-xs">{item.tx_hash}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: IPFS Snapshot */}
              {item.ipfs_cid && (
                <div className="flex items-center space-x-3 text-xs bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">Encrypted Payload</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{item.ipfs_cid}</span>
                  </div>
                  <a
                    href={`https://ipfs.io/ipfs/${item.ipfs_cid.replace("ipfs://", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
