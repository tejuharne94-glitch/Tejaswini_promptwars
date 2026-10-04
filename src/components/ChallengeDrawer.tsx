import React, { useState } from 'react';
import {
  X,
  Swords,
  Brain,
  Zap,
  HelpCircle,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ReasoningAnalysis, ChallengeInsight, GraphNode, GraphEdge } from '../types.js';
import { api } from '../services/api.js';

interface ChallengeDrawerProps {
  analysis: ReasoningAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onAddNodeToGraph?: (node: Partial<GraphNode>, edge?: Partial<GraphEdge>) => void;
  isVip?: boolean;
  onOpenUpgrade?: () => void;
}

export const ChallengeDrawer: React.FC<ChallengeDrawerProps> = ({
  analysis,
  isOpen,
  onClose,
  onAddNodeToGraph,
  isVip = false,
  onOpenUpgrade,
}) => {
  const [activeTab, setActiveTab] = useState<'devils_advocate' | 'cognitive_bias' | 'what_if' | 'missing_evidence' | 'red_team'>('devils_advocate');
  const [selectedPersona, setSelectedPersona] = useState<'investor' | 'cro' | 'competitor'>('investor');
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeInsight[]>(analysis.challenges || []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateChallenges = async (
    type: 'devils_advocate' | 'cognitive_bias' | 'what_if' | 'missing_evidence' | 'red_team',
    personaOverride?: 'investor' | 'cro' | 'competitor'
  ) => {
    setActiveTab(type);
    setLoading(true);

    let query = customQuery.trim() || undefined;
    if (type === 'red_team') {
      const persona = personaOverride || selectedPersona;
      const personaPrompts = {
        investor: 'Roleplay as an ultra-skeptical Tier 1 Silicon Valley VC partner: aggressively challenge their unit economics, CAC, market timing, and defensibility.',
        cro: 'Roleplay as a ruthless Chief Risk & Compliance Officer: attack their compliance liabilities, runway assumptions, and catastrophic lockouts.',
        competitor: 'Roleplay as the CEO of a well-capitalized competitor: expose how an aggressive incumbent will clone their features and choke their distribution.',
      };
      query = personaPrompts[persona] + (customQuery.trim() ? ` Additional focus: ${customQuery.trim()}` : '');
    }

    try {
      const results = await api.challengeAnalysis({
        analysisId: analysis.id,
        challengeType: type === 'red_team' ? 'devils_advocate' : type,
        customQuery: query,
      });
      setChallenges(results);
    } catch (err: any) {
      console.error('Failed to generate challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyChallenge = (challenge: ChallengeInsight) => {
    const text = `CRITICAL REASONING CHALLENGE: ${challenge.title}\nType: ${challenge.type.replace('_', ' ')} | Impact: ${challenge.impact}\n\n${challenge.description}`;
    navigator.clipboard.writeText(text);
    setCopiedId(challenge.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
            <Swords className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              Challenge My Reasoning
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                Stress-Test
              </span>
            </h2>
            <p className="text-xs text-slate-500">Expose cognitive bias, worst-case risks, and unhedged assumptions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 p-1.5 bg-slate-100 border-b border-slate-200 text-xs">
        <button
          onClick={() => handleGenerateChallenges('devils_advocate')}
          className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'devils_advocate'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span className="truncate">Devil's Adv.</span>
        </button>

        <button
          onClick={() => handleGenerateChallenges('cognitive_bias')}
          className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'cognitive_bias'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="truncate">Bias Audit</span>
        </button>

        <button
          onClick={() => handleGenerateChallenges('what_if')}
          className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'what_if'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="truncate">What-If</span>
        </button>

        <button
          onClick={() => handleGenerateChallenges('missing_evidence')}
          className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'missing_evidence'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="truncate">Blind Spots</span>
        </button>

        {/* 5th Tab: VIP Red Team */}
        <button
          onClick={() => handleGenerateChallenges('red_team')}
          className={`py-2 px-1 rounded-md font-bold flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'red_team'
              ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] uppercase font-black tracking-wider text-amber-700">VIP</span>
          </div>
          <span className="truncate">Red Team</span>
        </button>
      </div>

      {/* VIP Red Team Persona Selector (when active) */}
      {activeTab === 'red_team' && (
        <div className="p-3 bg-amber-50/70 border-b border-amber-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-amber-950 flex items-center gap-1">
              Select Adversarial Persona:
            </span>
            {!isVip && (
              <button
                onClick={onOpenUpgrade}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
              >
                Upgrade to VIP for unlimited personas
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setSelectedPersona('investor');
                handleGenerateChallenges('red_team', 'investor');
              }}
              className={`p-2 rounded-lg border text-left transition-colors ${
                selectedPersona === 'investor'
                  ? 'bg-white border-amber-500 font-bold text-slate-900 shadow-xs'
                  : 'bg-white/60 border-amber-200 text-slate-700 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-bold">Skeptical VC</div>
              <div className="text-[10px] text-slate-500 leading-tight">Attacks economics & CAC</div>
            </button>

            <button
              onClick={() => {
                setSelectedPersona('cro');
                handleGenerateChallenges('red_team', 'cro');
              }}
              className={`p-2 rounded-lg border text-left transition-colors ${
                selectedPersona === 'cro'
                  ? 'bg-white border-amber-500 font-bold text-slate-900 shadow-xs'
                  : 'bg-white/60 border-amber-200 text-slate-700 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-bold">Chief Risk Officer</div>
              <div className="text-[10px] text-slate-500 leading-tight">Attacks liability & solvency</div>
            </button>

            <button
              onClick={() => {
                setSelectedPersona('competitor');
                handleGenerateChallenges('red_team', 'competitor');
              }}
              className={`p-2 rounded-lg border text-left transition-colors ${
                selectedPersona === 'competitor'
                  ? 'bg-white border-amber-500 font-bold text-slate-900 shadow-xs'
                  : 'bg-white/60 border-amber-200 text-slate-700 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-bold">Competitor CEO</div>
              <div className="text-[10px] text-slate-500 leading-tight">Attacks distribution moats</div>
            </button>
          </div>
        </div>
      )}

      {/* Custom Probe Field */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex gap-2">
        <input
          type="text"
          placeholder="Optional: focus on a specific worry or node..."
          value={customQuery}
          onChange={e => setCustomQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerateChallenges(activeTab)}
          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
        />
        <button
          onClick={() => handleGenerateChallenges(activeTab)}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Run
        </button>
      </div>

      {/* Challenge List Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
            <div className="text-xs font-bold text-slate-800">Stress-Testing Reasoning Premises...</div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Subjecting assumptions to adversarial logic and identifying unhedged failure branches.
            </p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-xs">No active challenge points yet. Select a mode above to run adversarial analysis.</p>
          </div>
        ) : (
          challenges.map((c, i) => (
            <div
              key={c.id || i}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-left"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      c.impact === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {c.impact} Impact
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {c.type.replace('_', ' ')}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyChallenge(c)}
                  className="text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  title="Copy critical insight"
                >
                  {copiedId === c.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Insight</span>
                    </>
                  )}
                </button>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                {c.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {c.description}
              </p>

              {c.suggestedNode && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
                  <span>
                    Suggested Node: <strong className="text-indigo-900">{c.suggestedNode.label || c.title}</strong>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 uppercase font-mono border border-slate-200">
                    {c.suggestedNode.type}
                  </span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Cognitive Biases found in initial analysis */}
        {activeTab === 'cognitive_bias' && analysis.detectedBiases && analysis.detectedBiases.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-3 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              Structural Bias Findings
            </h3>
            <div className="space-y-2.5">
              {analysis.detectedBiases.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
                  <div className="text-xs font-bold text-purple-950 mb-1">{b.biasName}</div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">{b.description}</p>
                  <div className="text-[11px] text-emerald-800 bg-white p-2 rounded border border-emerald-200 flex items-start gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Countermeasure:</strong> {b.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
