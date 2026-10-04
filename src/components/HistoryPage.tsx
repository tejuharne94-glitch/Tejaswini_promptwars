import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  PlusCircle,
  FileText,
  Calendar,
  Layers,
  Loader2,
  Check,
  Filter,
  X,
  ArrowUpDown,
  RotateCcw,
  Scale,
  Crown,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ReasoningAnalysis } from '../types.js';
import { api } from '../services/api.js';
import { getSoundnessTier, exportAnalysisAsMarkdown } from '../utils/graphUtils.js';

interface HistoryPageProps {
  onOpenAnalysis: (id: string) => void;
  onNewAnalysis: () => void;
  isVip?: boolean;
  onOpenVipUpgrade?: () => void;
  onOpenCompare?: (analysisA: ReasoningAnalysis, analysisB: ReasoningAnalysis) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onOpenAnalysis,
  onNewAnalysis,
  isVip = false,
  onOpenVipUpgrade,
  onOpenCompare,
}) => {
  const [analyses, setAnalyses] = useState<ReasoningAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);

  // Search & Filter State
  const [searchTitle, setSearchTitle] = useState('');
  const [dateFilterPreset, setDateFilterPreset] = useState<
    'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'exact' | 'custom'
  >('all');
  const [exactDate, setExactDate] = useState(''); // YYYY-MM-DD
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(''); // YYYY-MM-DD
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low' | 'nodes'>('newest');

  // Comparison Selection (VIP Feature)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyses();
      setAnalyses(data);
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this reasoning analysis? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
      setSelectedForCompare(prev => prev.filter(item => item !== id));
    } catch (err: any) {
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

  const handleResetFilters = () => {
    setSearchTitle('');
    setDateFilterPreset('all');
    setExactDate('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  // Toggle selection for side-by-side comparison
  const handleToggleCompareSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 2) {
        // Replace second or notify
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleTriggerCompare = () => {
    if (selectedForCompare.length !== 2) return;
    const a = analyses.find(item => item.id === selectedForCompare[0]);
    const b = analyses.find(item => item.id === selectedForCompare[1]);
    if (a && b && onOpenCompare) {
      onOpenCompare(a, b);
    }
  };

  // VIP Batch Export
  const handleBatchExport = () => {
    if (!isVip) {
      if (onOpenVipUpgrade) onOpenVipUpgrade();
      return;
    }

    const itemsToExport = selectedForCompare.length > 0
      ? analyses.filter(a => selectedForCompare.includes(a.id))
      : filteredAndSortedAnalyses;

    let bundleText = `# REASONING GRAPH: INSTITUTIONAL ARCHIVE DOSSIER\n`;
    bundleText += `Export Date: ${new Date().toLocaleString()}\n`;
    bundleText += `Total Analyses Included: ${itemsToExport.length}\n`;
    bundleText += `=================================================\n\n`;

    itemsToExport.forEach((item, idx) => {
      bundleText += `### [${idx + 1}/${itemsToExport.length}] ${item.title}\n`;
      bundleText += exportAnalysisAsMarkdown(item);
      bundleText += `\n\n-------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(bundleText);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2500);
  };

  // Check if any filter is active
  const isFilterActive =
    searchTitle.trim() !== '' ||
    dateFilterPreset !== 'all' ||
    exactDate !== '' ||
    startDate !== '' ||
    endDate !== '';

  // Filter & sort pipeline
  const filteredAndSortedAnalyses = useMemo(() => {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const filtered = analyses.filter(a => {
      // 1. Title Search Filter
      if (searchTitle.trim()) {
        const query = searchTitle.toLowerCase().trim();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesDecision = a.decisionText.toLowerCase().includes(query);
        const matchesCategory = a.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDecision && !matchesCategory) {
          return false;
        }
      }

      // 2. Date Filter
      const createdDate = new Date(a.createdAt);
      const analysisTime = createdDate.getTime();

      if (dateFilterPreset === 'today') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        if (analysisTime < todayStart) return false;
      } else if (dateFilterPreset === 'yesterday') {
        const yStart = new Date(now.getTime() - oneDayMs).setHours(0, 0, 0, 0);
        const yEnd = new Date(now.getTime() - oneDayMs).setHours(23, 59, 59, 999);
        if (analysisTime < yStart || analysisTime > yEnd) return false;
      } else if (dateFilterPreset === '7days') {
        if (analysisTime < now.getTime() - 7 * oneDayMs) return false;
      } else if (dateFilterPreset === '30days') {
        if (analysisTime < now.getTime() - 30 * oneDayMs) return false;
      } else if (dateFilterPreset === 'this_month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        if (analysisTime < monthStart) return false;
      } else if (dateFilterPreset === 'exact') {
        if (exactDate) {
          // Compare YYYY-MM-DD
          const [yr, mo, da] = exactDate.split('-').map(Number);
          const targetStart = new Date(yr, mo - 1, da, 0, 0, 0, 0).getTime();
          const targetEnd = new Date(yr, mo - 1, da, 23, 59, 59, 999).getTime();
          if (analysisTime < targetStart || analysisTime > targetEnd) return false;
        }
      } else if (dateFilterPreset === 'custom') {
        if (startDate) {
          const [sYr, sMo, sDa] = startDate.split('-').map(Number);
          const startMs = new Date(sYr, sMo - 1, sDa, 0, 0, 0, 0).getTime();
          if (analysisTime < startMs) return false;
        }
        if (endDate) {
          const [eYr, eMo, eDa] = endDate.split('-').map(Number);
          const endMs = new Date(eYr, eMo - 1, eDa, 23, 59, 59, 999).getTime();
          if (analysisTime > endMs) return false;
        }
      }

      return true;
    });

    // 3. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'score_high') {
        return b.soundnessScore - a.soundnessScore;
      }
      if (sortBy === 'score_low') {
        return a.soundnessScore - b.soundnessScore;
      }
      if (sortBy === 'nodes') {
        return b.nodes.length - a.nodes.length;
      }
      return 0;
    });

    return filtered;
  }, [analyses, searchTitle, dateFilterPreset, exactDate, startDate, endDate, sortBy]);

  // Formatted date label for chips
  const getDateFilterLabel = () => {
    switch (dateFilterPreset) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case '7days':
        return 'Past 7 Days';
      case '30days':
        return 'Past 30 Days';
      case 'this_month':
        return 'This Month';
      case 'exact':
        return exactDate ? `Date: ${exactDate}` : 'Specific Date';
      case 'custom':
        return startDate || endDate ? `${startDate || 'Start'} to ${endDate || 'Now'}` : 'Custom Range';
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reasoning Archive</h1>
          </div>
          <p className="text-xs text-slate-500">
            Search, filter by title or date, and review your previous decision graphs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* VIP Batch Export button */}
          <button
            onClick={handleBatchExport}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors shadow-2xs ${
              isVip
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={isVip ? 'Export filtered archive dossier' : 'VIP Feature: Export Vault Dossier'}
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>{batchCopied ? 'Dossier Copied!' : 'Batch Export'}</span>
            {!isVip && (
              <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-900">
                VIP
              </span>
            )}
          </button>

          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      {/* VIP Perks Bar in History */}
      {!isVip ? (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-200/80 flex items-center justify-center text-amber-900 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Unlock VIP Pro Comparative Intelligence</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-200 font-extrabold uppercase text-amber-900">
                  Pro Plan
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Compare 2 saved analyses side-by-side, export batch audit dossiers, and run 1,000-trial Monte Carlo tests.
              </p>
            </div>
          </div>
          {onOpenVipUpgrade && (
            <button
              onClick={onOpenVipUpgrade}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Get VIP Plan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mb-6 p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>
              <strong>VIP Institutional Member:</strong> Select any 2 analyses below to compare side-by-side, or use Batch Export.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
            Active
          </span>
        </div>
      )}

      {/* Side-by-Side Comparison Floating Action Bar (When analyses are selected) */}
      {selectedForCompare.length > 0 && (
        <div className="mb-6 p-3 rounded-xl bg-slate-900 text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>
              <strong>{selectedForCompare.length} of 2</strong> analyses selected for comparative evaluation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear Selection
            </button>

            <button
              onClick={handleTriggerCompare}
              disabled={selectedForCompare.length !== 2}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedForCompare.length === 2
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
              {!isVip && (
                <span className="px-1 py-0.2 rounded text-[9px] bg-slate-950 text-amber-400 uppercase font-black">
                  VIP
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Search & Date Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6 space-y-4">
        {/* Primary Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. Title Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, decision statement, or keyword..."
              value={searchTitle}
              onChange={e => setSearchTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
            {searchTitle && (
              <button
                onClick={() => setSearchTitle('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear title search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Date Filter Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={dateFilterPreset}
                onChange={e => setDateFilterPreset(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="exact">Specific Date...</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>
          </div>

          {/* 3. Sort Order Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="score_high">Highest Soundness</option>
                <option value="score_low">Lowest Soundness (High Risk)</option>
                <option value="nodes">Most Nodes Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Date Presets Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Quick Dates:
          </span>

          <button
            onClick={() => setDateFilterPreset('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Time
          </button>

          <button
            onClick={() => setDateFilterPreset('today')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === 'today'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setDateFilterPreset('yesterday')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === 'yesterday'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Yesterday
          </button>

          <button
            onClick={() => setDateFilterPreset('7days')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === '7days'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Past 7 Days
          </button>

          <button
            onClick={() => setDateFilterPreset('30days')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === '30days'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Past 30 Days
          </button>

          <button
            onClick={() => setDateFilterPreset('exact')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === 'exact'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pick Specific Date
          </button>

          <button
            onClick={() => setDateFilterPreset('custom')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              dateFilterPreset === 'custom'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Date Range
          </button>
        </div>

        {/* Exact Date Picker Input (when 'exact' selected) */}
        {dateFilterPreset === 'exact' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-100">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Filter by Exact Date:
            </span>
            <input
              type="date"
              value={exactDate}
              onChange={e => setExactDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            {exactDate && (
              <button
                onClick={() => setExactDate('')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear date
              </button>
            )}
          </div>
        )}

        {/* Custom Date Range Inputs (when 'custom' selected) */}
        {dateFilterPreset === 'custom' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-100">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Filter by Date Range:
            </span>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-slate-500">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-slate-500">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear range
              </button>
            )}
          </div>
        )}

        {/* Active Filters Row & Results Count */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredAndSortedAnalyses.length}</strong> of{' '}
              {analyses.length} saved analyses
            </span>

            {/* Active Title chip */}
            {searchTitle.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                Title: &quot;{searchTitle}&quot;
                <button
                  onClick={() => setSearchTitle('')}
                  className="hover:text-indigo-900 ml-0.5"
                  title="Remove title filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Active Date chip */}
            {getDateFilterLabel() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                {getDateFilterLabel()}
                <button
                  onClick={() => {
                    setDateFilterPreset('all');
                    setExactDate('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="hover:text-indigo-900 ml-0.5"
                  title="Remove date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Analyses List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
          <div className="text-xs font-semibold text-slate-700">Loading reasoning archive...</div>
        </div>
      ) : filteredAndSortedAnalyses.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white border border-slate-200 p-8 shadow-xs">
          <History className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Matching Analyses Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {isFilterActive
              ? `No saved analyses match your search criteria${
                  searchTitle ? ` for title "${searchTitle}"` : ''
                }${getDateFilterLabel() ? ` on ${getDateFilterLabel()}` : ''}. Try resetting your filter.`
              : 'You have not created any reasoning graphs yet.'}
          </p>
          {isFilterActive ? (
            <div className="flex items-center justify-center gap-2">
              {searchTitle && (
                <button
                  onClick={() => setSearchTitle('')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Clear Title Filter
                </button>
              )}
              {getDateFilterLabel() && (
                <button
                  onClick={() => {
                    setDateFilterPreset('all');
                    setExactDate('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Clear Date Filter
                </button>
              )}
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <button
              onClick={onNewAnalysis}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Start Your First Analysis
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedAnalyses.map(a => {
            const tier = getSoundnessTier(a.soundnessScore);
            const isSelected = selectedForCompare.includes(a.id);

            return (
              <div
                key={a.id}
                onClick={() => onOpenAnalysis(a.id)}
                className={`cursor-pointer group p-5 rounded-xl bg-white border transition-all shadow-xs flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20'
                    : 'hover:border-slate-300 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {/* Compare Checkbox */}
                      <button
                        onClick={e => handleToggleCompareSelection(a.id, e)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Select for side-by-side comparative analysis"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3 h-3 text-amber-700" />
                        ) : (
                          <Square className="w-3 h-3 text-slate-400" />
                        )}
                        <span>Compare</span>
                      </button>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {a.category || 'Strategic Dilemma'}
                      </span>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono"
                      style={{
                        backgroundColor: `${tier.hex}15`,
                        color: tier.hex,
                      }}
                    >
                      {a.soundnessScore}/100 • {tier.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {a.decisionText}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {a.nodes.length} nodes
                    </span>
                    <span
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-600"
                      title={new Date(a.createdAt).toLocaleString()}
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleCopyMarkdown(a, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Copy Diagnostic Markdown"
                    >
                      {copiedId === a.id ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={e => handleDelete(a.id, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete Analysis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="p-1 rounded-md text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
