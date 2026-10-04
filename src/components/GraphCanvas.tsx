import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  Download,
  Scale,
  Swords,
  ChevronDown,
  Check,
  FileText,
  FileCode,
  Crown,
  BarChart3,
  Lock,
  Info,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  GraphNode,
  GraphEdge,
  ReasoningAnalysis,
  NodeType,
} from '../types.js';
import {
  NODE_CONFIGS,
  RELATION_CONFIGS,
  autoLayoutNodes,
  getSoundnessTier,
  exportAnalysisAsMarkdown,
} from '../utils/graphUtils.js';

interface GraphCanvasProps {
  analysis: ReasoningAnalysis;
  onUpdateAnalysis?: (updated: ReasoningAnalysis) => void;
  onOpenChallenge: () => void;
  onOpenSoundness: () => void;
  onOpenMonteCarlo: () => void;
  onOpenExecutiveMemo: () => void;
  onSelectNode: (node: GraphNode | null) => void;
  selectedNodeId: string | null;
  isVip?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  analysis,
  onOpenChallenge,
  onOpenSoundness,
  onOpenMonteCarlo,
  onOpenExecutiveMemo,
  onSelectNode,
  selectedNodeId,
  isVip = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.9);
  const [pan, setPan] = useState({ x: 50, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Filter & Export state
  const [selectedFilter, setSelectedFilter] = useState<'all' | NodeType | 'vulnerabilities'>('all');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const NODE_WIDTH = 250;
  const NODE_HEIGHT = 135;

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (selectedFilter === 'all') return analysis.nodes;
    if (selectedFilter === 'vulnerabilities') {
      return analysis.nodes.filter(
        n => n.type === 'risk' || n.type === 'assumption' || n.type === 'contradiction'
      );
    }
    return analysis.nodes.filter(n => n.type === selectedFilter);
  }, [analysis.nodes, selectedFilter]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return analysis.edges.filter(
      e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
    );
  }, [analysis.edges, activeNodeIds]);

  // Fit to view
  const fitToView = useCallback(() => {
    if (!containerRef.current || analysis.nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xs = analysis.nodes.map(n => n.x);
    const ys = analysis.nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + NODE_WIDTH;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + NODE_HEIGHT;

    const graphWidth = maxX - minX + 100;
    const graphHeight = maxY - minY + 100;

    const scaleX = rect.width / graphWidth;
    const scaleY = rect.height / graphHeight;
    const newScale = Math.max(0.45, Math.min(1.0, Math.min(scaleX, scaleY)));

    setScale(newScale);
    setPan({
      x: (rect.width - graphWidth * newScale) / 2 - minX * newScale + 50 * newScale,
      y: (rect.height - graphHeight * newScale) / 2 - minY * newScale + 40 * newScale,
    });
  }, [analysis.nodes]);

  useEffect(() => {
    fitToView();
  }, [fitToView]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(1.8, Math.max(0.35, prev + delta)));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    handleZoom(delta);
  };

  // Canvas background panning (viewing only)
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (
      e.target !== containerRef.current &&
      !(e.target as HTMLElement).classList.contains('canvas-background')
    ) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    onSelectNode(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Node Click - Selection ONLY (Moving/Dragging is disabled to prevent changing the graph)
  const handleNodeClick = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    onSelectNode(node);
  };

  const handleExportMarkdown = () => {
    const md = exportAnalysisAsMarkdown(analysis);
    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
    setExportMenuOpen(false);
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `reasoning-graph-${analysis.id || 'canonical'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportMenuOpen(false);
  };

  const soundness = getSoundnessTier(analysis.soundnessScore);
  const assumptionCount = analysis.nodes.filter(n => n.type === 'assumption').length;
  const riskCount = analysis.nodes.filter(n => n.type === 'risk').length;
  const evidenceCount = analysis.nodes.filter(n => n.type === 'evidence').length;

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 overflow-hidden relative select-none">
      {/* 1. TOP CONTROL BAR */}
      <div className="h-14 border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md">
        {/* Left: Dimension Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Nodes ({analysis.nodes.length})
          </button>

          <button
            onClick={() => setSelectedFilter('vulnerabilities')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedFilter === 'vulnerabilities'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
            }`}
            title="Filter by Risks, Assumptions & Contradictions"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Fragilities ({riskCount + assumptionCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('evidence')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'evidence'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Evidence ({evidenceCount})
          </button>

          <button
            onClick={() => setSelectedFilter('assumption')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'assumption'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Assumptions ({assumptionCount})
          </button>

          <button
            onClick={() => setSelectedFilter('risk')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'risk'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Risks ({riskCount})
          </button>
        </div>

        {/* Right: Actions & Immutable Lock Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Immutable Representation Lock Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium"
            title="The graphical visual is locked to ensure systemic epistemic rigor. The user cannot drag or modify node structures."
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Locked Graph</span>
          </div>

          {/* Soundness Score Pill */}
          <button
            onClick={onOpenSoundness}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Inspect Epistemological Soundness Score Breakdown"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: soundness.hex }}
            />
            <span style={{ color: soundness.hex }}>{analysis.soundnessScore}/100</span>
            <span className="hidden lg:inline text-slate-400 font-normal">
              • {soundness.label}
            </span>
          </button>

          {/* VIP Feature: Monte Carlo Sensitivity */}
          <button
            onClick={onOpenMonteCarlo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
            title="VIP Feature: 1,000-Trial Monte Carlo Sensitivity Simulation"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Monte Carlo</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-amber-400/20 font-black uppercase text-amber-300">
              VIP
            </span>
          </button>

          {/* VIP Feature: Executive Decision Memo */}
          <button
            onClick={onOpenExecutiveMemo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
            title="VIP Feature: Board Decision Memorandum"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Exec Memo</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-indigo-400/20 font-black uppercase text-indigo-300">
              VIP
            </span>
          </button>

          {/* Adversarial Challenge Button */}
          <button
            onClick={onOpenChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stress Test</span>
            <span className="sm:hidden">Test</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 z-30 animate-in fade-in duration-100">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Copy Markdown Summary
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Download JSON File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE CANVAS (Pannable & Zoomable, Nodes are Immutable) */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing bg-[#080d1a] overflow-hidden canvas-background"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Stage Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '3200px',
            height: '2400px',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          className="pointer-events-auto"
        >
          {/* SVG Edges Layer */}
          <svg
            className="w-full h-full absolute inset-0 pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker
                id="arrow-supports"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-undermines"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
              </marker>
              <marker
                id="arrow-contradicts"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f97316" />
              </marker>
              <marker
                id="arrow-assumes"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Render Connection Curves */}
            {filteredEdges.map(edge => {
              const sourceNode = analysis.nodes.find(n => n.id === edge.source);
              const targetNode = analysis.nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode.x + NODE_WIDTH / 2;
              const y1 = sourceNode.y + NODE_HEIGHT / 2;
              const x2 = targetNode.x + NODE_WIDTH / 2;
              const y2 = targetNode.y + NODE_HEIGHT / 2;

              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx1 = x1 + dx * 0.2;
              const cy1 = y1 + dy * 0.5;
              const cx2 = x2 - dx * 0.2;
              const cy2 = y2 - dy * 0.5;

              const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

              const relationCfg = RELATION_CONFIGS[edge.relation] || RELATION_CONFIGS.supports;
              const markerId =
                `arrow-${edge.relation}` in {
                  'arrow-supports': 1,
                  'arrow-undermines': 1,
                  'arrow-contradicts': 1,
                  'arrow-assumes': 1,
                }
                  ? `arrow-${edge.relation}`
                  : 'arrow-default';

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={relationCfg.color}
                    strokeWidth={edge.strength === 'strong' ? 2 : 1.75}
                    strokeDasharray={relationCfg.dash ? '5,5' : undefined}
                    markerEnd={`url(#${markerId})`}
                    opacity={0.85}
                  />

                  {/* Relationship Label Pill */}
                  <foreignObject
                    x={midX - 48}
                    y={midY - 11}
                    width={96}
                    height={22}
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center h-full">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/90 shadow-sm border truncate"
                        style={{
                          color: relationCfg.color,
                          borderColor: `${relationCfg.color}70`,
                        }}
                      >
                        {edge.label || relationCfg.label}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Node Cards (Read-only, Click to inspect, Dragging is locked) */}
          {filteredNodes.map(node => {
            const config = NODE_CONFIGS[node.type] || NODE_CONFIGS.claim;
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={e => handleNodeClick(e, node)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${NODE_WIDTH}px`,
                  borderLeftWidth: '4px',
                  borderLeftColor: config.accentHex,
                }}
                className={`group cursor-pointer rounded-xl p-3.5 bg-slate-900 border text-slate-100 transition-all select-none ${
                  isSelected
                    ? 'ring-2 ring-indigo-400 border-slate-600 shadow-xl shadow-indigo-950/50 z-30 scale-102 bg-slate-800'
                    : 'border-slate-800 shadow-md hover:border-slate-700 hover:bg-slate-850 hover:shadow-lg z-10'
                }`}
                title={`Click to inspect critical analysis for: ${node.label}`}
              >
                {/* Node Header Row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}
                  >
                    {config.badgeLabel}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {node.confidence && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          node.confidence === 'high'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : node.confidence === 'medium'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}
                      >
                        {node.confidence}
                      </span>
                    )}

                    {node.impact === 'critical' && (
                      <span
                        className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                        title="Critical Downside Impact"
                      />
                    )}
                  </div>
                </div>

                {/* Node Title */}
                <h3 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2 mb-1.5 group-hover:text-indigo-300 transition-colors">
                  {node.label}
                </h3>

                {/* Description Snippet */}
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {node.description}
                </p>

                {/* Tags or Impact Severity Footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="capitalize font-medium text-slate-400">
                    {node.impact || 'moderate'} impact
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {node.validationStatus === 'verified' ? '✓ Verified' : 'Untested'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM FLOATING CONTROLS (Camera & Viewport Zoom) */}
      <div className="absolute bottom-5 right-5 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-md z-20">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        <button
          onClick={fitToView}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fit Full Graph to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={fitToView}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset & Center View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 4. BOTTOM LEFT LEGEND & CANONICAL GUIDELINES */}
      <div className="absolute bottom-5 left-5 z-20">
        <button
          onClick={() => setShowLegend(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Epistemological Legend</span>
        </button>

        {showLegend && (
          <div className="absolute bottom-10 left-0 w-72 p-4 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-md text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-200">Reasoning Taxonomy</span>
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                <strong className="text-slate-200">Claim:</strong>
                <span className="text-slate-400">Core decision or dilemma</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-sky-500" />
                <strong className="text-slate-200">Reason:</strong>
                <span className="text-slate-400">Supporting rationale</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <strong className="text-slate-200">Evidence:</strong>
                <span className="text-slate-400">Verified benchmark or metric</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <strong className="text-slate-200">Assumption:</strong>
                <span className="text-slate-400">Unproven presupposition</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <strong className="text-slate-200">Risk:</strong>
                <span className="text-slate-400">Downside failure hazard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-orange-500" />
                <strong className="text-slate-200">Contradiction:</strong>
                <span className="text-slate-400">Conflicting tension</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Connections with dashed lines signify fragile assumptions or adversarial undermine paths.
            </div>
          </div>
        )}
      </div>

      {/* Copy Notification Toast */}
      {copiedNotification && (
        <div className="absolute top-16 right-6 z-30 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-in fade-in duration-100">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Markdown summary copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};
