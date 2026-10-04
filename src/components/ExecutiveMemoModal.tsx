import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Copy,
  Check,
  Crown,
  ArrowRight,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { ReasoningAnalysis } from '../types.js';
import { getSoundnessTier } from '../utils/graphUtils.js';

interface ExecutiveMemoModalProps {
  analysis: ReasoningAnalysis;
  isOpen: boolean;
  onClose: () => void;
  isVip: boolean;
  onOpenUpgrade: () => void;
}

export const ExecutiveMemoModal: React.FC<ExecutiveMemoModalProps> = ({
  analysis,
  isOpen,
  onClose,
  isVip,
  onOpenUpgrade,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const soundness = getSoundnessTier(analysis.soundnessScore);
  const assumptions = analysis.nodes.filter(n => n.type === 'assumption');
  const risks = analysis.nodes.filter(n => n.type === 'risk');
  const evidence = analysis.nodes.filter(n => n.type === 'evidence');
  const alternatives = analysis.nodes.filter(n => n.type === 'alternative');

  const handleCopy = () => {
    let text = `CONFIDENTIAL EXECUTIVE DECISION MEMORANDUM\n`;
    text += `DATE: ${new Date(analysis.createdAt).toLocaleDateString()}\n`;
    text += `SUBJECT: ${analysis.title}\n`;
    text += `CLASSIFICATION: RESTRICTED // BOARD AUDIT\n\n`;
    text += `1. STRATEGIC DECISION STATEMENT\n${analysis.decisionText}\n\n`;
    text += `2. EXECUTIVE DIAGNOSTIC\nSummary: ${analysis.summary}\nKey Takeaway: ${analysis.keyTakeaway}\n`;
    text += `Soundness Score: ${analysis.soundnessScore}/100 (${soundness.label})\n\n`;
    text += `3. KEY UNPROVEN ASSUMPTIONS (${assumptions.length})\n`;
    assumptions.forEach(a => {
      text += `- ${a.label} [Confidence: ${a.confidence}]: ${a.description}\n`;
    });
    text += `\n4. RISK MATRIX & HAZARDS (${risks.length})\n`;
    risks.forEach(r => {
      text += `- ${r.label} [Impact: ${r.impact}]: ${r.description}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Executive Decision Memorandum
                </h2>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                  VIP Feature
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Institutional 3-page briefing ready for board review & compliance signoff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIP Lock Banner */}
        {!isVip && (
          <div className="my-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Full export and print-ready memorandum available with the <strong>VIP Plan</strong>.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenUpgrade();
              }}
              className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <span>Unlock VIP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Printable Formal Document Preview */}
        <div className="flex-1 overflow-y-auto my-4 p-6 sm:p-8 rounded-xl bg-slate-50 border border-slate-200 font-serif text-slate-800 text-xs sm:text-sm leading-relaxed shadow-inner">
          {/* Memo Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-4">
              <span>Reasoning Graph Governance Advisory</span>
              <span className="font-bold text-rose-700">RESTRICTED // BOARD EYES ONLY</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700">
              <div><strong className="text-slate-900">TO:</strong> Investment Committee & Executive Board</div>
              <div><strong className="text-slate-900">DATE:</strong> {new Date(analysis.createdAt).toLocaleDateString()}</div>
              <div><strong className="text-slate-900">FROM:</strong> Strategic Epistemology Engine</div>
              <div><strong className="text-slate-900">CLASSIFICATION:</strong> Decision Audit # {analysis.id.substring(0, 10)}</div>
            </div>

            <div className="mt-3 text-sm font-bold font-sans text-slate-900">
              SUBJECT: STRATEGIC REASONING AUDIT ON "{analysis.title.toUpperCase()}"
            </div>
          </div>

          {/* Section 1 */}
          <div className="mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              1. The Core Decision Statement & Conditions
            </h3>
            <p className="text-xs text-slate-700 mb-2 leading-relaxed">
              {analysis.decisionText}
            </p>
            {analysis.context && (
              <p className="text-xs text-slate-600 italic mb-1">
                <strong>Contextual Parameters:</strong> {analysis.context}
              </p>
            )}
            {analysis.constraints && (
              <p className="text-xs text-slate-600 italic">
                <strong>Hard Constraints:</strong> {analysis.constraints}
              </p>
            )}
          </div>

          {/* Section 2 */}
          <div className="mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              2. Epistemological Diagnostic & Soundness Index
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-mono text-xs font-bold text-slate-900">
                Soundness: {analysis.soundnessScore} / 100 ({soundness.label})
              </div>
              <div className="text-xs text-slate-600">
                Evidence: {analysis.breakdown.evidenceScore}% • Assumption Risk: {analysis.breakdown.assumptionFragility}%
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-2">
              <strong>Summary:</strong> {analysis.summary}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Key Finding:</strong> {analysis.keyTakeaway}
            </p>
          </div>

          {/* Section 3: Risk Matrix */}
          <div className="mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              3. Hazard & Failure Point Inventory
            </h3>
            <div className="space-y-2">
              {risks.map(r => (
                <div key={r.id} className="p-2.5 rounded bg-white border border-slate-200 text-xs">
                  <div className="font-bold text-rose-700 flex items-center justify-between">
                    <span>{r.label}</span>
                    <span className="uppercase text-[9px] font-mono bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      {r.impact} IMPACT
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{r.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Sign-off */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-[11px] font-mono text-slate-600">
            <div>
              <div className="mb-6">EXECUTIVE SPONSOR SIGN-OFF:</div>
              <div className="border-b border-slate-400 w-48 mb-1" />
              <div>Name & Title</div>
            </div>
            <div>
              <div className="mb-6">INDEPENDENT RISK REVIEWER:</div>
              <div className="border-b border-slate-400 w-48 mb-1" />
              <div>Date & Signature</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
