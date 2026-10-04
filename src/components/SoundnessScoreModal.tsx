import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, Scale, Lightbulb } from 'lucide-react';
import { ReasoningAnalysis } from '../types.js';
import { getSoundnessTier } from '../utils/graphUtils.js';

interface SoundnessScoreModalProps {
  analysis: ReasoningAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const SoundnessScoreModal: React.FC<SoundnessScoreModalProps> = ({
  analysis,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const tier = getSoundnessTier(analysis.soundnessScore);
  const { breakdown } = analysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Soundness Diagnostic Index</h2>
              <p className="text-xs text-slate-500">Algorithmic evaluation of reasoning strength & vulnerabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Score Card */}
        <div className="my-6 p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 bg-white shrink-0 shadow-xs"
            style={{ borderColor: tier.hex }}
          >
            <span className="text-2xl font-extrabold text-slate-900">{analysis.soundnessScore}</span>
            <span className="text-[9px] text-slate-400 absolute bottom-2">/ 100</span>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-600">Overall Rating:</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${tier.hex}15`, color: tier.hex, border: `1px solid ${tier.hex}30` }}
              >
                {tier.label}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {tier.description}
            </p>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="space-y-3.5 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnostic Pillars</h3>

          {/* Evidence Score */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Evidence Grounding
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {breakdown.evidenceScore} / 100
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.evidenceScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Proportion of rationale supported by observed data vs subjective assertions.
            </p>
          </div>

          {/* Assumption Fragility */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Assumption Fragility (Lower is Safer)
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {breakdown.assumptionFragility} / 100
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.assumptionFragility}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Degree of unproven premises that would cause chain failure if disproven.
            </p>
          </div>

          {/* Risk Exposure */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Risk & Hazard Exposure (Lower is Safer)
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {breakdown.riskExposure} / 100
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.riskExposure}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Severity of unhedged vulnerabilities, capital downside, or operational lockouts.
            </p>
          </div>

          {/* Logical Coherence */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                Logical Consistency
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {breakdown.coherenceScore} / 100
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.coherenceScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Internal consistency without unresolved conflicting timelines or competing targets.
            </p>
          </div>
        </div>

        {/* Diagnostic Takeaway Box */}
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3 mb-6">
          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-indigo-950 mb-0.5">Diagnostic Takeaway</div>
            <p className="text-xs text-indigo-900 leading-relaxed">{analysis.keyTakeaway}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
