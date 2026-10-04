import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Swords,
  ChevronDown,
  Check,
  FileText,
  FileCode,
  Lock,
  X,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Loader2,
  Copy,
} from 'lucide-react';
import {
  GraphNode,
  GraphEdge,
  ReasoningAnalysis,
  NodeType,
  ChallengeInsight,
} from '../types.js';
import {
  NODE_CONFIGS,
  RELATION_CONFIGS,
  getSoundnessTier,
  exportAnalysisAsMarkdown,
} from '../utils/graphUtils.js';
import { api } from '../services/api.js';

interface GraphCanvasProps {
  analysis: ReasoningAnalysis;
  onNewAnalysis: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  analysis,
  onNewAnalysis,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Selected node inspection state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Challenge / Stress-test state
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeInsights, setChallengeInsights] = useState<ChallengeInsight[]>(analysis.challenges || []);
  const [activeChallengeTab, setActiveChallengeTab] = useState<'devils_advocate' | 'what_if' | 'cognitive_bias'>('devils_advocate');

  // Export & Notification state
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const NODE_WIDTH = 250;
  const NODE_HEIGHT = 130;

  // Fit graph to view on load
  const fitToView = useCallback(() => {
    if (!containerRef.current || analysis.nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xs = analysis.nodes.map(n => n.x);
    const ys = analysis.nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + NODE_WIDTH;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + NODE_HEIGHT;

    const graphWidth = maxX - minX + 120;
    const graphHeight = maxY - minY + 120;

    const scaleX = rect.width / graphWidth;
    const scaleY = rect.height / graphHeight;
    const newScale = Math.max(0.45, Math.min(1.0, Math.min(scaleX, scaleY)));

    setScale(newScale);
    setPan({
      x: (rect.width - graphWidth * newScale) / 2 - minX * newScale + 60 * newScale,
      y: (rect.height - graphHeight * newScale) / 2 - minY * newScale + 40 * newScale,
    });
  }, [analysis.nodes]);

  useEffect(() => {
    fitToView();
  }, [fitToView]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(1.6, Math.max(0.35, prev + delta)));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    handleZoom(delta);
  };

  // Background Canvas Panning (Viewing navigation only - nodes remain locked)
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (
      e.target !== containerRef.current &&
      !(e.target as HTMLElement).classList.contains('canvas-background')
    ) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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

  // Node Selection (Read-only, no dragging)
  const handleNodeClick = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    console.log('[AI Investigator] Node selected for inspection:', node.label);
    setSelectedNode(node);
  };

  // Run Stress-Test Challenge
  const handleRunStressTest = async (type: 'devils_advocate' | 'what_if' | 'cognitive_bias') => {
    setActiveChallengeTab(type);
    setChallengeLoading(true);
    setChallengeOpen(true);
    console.log('[AI Investigator] Running adversarial stress-test type:', type);

    try {
      const results = await api.challengeAnalysis({
        analysisId: analysis.id,
        challengeType: type,
      });
      setChallengeInsights(results);
      console.log('[AI Investigator] Stress-test completed with results count:', results.length);
    } catch (err: any) {
      console.error('[AI Investigator] Stress-test challenge error:', err);
    } finally {
      setChallengeLoading(false);
    }
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    const md = exportAnalysisAsMarkdown(analysis);
    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    setExportMenuOpen(false);
  };

  // Export to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reasoning-graph-${analysis.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportMenuOpen(false);
  };

  const soundness = getSoundnessTier(analysis.soundnessScore);
  const assumptions = analysis.nodes.filter(n => n.type === 'assumption');
  const risks = analysis.nodes.filter(n => n.type === 'risk');
  const evidence = analysis.nodes.filter(n => n.type === 'evidence');

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 overflow-hidden relative select-none">
      {/* 1. TOP CONTROL BAR */}
      <div className="h-14 border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md">
        {/* Left: Title & Soundness Badge */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: soundness.hex }}
            />
            <span className="font-extrabold text-sm text-slate-100" style={{ color: soundness.hex }}>
              {analysis.soundnessScore}/100
            </span>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              • {soundness.label}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <h2 className="text-xs sm:text-sm font-semibold text-slate-300 truncate max-w-sm lg:max-w-md">
            {analysis.title}
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Read-Only Status Indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-medium"
            title="Reasoning representation is locked and verified. Dragging or structural mutation is disabled."
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Locked Graph</span>
          </div>

          {/* Stress-Test Button */}
          <button
            onClick={() => handleRunStressTest('devils_advocate')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Stress Test</span>
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
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 z-30 animate-in fade-in duration-100">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Copy Markdown
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  Download JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN VISUAL CANVAS (Pannable/Zoomable, Nodes are Immutable) */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing bg-[#080d1a] overflow-hidden canvas-background"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
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
          {/* SVG Connection Lines */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrow-supports" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrow-undermines" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
              </marker>
              <marker id="arrow-contradicts" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f97316" />
              </marker>
              <marker id="arrow-assumes" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366f1" />
              </marker>
            </defs>

            {analysis.edges.map(edge => {
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
              const markerId = `arrow-${edge.relation}` in { 'arrow-supports': 1, 'arrow-undermines': 1, 'arrow-contradicts': 1, 'arrow-assumes': 1 }
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
                  <foreignObject x={midX - 44} y={midY - 10} width={88} height={20} className="pointer-events-none">
                    <div className="flex items-center justify-center h-full">
                      <span
                        className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/90 shadow-xs border truncate"
                        style={{ color: relationCfg.color, borderColor: `${relationCfg.color}70` }}
                      >
                        {edge.label || relationCfg.label}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Node Cards */}
          {analysis.nodes.map(node => {
            const config = NODE_CONFIGS[node.type] || NODE_CONFIGS.claim;
            const isSelected = selectedNode?.id === node.id;

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
                title={`Click to inspect: ${node.label}`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}
                  >
                    {config.badgeLabel}
                  </span>

                  <span className="text-[10px] text-slate-400 capitalize">
                    {node.confidence || 'medium'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
                  {node.label}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {node.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FLOATING CAMERA CONTROLS */}
      <div className="absolute bottom-5 right-5 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-md z-20">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-0.1)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        <button
          onClick={fitToView}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fit Graph to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 4. INTEGRATED NODE DETAIL SIDE DRAWER (Appears on node click) */}
      {selectedNode && (
        <div className="absolute top-14 bottom-0 right-0 w-full max-w-sm bg-slate-950 border-l border-slate-800 shadow-2xl p-5 overflow-y-auto z-30 animate-in slide-in-from-right duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                (NODE_CONFIGS[selectedNode.type] || NODE_CONFIGS.claim).badgeBg
              } ${(NODE_CONFIGS[selectedNode.type] || NODE_CONFIGS.claim).badgeText}`}
            >
              {(NODE_CONFIGS[selectedNode.type] || NODE_CONFIGS.claim).badgeLabel}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-slate-100 mb-2 leading-snug">
            {selectedNode.label}
          </h3>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
            {selectedNode.description}
          </div>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-400">Confidence:</span>
              <span className="font-semibold text-slate-200 capitalize">{selectedNode.confidence || 'Medium'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-400">Impact Level:</span>
              <span className="font-semibold text-slate-200 capitalize">{selectedNode.impact || 'Moderate'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-400">Validation:</span>
              <span className="font-semibold text-slate-200 capitalize">{selectedNode.validationStatus || 'Untested'}</span>
            </div>
          </div>

          <button
            onClick={() => handleRunStressTest('devils_advocate')}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Stress Test This Point</span>
          </button>
        </div>
      )}

      {/* 5. INTEGRATED ADVERSARIAL CHALLENGE DRAWER */}
      {challengeOpen && (
        <div className="absolute top-14 bottom-0 left-0 w-full max-w-md bg-slate-950 border-r border-slate-800 shadow-2xl p-5 overflow-y-auto z-30 animate-in slide-in-from-left duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-100">Adversarial Stress Test</h3>
            </div>
            <button
              onClick={() => setChallengeOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1.5 mb-4 p-1 bg-slate-900 rounded-lg text-xs">
            <button
              onClick={() => handleRunStressTest('devils_advocate')}
              className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors ${
                activeChallengeTab === 'devils_advocate'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Devil&apos;s Advocate
            </button>
            <button
              onClick={() => handleRunStressTest('what_if')}
              className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors ${
                activeChallengeTab === 'what_if'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              What-If Risks
            </button>
            <button
              onClick={() => handleRunStressTest('cognitive_bias')}
              className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors ${
                activeChallengeTab === 'cognitive_bias'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Biases
            </button>
          </div>

          {challengeLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-6 h-6 text-rose-500 animate-spin mb-2" />
              <span className="text-xs text-slate-400">Synthesizing adversarial stress-tests...</span>
            </div>
          ) : challengeInsights.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No critical vulnerabilities identified for this tab.
            </div>
          ) : (
            <div className="space-y-3">
              {challengeInsights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-100">{insight.title}</span>
                    <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800/60">
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-2">
                    {insight.description}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${insight.title}\n\n${insight.description}`);
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2000);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Insight</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Copy Notification Toast */}
      {copiedNotification && (
        <div className="absolute top-16 right-6 z-40 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-in fade-in duration-100">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};
