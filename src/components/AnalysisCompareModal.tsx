import React, { useState } from 'react';
import {
  X,
  Scale,
  Crown,
  Check,
  AlertTriangle,
  FileText,
  Copy,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ReasoningAnalysis } from '../types.js';
import { getSoundnessTier } from '../utils/graphUtils.js';

interface AnalysisCompareModalProps {
  analysisA: ReasoningAnalysis | null;
  analysisB: ReasoningAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  isVip: boolean;
  onOpenUpgrade: () => void;
}

export const AnalysisCompareModal: React.FC<AnalysisCompareModalProps> = ({
  analysisA,
  analysisB,
  isOpen,
  onClose,
  isVip,
  onOpenUpgrade,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assumptions' | 'risks' | 'summary'>('overview');

  if (!isOpen || !analysisA || !analysisB) return null;

  const tierA = getSoundnessTier(analysisA.soundnessScore);
  const tierB = getSoundnessTier(analysisB.soundnessScore);

  const assumptionsA = analysisA.nodes.filter(n => n.type === 'assumption');
  const assumptionsB = analysisB.nodes.filter(n => n.type === 'assumption');

  const evidenceA = analysisA.nodes.filter(n => n.type === 'evidence');
  const evidenceB = analysisB.nodes.filter(n => n.type === 'evidence');

  const risksA = analysisA.nodes.filter(n => n.type === 'risk');
  const risksB = analysisB.nodes.filter(n => n.type === 'risk');

  const scoreDiff = analysisA.soundnessScore - analysisB.soundnessScore;

  const handleCopyComparison = () => {
    let text = `# REASONING GRAPH: COMPARATIVE DECISION INTELLIGENCE REPORT\n`;
    text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    text += `## OPTION A: ${analysisA.title}\n`;
    text += `- Soundness Score: ${analysisA.soundnessScore}/100 (${tierA.label})\n`;
    text += `- Decision: ${analysisA.decisionText}\n`;
    text += `- Evidence nodes: ${evidenceA.length} | Assumptions: ${assumptionsA.length} | Risks: ${risksA.length}\n`;
    text += `- Key Takeaway: ${analysisA.keyTakeaway}\n\n`;

    text += `## OPTION B: ${analysisB.title}\n`;
    text += `- Soundness Score: ${analysisB.soundnessScore}/100 (${tierB.label})\n`;
    text += `- Decision: ${analysisB.decisionText}\n`;
    text += `- Evidence nodes: ${evidenceB.length} | Assumptions: ${assumptionsB.length} | Risks: ${risksB.length}\n`;
    text += `- Key Takeaway: ${analysisB.keyTakeaway}\n\n`;

    text += `## COMPARATIVE EVALUATION\n`;
    if (scoreDiff > 0) {
      text += `- Option A has a +${scoreDiff} point soundness advantage.\n`;
    } else if (scoreDiff < 0) {
      text += `- Option B has a +${Math.abs(scoreDiff)} point soundness advantage.\n`;
    } else {
      text += `- Both options possess identical empirical soundness scores (${analysisA.soundnessScore}/100).\n`;
    }
    text += `- Evidence Ratio: Option A (${evidenceA.length}) vs Option B (${evidenceB.length})\n`;
    text += `- Assumption Exposure: Option A (${assumptionsA.length}) vs Option B (${assumptionsB.length})\n`;
    text += `- Risk Factors: Option A (${risksA.length}) vs Option B (${risksB.length})\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Side-by-Side Analysis Comparator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                  VIP Feature
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Compare cognitive fragility, evidence depth, and risk differentials between two decisions
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

        {/* VIP Access Gate Check */}
        {!isVip ? (
          <div className="p-6 sm:p-8 overflow-y-auto text-center">
            {/* Teaser Preview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Analysis A</span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{analysisA.title}</h4>
                <div className="text-lg font-extrabold text-indigo-600 mt-2">
                  {analysisA.soundnessScore}/100{' '}
                  <span className="text-xs font-medium text-slate-500">({tierA.label})</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Analysis B</span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{analysisB.title}</h4>
                <div className="text-lg font-extrabold text-indigo-600 mt-2">
                  {analysisB.soundnessScore}/100{' '}
                  <span className="text-xs font-medium text-slate-500">({tierB.label})</span>
                </div>
              </div>
            </div>

            {/* VIP Gate Callout */}
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 max-w-lg mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto mb-3 shadow-xs">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Unlock Comparative Decision Intelligence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Head-to-head analysis comparison is an exclusive feature of the <strong>Reasoning Graph VIP Plan</strong>. Compare evidence ratios, unproven assumptions, risk metrics, and generate board-ready comparative briefs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onOpenUpgrade}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Get VIP Plan ($19/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VIP Unlocked Comparative Experience */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Head-to-Head Titles Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Analysis A
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono"
                    style={{ backgroundColor: `${tierA.hex}15`, color: tierA.hex }}
                  >
                    {analysisA.soundnessScore}/100 • {tierA.label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{analysisA.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {analysisA.decisionText}
                </p>
              </div>

              {/* Option B */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Analysis B
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono"
                    style={{ backgroundColor: `${tierB.hex}15`, color: tierB.hex }}
                  >
                    {analysisB.soundnessScore}/100 • {tierB.label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{analysisB.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {analysisB.decisionText}
                </p>
              </div>
            </div>

            {/* Differential Highlight Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-700">
                  {scoreDiff > 0 ? (
                    <>
                      <strong>Option A</strong> leads in empirical soundness by{' '}
                      <span className="text-indigo-600 font-bold">+{scoreDiff} points</span>.
                    </>
                  ) : scoreDiff < 0 ? (
                    <>
                      <strong>Option B</strong> leads in empirical soundness by{' '}
                      <span className="text-emerald-600 font-bold">+{Math.abs(scoreDiff)} points</span>.
                    </>
                  ) : (
                    <>Both options have identical soundness scores.</>
                  )}
                </span>
              </div>

              <button
                onClick={handleCopyComparison}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shrink-0 shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Brief!' : 'Copy Comparative Brief'}</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Pillars & Node Metrics
              </button>
              <button
                onClick={() => setActiveTab('assumptions')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'assumptions'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Assumptions vs Evidence
              </button>
              <button
                onClick={() => setActiveTab('risks')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'risks'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Risks & Vulnerabilities
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'summary'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Takeaways & Verdict
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total Nodes</span>
                    <div className="flex items-center justify-center gap-3 font-mono font-bold text-sm">
                      <span className="text-indigo-600">{analysisA.nodes.length}</span>
                      <span className="text-slate-300">vs</span>
                      <span className="text-emerald-600">{analysisB.nodes.length}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Evidence Depth</span>
                    <div className="flex items-center justify-center gap-3 font-mono font-bold text-sm">
                      <span className="text-indigo-600">{evidenceA.length}</span>
                      <span className="text-slate-300">vs</span>
                      <span className="text-emerald-600">{evidenceB.length}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assumption Load</span>
                    <div className="flex items-center justify-center gap-3 font-mono font-bold text-sm">
                      <span className="text-indigo-600">{assumptionsA.length}</span>
                      <span className="text-slate-300">vs</span>
                      <span className="text-emerald-600">{assumptionsB.length}</span>
                    </div>
                  </div>
                </div>

                {/* Soundness Score Bar Visual */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{analysisA.title}</span>
                      <span className="font-mono text-indigo-600">{analysisA.soundnessScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${analysisA.soundnessScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{analysisB.title}</span>
                      <span className="font-mono text-emerald-600">{analysisB.soundnessScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${analysisB.soundnessScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Assumptions vs Evidence */}
            {activeTab === 'assumptions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* A */}
                <div className="space-y-3">
                  <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <span>Option A Assumptions ({assumptionsA.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {assumptionsA.map(a => (
                      <div key={a.id} className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                        <div className="font-semibold text-slate-900">{a.label}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{a.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B */}
                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>Option B Assumptions ({assumptionsB.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {assumptionsB.map(b => (
                      <div key={b.id} className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                        <div className="font-semibold text-slate-900">{b.label}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{b.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Risks */}
            {activeTab === 'risks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* A */}
                <div className="space-y-3">
                  <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span>Option A Hazards ({risksA.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {risksA.map(r => (
                      <div key={r.id} className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50">
                        <div className="font-semibold text-slate-900">{r.label}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{r.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B */}
                <div className="space-y-3">
                  <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span>Option B Hazards ({risksB.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {risksB.map(r => (
                      <div key={r.id} className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50">
                        <div className="font-semibold text-slate-900">{r.label}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{r.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Summary & Verdict */}
            {activeTab === 'summary' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Strategic Takeaways Comparison</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="font-bold text-indigo-700 mb-1">Option A Conclusion:</div>
                      <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {analysisA.keyTakeaway}
                      </p>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-700 mb-1">Option B Conclusion:</div>
                      <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {analysisB.keyTakeaway}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Comparing <strong className="text-slate-800">{analysisA.title}</strong> and{' '}
            <strong className="text-slate-800">{analysisB.title}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close Comparator
          </button>
        </div>
      </div>
    </div>
  );
};
