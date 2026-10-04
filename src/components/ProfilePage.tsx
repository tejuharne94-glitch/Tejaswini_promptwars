import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Calendar,
  LogOut,
  CheckCircle,
  Award,
  History,
  Crown,
  Zap,
  BarChart3,
  FileText,
  Users,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { User, ReasoningAnalysis } from '../types.js';
import { api } from '../services/api.js';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
  onNavigateHistory: () => void;
  onNavigateNew: () => void;
  onOpenVipUpgrade: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onLogout,
  onNavigateHistory,
  onNavigateNew,
  onOpenVipUpgrade,
}) => {
  const [analyses, setAnalyses] = useState<ReasoningAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalyses()
      .then(data => {
        setAnalyses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isVip = Boolean(user.plan === 'vip' || user.plan === 'pro');
  const totalCount = analyses.length;
  const avgScore =
    totalCount > 0
      ? Math.round(analyses.reduce((acc, a) => acc + a.soundnessScore, 0) / totalCount)
      : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{user.name}</h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {user.role}
                </span>

                {isVip && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    <Crown className="w-3 h-3 text-amber-600" />
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Analyses Created
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
              <span className="text-xs text-slate-500">records</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Average Soundness Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-600">{avgScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Epistemological Rigor
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">
                {avgScore >= 60 ? 'Disciplined' : 'Developing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan & Membership Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Subscription & VIP Plan</h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  isVip
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isVip ? 'VIP Institutional' : 'Standard Free Tier'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isVip
                ? 'Your account has full institutional access to advanced decision stress-testing & exports.'
                : 'Unlock Monte Carlo sensitivity simulations, side-by-side graph comparison, and executive memos.'}
            </p>
          </div>

          <button
            onClick={onOpenVipUpgrade}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs ${
              isVip
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>{isVip ? 'Manage VIP Membership' : 'Upgrade to VIP ($19/mo)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* VIP Perks Grid */}
        <div className="pt-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            {isVip ? 'Included in Your VIP Plan' : 'Exclusive VIP Plan Features'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">1,000-Trial Monte Carlo Sensitivity</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Simulate cumulative failure probabilities across all unverified assumptions and hazards.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Executive Decision Memorandum</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Generate print-ready 3-page decision memos formatted for executive boards and compliance.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Multi-Agent Red Teaming</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Attack reasoning with specialized personas: Skeptical VC, Risk Officer, and Competitor.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Side-by-Side Comparator & Batch Export</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Compare two decision graphs head-to-head in History, and export entire archive dossiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onNavigateHistory}
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
              View Saved Analyses
            </span>
            <History className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-[11px] text-slate-500">
            Search by title or date, filter, compare side-by-side, and manage all previous graphs.
          </p>
        </button>

        <button
          onClick={onNavigateNew}
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
              Start New Analysis
            </span>
            <Award className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-[11px] text-slate-500">
            Deconstruct a new strategic dilemma, claim, or hypothesis with AI reasoning engine.
          </p>
        </button>
      </div>
    </div>
  );
};
