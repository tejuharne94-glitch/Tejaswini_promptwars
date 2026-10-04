import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Database,
  Split,
  Compass,
  CheckCircle2,
  Brain,
  Scale,
  Target,
  Swords,
  ChevronRight,
  Layers,
  FileText,
  Search,
} from 'lucide-react';
import { NODE_CONFIGS, getSoundnessTier } from '../utils/graphUtils.js';
import { ReasoningAnalysis } from '../types.js';

interface LandingPageProps {
  onStartAnalysis: (presetText?: string) => void;
  onExploreDemo: (demoId: string) => void;
  demoAnalyses: ReasoningAnalysis[];
  onOpenVipUpgrade?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExploreDemo,
  demoAnalyses,
  onOpenVipUpgrade,
}) => {
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [quickInput, setQuickInput] = useState('');

  const currentAnalysis = demoAnalyses[activeDemoIndex] || demoAnalyses[0];
  const soundness = currentAnalysis ? getSoundnessTier(currentAnalysis.soundnessScore) : null;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onStartAnalysis(quickInput.trim());
    } else {
      onStartAnalysis();
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 flex flex-col">
      {/* 2. HERO SECTION — Problem & Solution + Above the Fold Primary Action */}
      <section className="pt-12 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Visual Epistemology & Decision Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
          Make Your Thinking <span className="text-indigo-600">Visible.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Turn decisions, assumptions, evidence, risks, and alternatives into a clear visual reasoning graph. Expose hidden assumptions before committing.
        </p>

        {/* Above-the-fold Quick Decision Input Bar */}
        <form onSubmit={handleQuickSubmit} className="max-w-2xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-300 shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <input
              type="text"
              placeholder="e.g. Should I quit my VP job to bootstrap an AI workflow platform?"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Analyze Reasoning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Sample dilemmas:</span>
          <button
            type="button"
            onClick={() => onStartAnalysis('Should our engineering team decompose our Rails monolith into microservices before Q4?')}
            className="hover:text-indigo-600 underline"
          >
            Microservices migration
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onStartAnalysis('Should we buy an $850k home or continue renting and investing in index funds?')}
            className="hover:text-indigo-600 underline"
          >
            Buy vs Rent
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onStartAnalysis('Should I bootstrap or raise institutional venture capital?')}
            className="hover:text-indigo-600 underline"
          >
            Bootstrap vs VC
          </button>
        </div>
      </section>

      {/* 3 & 4. MAIN DASHBOARD / INTERACTIVE REASONING VISUALIZATION CENTERPIECE */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Controls */}
          <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  Interactive Showcase
                </span>
                <span className="text-xs text-slate-500">
                  {currentAnalysis?.category || 'Strategic Dilemma'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {currentAnalysis?.title || 'Decision Rationale Graph'}
              </h2>
            </div>

            {/* Presets Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {demoAnalyses.map((demo, idx) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemoIndex(idx)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeDemoIndex === idx
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Case {idx + 1}: {demo.category?.split(' ')[0] || 'Example'}
                </button>
              ))}

              <button
                onClick={() => onExploreDemo(currentAnalysis.id)}
                className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                Open Studio <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Graph Canvas Representation */}
          <div className="p-4 sm:p-6 bg-graph-grid min-h-[380px] flex flex-col justify-between overflow-x-auto">
            {/* Tier 1: Core Claim */}
            <div className="flex justify-center mb-6">
              {currentAnalysis?.nodes.find(n => n.type === 'claim') && (
                <div
                  onClick={() => onExploreDemo(currentAnalysis.id)}
                  className="cursor-pointer max-w-md w-full rounded-lg p-3.5 bg-white border border-slate-300 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all text-left"
                  style={{ borderLeftWidth: '4px', borderLeftColor: '#4f46e5' }}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                      DECISION / CLAIM
                    </span>
                    <span className="text-[10px] font-bold uppercase text-rose-600">Critical Impact</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    {currentAnalysis.nodes.find(n => n.type === 'claim')?.label}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {currentAnalysis.nodes.find(n => n.type === 'claim')?.description}
                  </div>
                </div>
              )}
            </div>

            {/* Connecting guide labels */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-4 mb-4">
              <span>Supporting Premises (Reasons & Evidence)</span>
              <span>Vulnerabilities (Assumptions & Risks)</span>
            </div>

            {/* Tier 2: Supporting vs Vulnerability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {currentAnalysis?.nodes.filter(n => n.type !== 'claim').slice(0, 4).map(node => {
                const config = NODE_CONFIGS[node.type] || NODE_CONFIGS.reason;
                return (
                  <div
                    key={node.id}
                    onClick={() => onExploreDemo(currentAnalysis.id)}
                    className="cursor-pointer rounded-lg p-3 bg-white border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-sm transition-all"
                    style={{ borderLeftWidth: '4px', borderLeftColor: config.accentHex }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${config.badgeBg} ${config.badgeText}`}>
                        {config.badgeLabel}
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium capitalize">
                        {node.confidence}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{node.label}</div>
                    <div className="text-[11px] text-slate-600 line-clamp-2 mt-1">{node.description}</div>
                  </div>
                );
              })}
            </div>

            {/* Bottom info bar */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Detected {currentAnalysis?.detectedBiases?.length || 0} Cognitive Biases & {currentAnalysis?.nodes.filter(n => n.type === 'risk').length || 0} Critical Failure Risks
              </span>

              <button
                onClick={() => onExploreDemo(currentAnalysis.id)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                Inspect Full Interactive Canvas ({currentAnalysis?.nodes.length} Nodes) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KEY INFORMATION & DIAGNOSTIC RESULTS SECTION */}
      {currentAnalysis && soundness && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scorecard */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Reasoning Soundness Index
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold text-slate-900">{currentAnalysis.soundnessScore}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                  <span
                    className="ml-auto px-2.5 py-0.5 rounded text-xs font-bold uppercase"
                    style={{ backgroundColor: `${soundness.hex}15`, color: soundness.hex }}
                  >
                    {soundness.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {soundness.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Evidence Grounding</span>
                  <span className="font-mono font-bold text-slate-800">{currentAnalysis.breakdown.evidenceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assumption Fragility</span>
                  <span className="font-mono font-bold text-slate-800">{currentAnalysis.breakdown.assumptionFragility}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Exposure</span>
                  <span className="font-mono font-bold text-slate-800">{currentAnalysis.breakdown.riskExposure}%</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Takeaway */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  Primary Analytical Finding
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 mb-2">
                  Structural Diagnosis
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {currentAnalysis.summary}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                <strong className="block text-indigo-950 mb-0.5">High-Leverage Recommendation:</strong>
                {currentAnalysis.keyTakeaway}
              </div>
            </div>

            {/* Detected Biases */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                  Cognitive Bias Audit
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 mb-2">
                  Heuristic Blind Spots
                </h3>
                <div className="space-y-2.5 my-3">
                  {currentAnalysis.detectedBiases?.slice(0, 2).map((bias, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{bias.biasName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{bias.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Calculated across {currentAnalysis.nodes.length} epistemological nodes.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. SUPPORTING FEATURES — The 10 Reasoning Primitives */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 mb-2">
            System Taxonomy
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            The 10 Reasoning Dimensions
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            The system deconstructs thoughts into standard epistemological components:
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(NODE_CONFIGS).map(([k, cfg]) => (
            <div
              key={k}
              className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-xs text-left"
              style={{ borderLeftWidth: '3px', borderLeftColor: cfg.accentHex }}
            >
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.badgeLabel}
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1.5 mb-1">{cfg.label}</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">{cfg.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 6.5. VIP & INSTITUTIONAL PLAN SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Institutional Rigor
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Choose Your Level of Reasoning Depth
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            From individual strategic clarity to institutional-grade risk modeling and executive audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Community Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Community Plan
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  Standard
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-slate-900">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                Essential reasoning graph deconstruction for founders, students, and independent thinkers.
              </p>

              <div className="space-y-3 text-xs text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive visual graph canvas & pan/zoom</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>10 reasoning dimension node taxonomy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Soundness Score diagnostic & fragility meter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard search by title & date in History</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Single analysis Markdown & JSON exports</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartAnalysis()}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* VIP Institutional Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-amber-400 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-lg">
              Most Advanced
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  VIP Institutional
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Pro Tier
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-slate-900">$19</span>
                <span className="text-xs text-slate-500">/ month (billed annually)</span>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                Advanced sensitivity modeling, board memorandums, and adversarial war gaming for executives.
              </p>

              <div className="space-y-3 text-xs text-slate-700 mb-6 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Side-by-Side Graph Comparator:</strong> Head-to-head decision evaluations
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>1,000-Trial Monte Carlo:</strong> Statistical assumption failure simulator
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Executive Decision Memo:</strong> 3-page board-ready brief & risk matrix
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Multi-Agent Red Teaming:</strong> Skeptical VC, CRO & Competitor personas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Batch Archive Export:</strong> Full decision vault dossier backup
                  </span>
                </div>
              </div>
            </div>

            {onOpenVipUpgrade ? (
              <button
                onClick={onOpenVipUpgrade}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activate VIP Plan Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onStartAnalysis()}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors"
              >
                Explore Pro Features
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. CLEAR CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Ready to Deconstruct Your Next Decision?
          </h3>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
            Stop relying on unverified assumptions. Map out your reasoning, expose hidden failure modes, and stress-test alternatives in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onStartAnalysis()}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Analyze Your Reasoning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExploreDemo('ana_startup_pivot')}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              Explore Example Case Study
            </button>
          </div>
        </div>
      </section>

      {/* 8. SIMPLE FOOTER */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Reasoning Graph</span>
            <span>—</span>
            <span>Make Your Thinking Visible.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Role-Based Access Control</span>
            <span>•</span>
            <span>Adversarial Testing</span>
            <span>•</span>
            <span>Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
