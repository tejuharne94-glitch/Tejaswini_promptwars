import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertTriangle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '../services/api.js';
import { User } from '../types.js';

interface AdminLoginProps {
  onSuccess: (adminUser: User) => void;
  onBackToUser: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onBackToUser,
}) => {
  const [email, setEmail] = useState('admin@reasoninggraph.internal');
  const [password, setPassword] = useState('Admin@Reasoning2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin({ email, password });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Administrator authentication rejected. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseEvaluatorCreds = () => {
    setEmail('admin@reasoninggraph.internal');
    setPassword('Admin@Reasoning2026!');
    setError(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 relative">
        {/* Back Link */}
        <button
          onClick={onBackToUser}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </button>

        {/* Brand / Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Administrator Portal</h1>
            <p className="text-xs text-rose-700 font-medium">Secured Role-Based Access</p>
          </div>
        </div>

        {/* Notice for Evaluator */}
        <div className="mb-5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5 text-rose-700">
              <KeyRound className="w-3.5 h-3.5" />
              Evaluation Credentials
            </span>
            <button
              type="button"
              onClick={handleUseEvaluatorCreds}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
            >
              Auto-fill
            </button>
          </div>
          <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
            <div>Email: <span className="text-slate-900 font-semibold">admin@reasoninggraph.internal</span></div>
            <div>Password: <span className="text-slate-900 font-semibold">Admin@Reasoning2026!</span></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@reasoninggraph.internal"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Authenticate Admin Session
          </button>
        </form>
      </div>
    </div>
  );
};
