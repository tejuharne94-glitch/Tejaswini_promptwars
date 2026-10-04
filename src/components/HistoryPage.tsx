import React, { useState, useEffect, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  PlusCircle,
  Calendar,
  Layers,
  Loader2,
  X,
  FileText,
  Check,
} from 'lucide-react';
import { ReasoningAnalysis } from '../types.js';
import { api } from '../services/api.js';
import { getSoundnessTier, exportAnalysisAsMarkdown } from '../utils/graphUtils.js';

interface HistoryPageProps {
  onOpenAnalysis: (id: string) => void;
  onNewAnalysis: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onOpenAnalysis,
  onNewAnalysis,
}) => {
  const [analyses, setAnalyses] = useState<ReasoningAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    console.log('[AI Investigator] Fetching history analyses');
    try {
      const data = await api.getAnalyses();
      setAnalyses(data);
      console.log('[AI Investigator] History loaded successfully. Count:', data.length);
    } catch (err) {
      console.error('[AI Investigator] Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved analysis?')) return;
    console.log('[AI Investigator] User confirmed deletion for analysis ID:', id);
    try {
      await api.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('[AI Investigator] Error deleting analysis:', err);
      alert(err?.message || 'Failed to delete');
    }
  };

  const handleCopyMarkdown = (analysis: ReasoningAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    const md = exportAnalysisAsMarkdown(analysis);
    navigator.clipboard.writeText(md);
    setCopiedId(analysis.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter pipeline
  const filteredAnalyses = useMemo(() => {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return analyses.filter(a => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesDecision = a.decisionText.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDecision) return false;
      }

      // 2. Date Filter
      const createdTime = new Date(a.createdAt).getTime();
      if (dateFilter === 'today') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        if (createdTime < todayStart) return false;
      } else if (dateFilter === '7days') {
        if (createdTime < now.getTime() - 7 * oneDayMs) return false;
      } else if (dateFilter === '30days') {
        if (createdTime < now.getTime() - 30 * oneDayMs) return false;
      }

      return true;
    });
  }, [analyses, searchQuery, dateFilter]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HistoryIcon className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Saved Reasoning Analyses</h1>
          </div>
          <p className="text-xs text-slate-500">
            Search previous decisions by title or date, and reopen any graph.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Title Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title or decision statement..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === 'today'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === '7days'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === '30days'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Past 30 Days
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-1">
          Showing <strong>{filteredAnalyses.length}</strong> of {analyses.length} saved analyses
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
          <span className="text-xs text-slate-500">Loading reasoning archive...</span>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white border border-slate-200 p-8 shadow-xs">
          <HistoryIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Analyses Found</h3>
          <p className="text-xs text-slate-500 mb-4">
            {searchQuery || dateFilter !== 'all'
              ? 'No saved analyses match your search filter.'
              : 'You have not created any reasoning graphs yet.'}
          </p>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Create Your First Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnalyses.map(a => {
            const tier = getSoundnessTier(a.soundnessScore);

            return (
              <div
                key={a.id}
                onClick={() => onOpenAnalysis(a.id)}
                className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                      style={{ backgroundColor: `${tier.hex}15`, color: tier.hex }}
                    >
                      {a.soundnessScore}/100 • {tier.label}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {a.nodes.length} nodes
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {a.decisionText}
                  </p>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={e => handleCopyMarkdown(a, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Copy Markdown Summary"
                  >
                    {copiedId === a.id ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={e => handleDelete(a.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    title="Delete Analysis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
