import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Lightbulb, AlertCircle } from 'lucide-react';
import { ReasoningAnalysis } from '../types.js';
import { api } from '../services/api.js';

interface AnalysisFormProps {
  onAnalysisGenerated: (analysis: ReasoningAnalysis) => void;
}

const EXAMPLE_PRESETS = [
  {
    title: 'Startup Model Pivot',
    text: 'Should our early-stage startup pivot from a flat monthly B2B subscription to a pure usage-based pricing model?',
    context: 'Current MRR is $24k, churn is 4.5% monthly, and customers complain about entry tier cost.',
  },
  {
    title: 'Microservices Migration',
    text: 'Should our 8-person engineering team migrate our monolithic Rails backend to an event-driven Go microservices architecture?',
    context: 'Build times are 12 minutes, 2 outages occurred last quarter during database schema migrations.',
  },
  {
    title: 'Specialist vs Generalist Hiring',
    text: 'Should we hire one senior Staff Security Specialist or two mid-level Full-Stack Generalists for our Series A startup?',
    context: 'Enterprise sales prospects require SOC2 compliance by Q3, but our product feature backlog is 6 months behind.',
  },
  {
    title: 'Cloud vs Self-Hosted GPU Cluster',
    text: 'Should we build our own on-premise GPU server cluster for LLM fine-tuning or continue paying hourly AWS cloud instances?',
    context: 'Monthly AWS GPU bill is $14k. Upfront hardware purchase is $85k with 3-year depreciation.',
  },
];

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalysisGenerated }) => {
  const [decisionText, setDecisionText] = useState('');
  const [context, setContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionText.trim()) {
      setErrorMessage('Please describe the decision, dilemma, or claim you want to deconstruct.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // AI Investigator: Log user input clearly
    console.log('[AI Investigator] Submitting user decision input:', {
      decisionText: decisionText.trim(),
      context: context.trim() || undefined,
      constraints: constraints.trim() || undefined,
    });

    try {
      const result = await api.generateAnalysis({
        decisionText: decisionText.trim(),
        context: context.trim() || undefined,
        constraints: constraints.trim() || undefined,
      });

      console.log('[AI Investigator] Analysis generated successfully:', result.id);
      onAnalysisGenerated(result);
    } catch (err: any) {
      console.error('[AI Investigator] Error generating analysis:', err);
      setErrorMessage(err?.message || 'Failed to generate reasoning analysis. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof EXAMPLE_PRESETS[0]) => {
    setDecisionText(preset.text);
    setContext(preset.context);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Epistemological Reasoning Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Deconstruct Any Strategic Decision
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Input your argument or dilemma. The AI maps it into claims, supporting evidence, unverified assumptions, and downside risks.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Decision Text Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Decision, Hypothesis, or Claim to Deconstruct <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={decisionText}
              onChange={e => setDecisionText(e.target.value)}
              placeholder="e.g. Should our startup pivot to an annual upfront enterprise sales model, or maintain our self-serve monthly pricing?"
              className="w-full p-3.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors resize-none leading-relaxed"
              disabled={loading}
            />
          </div>

          {/* Quick Example Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Or try an example case:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium transition-colors border border-slate-200"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Context Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(prev => !prev)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {showAdvanced ? '− Hide Context & Constraints' : '+ Add Optional Context & Constraints'}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Background Context (optional)
                  </label>
                  <input
                    type="text"
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    placeholder="e.g. 18 months runway remaining, current team of 6 engineers"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Constraints or Non-Negotiables (optional)
                  </label>
                  <input
                    type="text"
                    value={constraints}
                    onChange={e => setConstraints(e.target.value)}
                    placeholder="e.g. Must not increase burn rate by more than $15k/month"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deconstructing Reasoning with Gemini AI...</span>
              </>
            ) : (
              <>
                <span>Deconstruct Reasoning Graph</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
