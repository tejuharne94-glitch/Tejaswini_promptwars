import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Zap,
  ShieldAlert,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
  Loader2,
  Users,
} from 'lucide-react';
import { User } from '../types.js';
import { api } from '../services/api.js';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserUpdated: (user: User) => void;
  onRequireAuth: () => void;
}

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onRequireAuth,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const isVip = currentUser?.plan === 'vip' || currentUser?.plan === 'pro';

  const handleTogglePlan = async (targetPlan: 'free' | 'vip') => {
    if (!currentUser) {
      onClose();
      onRequireAuth();
      return;
    }

    setLoading(true);
    try {
      const updated = await api.updatePlan(targetPlan);
      onUserUpdated(updated);
    } catch (err: any) {
      alert(err?.message || 'Could not update membership status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Reasoning Graph VIP Plan</h2>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  Institutional
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Unlock executive decision memos, Monte Carlo risk simulation, and multi-agent red teaming
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

        {/* Current status pill */}
        {currentUser && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Logged in as: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email})
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                isVip
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              Current: {currentUser.plan ? currentUser.plan.toUpperCase() : 'FREE'}
            </span>
          </div>
        )}

        {/* VIP Features Grid */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Monte Carlo Sensitivity Simulator
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Run 1,000 statistical trials testing assumption failure probabilities and distribution bell curves.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Executive Decision Memorandum
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Generate an institutional-grade 3-page decision memo with Risk Matrix & Audit Trail for board review.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-2">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Multi-Agent Red Teaming
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Stress-test with rival executive personas: Skeptical VC, Chief Risk Officer, and Competitor CEO.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Priority Latency & Unlimited Depth
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sub-second reasoning deconstruction with unlimited cascading second-order consequence nodes.
            </p>
          </div>
        </div>

        {/* Pricing selector */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                {selectedBilling === 'annual' ? '$19' : '$25'}
              </span>
              <span className="text-xs text-slate-500">/ month</span>
              {selectedBilling === 'annual' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Save 24%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Billed {selectedBilling === 'annual' ? '$228 annually' : 'monthly'}. Instant activation.
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedBilling === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedBilling === 'annual' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>

          {isVip ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                VIP Membership Active
              </span>
              <button
                onClick={() => handleTogglePlan('free')}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Downgrade to Free
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleTogglePlan('vip')}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              ) : (
                <Crown className="w-4 h-4 text-slate-950" />
              )}
              <span>Activate VIP Plan Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
