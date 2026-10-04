import React, { useState } from 'react';
import { Network, PlusCircle, History, Shield, LogOut, Sparkles, LogIn, Menu, X, Crown } from 'lucide-react';
import { User as UserType } from '../types.js';

interface NavbarProps {
  currentUser: UserType | null;
  currentView: string;
  onNavigate: (view: string, analysisId?: string) => void;
  onOpenAuth: (initialMode?: 'login' | 'register' | 'admin') => void;
  onOpenVipUpgrade: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenVipUpgrade,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  Reasoning Graph
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
                  v2.0
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-normal">
                Make Your Thinking Visible.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                currentView === 'landing'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('new')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === 'new'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              New Analysis
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === 'history'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              History
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentView === 'admin'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                Admin Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* VIP Upgrade Button / Badge */}
          {currentUser?.plan === 'vip' || currentUser?.plan === 'pro' ? (
            <button
              onClick={onOpenVipUpgrade}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors shadow-2xs"
              title="VIP Institutional Plan Active (Click to manage)"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">VIP Member</span>
            </button>
          ) : (
            <button
              onClick={onOpenVipUpgrade}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors shadow-2xs"
              title="Upgrade to VIP Plan for Monte Carlo, Exec Memos & Red Teaming"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Get VIP</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('new')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Analyze
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                title="View Profile"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('admin')}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1"
                title="Admin Portal"
              >
                <Shield className="w-3 h-3 text-slate-500" />
                Admin
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Overview
          </button>
          <button
            onClick={() => {
              onNavigate('new');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Analysis
          </button>
          <button
            onClick={() => {
              onNavigate('history');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            History
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              Admin Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
