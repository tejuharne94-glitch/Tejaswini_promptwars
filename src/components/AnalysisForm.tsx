import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  HelpCircle,
  Clock,
  DollarSign,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ReasoningAnalysis } from '../types.js';

interface AnalysisFormProps {
  onAnalysisGenerated: (analysis: ReasoningAnalysis) => void;
  onCancel?: () => void;
  initialDecisionText?: string;
}

const TEMPLATES = [
  {
    title: 'Quit Job for Startup',
    decision: 'Should I resign from my VP of Product role at a Series B tech company to self-fund and bootstrap an AI agent workflow SaaS?',
    context: 'I have 18 months personal runway ($140k cash). Current base salary is $210k. 8 years domain knowledge in legal tech.',
    constraints: 'Must break even in 14 months without raising institutional venture capital.',
  },
  {
    title: 'Monolith to Microservices',
    decision: 'Should our 25-person engineering team rewrite and decompose our Ruby on Rails monolith into Go/gRPC microservices before Q4?',
    context: 'Deployments take 35 minutes and tests are flaking. 4 product squads.',
    constraints: 'Zero downtime allowed. Q4 accounts for 60% of annual revenue.',
  },
  {
    title: 'Buy Home vs Rent & Invest',
    decision: 'Should we purchase an $850,000 suburban home with 20% down or continue renting for $3,200/mo and dollar-cost average the down payment into S&P 500 index funds?',
    context: 'Combined household income $240,000. Plan to stay in the city for at least 6 years. Interest rates at 6.8%.',
    constraints: 'Preserve at least 6 months emergency liquidity after transaction fees.',
  },
  {
    title: 'Exclusive B2B Distribution Deal',
    decision: 'Should our early-stage software company grant exclusive North American enterprise distribution rights to a legacy conglomerate for a guaranteed $1.5M minimum annual royalty?',
    context: 'Our direct sales team currently produces $400k ARR. Partner has 10,000 enterprise accounts but slow sales reps.',
    constraints: 'Contract lock-in is 3 years with restrictive non-compete clauses.',
  }
];

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onAnalysisGenerated,
  onCancel,
  initialDecisionText = '',
}) => {
  const [decisionText, setDecisionText] = useState(initialDecisionText);
  const [context, setContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    'Deconstructing Core Claim & Rationale',
    'Extracting Empirical Evidence vs Untested Assumptions',
    'Auditing Structural Risks & Logical Contradictions',
    'Synthesizing Alternatives & Second-Order Consequences',
    'Calculating Soundness Diagnostic Index',
  ];

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setDecisionText(tmpl.decision);
    setContext(tmpl.context);
    setConstraints(tmpl.constraints);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionText.trim() || decisionText.trim().length < 5) {
      setError('Please enter a substantive decision, claim, or dilemma to analyze.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const analysis = await api.generateAnalysis({
        decisionText: decisionText.trim(),
        context: context.trim() || undefined,
        constraints: constraints.trim() || undefined,
      });

      clearInterval(interval);
      onAnalysisGenerated(analysis);
    } catch (err: any) {
      clearInterval(interval);
      setIsSubmitting(false);
      setError(err?.message || 'Failed to generate reasoning analysis. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>New Reasoning Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          What Decision or Dilemma Do You Want to Inspect?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          We do not decide for you. We make your assumptions, risks, and blind spots visible.
        </p>
      </div>

      {/* Preset Dilemma Cards */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Preset Dilemmas (Click to Load)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TEMPLATES.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(t)}
              className="p-3 text-left rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors shadow-xs group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 truncate">
                {t.title}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {t.decision}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative">
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitting ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Constructing Reasoning Graph
            </h3>
            <p className="text-xs text-slate-500 max-w-md mb-6">
              Deconstructing epistemology nodes and establishing directed relationship edges.
            </p>

            <div className="w-full max-w-md space-y-2 text-left">
              {steps.map((s, idx) => {
                const isDone = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors text-xs ${
                      isCurrent
                        ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                        : isDone
                        ? 'text-emerald-700 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                1. The Core Decision, Claim, or Dilemma <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Should I leave my engineering job to build an open-source analytics platform full-time?"
                value={decisionText}
                onChange={e => setDecisionText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                State the question or thesis clearly. Avoid vague phrases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  2. Relevant Context & Conditions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 18 months savings runway, 5 potential pilot clients, spouse is supportive, current burn rate $4,000/mo."
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                  3. Hard Constraints (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cannot take venture capital dilution, must reach cash flow break-even within 12 months, zero debt."
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Generate Reasoning Graph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
