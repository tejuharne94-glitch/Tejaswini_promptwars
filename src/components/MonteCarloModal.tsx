import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  RefreshCw,
  Crown,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ReasoningAnalysis, GraphNode } from '../types.js';

interface MonteCarloModalProps {
  analysis: ReasoningAnalysis;
  isOpen: boolean;
  onClose: () => void;
  isVip: boolean;
  onOpenUpgrade: () => void;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({
  analysis,
  isOpen,
  onClose,
  isVip,
  onOpenUpgrade,
}) => {
  const [iterations, setIterations] = useState(1000);
  const [riskTolerance, setRiskTolerance] = useState(50); // 0 to 100
  const [simSeed, setSimSeed] = useState(0);

  const assumptions = useMemo(() => analysis.nodes.filter(n => n.type === 'assumption'), [analysis.nodes]);
  const risks = useMemo(() => analysis.nodes.filter(n => n.type === 'risk'), [analysis.nodes]);

  // Run simulation
  const simulationResults = useMemo(() => {
    let successCount = 0;
    const bucketCounts = new Array(10).fill(0); // 0-9, 10-19... 90-100%
    const failureTally: Record<string, number> = {};

    const confidenceProbabilities: Record<string, number> = {
      high: 0.85,
      medium: 0.65,
      low: 0.35,
      unverified: 0.20,
    };

    const riskTriggerProbabilities: Record<string, number> = {
      critical: 0.40,
      moderate: 0.22,
      minor: 0.10,
    };

    for (let i = 0; i < iterations; i++) {
      let score = 100;
      let failedNode: string | null = null;

      // Test assumptions
      for (const assump of assumptions) {
        const pSuccess = (confidenceProbabilities[assump.confidence] || 0.5) * (1 + (100 - riskTolerance) * 0.002);
        if (Math.random() > Math.min(0.95, pSuccess)) {
          score -= (assump.impact === 'critical' ? 35 : 20);
          failedNode = assump.label;
        }
      }

      // Test risks
      for (const r of risks) {
        const pRisk = (riskTriggerProbabilities[r.impact || 'moderate'] || 0.2) * (1 + riskTolerance * 0.003);
        if (Math.random() < pRisk) {
          score -= 30;
          failedNode = r.label;
        }
      }

      const clamped = Math.max(0, Math.min(100, score));
      if (clamped >= 55) {
        successCount++;
      } else if (failedNode) {
        failureTally[failedNode] = (failureTally[failedNode] || 0) + 1;
      }

      const bucket = Math.min(9, Math.floor(clamped / 10));
      bucketCounts[bucket]++;
    }

    const survivalRate = Math.round((successCount / iterations) * 100);
    const sortedFailures = Object.entries(failureTally).sort((a, b) => b[1] - a[1]);
    const primaryFailurePoint = sortedFailures.length > 0 ? sortedFailures[0][0] : 'Balanced risk spread';

    return {
      survivalRate,
      bucketCounts,
      primaryFailurePoint,
      totalRuns: iterations,
    };
  }, [assumptions, risks, iterations, riskTolerance, simSeed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Monte Carlo Sensitivity Simulation
                </h2>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                  VIP Feature
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1,000 statistical trials testing assumption failure rates & hazard exposure
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

        {/* VIP Lock Banner if user is not VIP */}
        {!isVip && (
          <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-medium">
              <Crown className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Unlock full interactive parameters and exports with the <strong>VIP Plan</strong>.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenUpgrade();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Unlock with VIP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Results Banner */}
        <div className="my-5 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Simulated Survival / Success Probability
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  simulationResults.survivalRate >= 65
                    ? 'text-emerald-700'
                    : simulationResults.survivalRate >= 45
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {simulationResults.survivalRate}%
              </span>
              <span className="text-xs text-slate-500">
                ({simulationResults.totalRuns.toLocaleString()} stochastic iterations)
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Primary Point of Failure
            </span>
            <div className="text-xs font-bold text-slate-800 line-clamp-1 max-w-xs">
              {simulationResults.primaryFailurePoint}
            </div>
          </div>
        </div>

        {/* Histogram Distribution Chart */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Viability Score Distribution (0–100%)</span>
            <span className="text-slate-400 text-[11px] font-mono">10 buckets</span>
          </div>

          <div className="h-28 flex items-end gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {simulationResults.bucketCounts.map((count, idx) => {
              const maxCount = Math.max(...simulationResults.bucketCounts, 1);
              const heightPct = Math.round((count / maxCount) * 100);
              const isPassing = idx >= 5;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isPassing ? 'bg-indigo-600 group-hover:bg-indigo-700' : 'bg-rose-400 group-hover:bg-rose-500'
                    }`}
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                    title={`${idx * 10}-${idx * 10 + 9}%: ${count} runs`}
                  />
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {idx * 10}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Controls (enabled for VIP) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Risk Severity Multiplier: {riskTolerance}%</span>
            <button
              onClick={() => setSimSeed(prev => prev + 1)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-run 1,000 Trials
            </button>
          </div>

          <input
            type="range"
            min="10"
            max="90"
            value={riskTolerance}
            onChange={e => setRiskTolerance(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Conservative (Strict buffer)</span>
            <span>Balanced</span>
            <span>Aggressive (High hazard volatility)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Assumptions audited: {assumptions.length} • Risks modeled: {risks.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
