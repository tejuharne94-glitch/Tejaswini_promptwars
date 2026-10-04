import React from 'react';
import {
  X,
  Lock,
  HelpCircle,
  AlertTriangle,
  Swords,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Layers,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';
import {
  GraphNode,
  GraphEdge,
} from '../types.js';
import { NODE_CONFIGS, RELATION_CONFIGS } from '../utils/graphUtils.js';

interface NodeInspectorProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  allEdges?: GraphEdge[];
  isOpen: boolean;
  onClose: () => void;
  onSelectConnectedNode?: (node: GraphNode) => void;
  onProbeNodeWithAi?: (node: GraphNode) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  allNodes,
  allEdges = [],
  isOpen,
  onClose,
  onSelectConnectedNode,
  onProbeNodeWithAi,
}) => {
  if (!isOpen || !node) return null;

  const config = NODE_CONFIGS[node.type] || NODE_CONFIGS.claim;

  // Find incoming and outgoing edges for this node
  const outgoingEdges = allEdges.filter(e => e.source === node.id);
  const incomingEdges = allEdges.filter(e => e.target === node.id);

  const getTargetNode = (targetId: string) => allNodes.find(n => n.id === targetId);
  const getSourceNode = (sourceId: string) => allNodes.find(n => n.id === sourceId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}
          >
            {config.badgeLabel}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-200/70">
            <Lock className="w-3 h-3 text-slate-500" />
            Immutable Representation
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body: Critical Diagnostic Details (Read-Only) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
        {/* Title & Dimension Definition */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Core Node Proposition
          </span>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {node.label}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 italic">
            {config.description}
          </p>
        </div>

        {/* Detailed Explanation / Rationale */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Epistemological Rationale
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {node.description}
          </p>
        </div>

        {/* Critical Soundness Metrics */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Critical Soundness Metrics
          </span>
          <div className="grid grid-cols-2 gap-3">
            {/* Confidence Metric */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                Confidence Rating
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    node.confidence === 'high'
                      ? 'bg-emerald-500'
                      : node.confidence === 'medium'
                      ? 'bg-blue-500'
                      : node.confidence === 'low'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="font-bold text-xs capitalize text-slate-800">
                  {node.confidence || 'Medium'} Confidence
                </span>
              </div>
            </div>

            {/* Impact Metric */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                Vulnerability Impact
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    node.impact === 'critical'
                      ? 'bg-rose-500'
                      : node.impact === 'moderate'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-xs capitalize text-slate-800">
                  {node.impact || 'Moderate'} Impact
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Empirical Validation Status */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">
              Empirical Validation Status
            </span>
            <span className="font-bold text-xs text-slate-800 capitalize mt-0.5 block">
              {node.validationStatus === 'verified'
                ? 'Verified with Empirical Evidence'
                : node.validationStatus === 'untested'
                ? 'Untested Hypothesis'
                : node.validationStatus === 'questionable'
                ? 'Disputed / Questionable'
                : node.validationStatus === 'debunked'
                ? 'Refuted / Debunked'
                : 'System Default'}
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              node.validationStatus === 'verified'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : node.validationStatus === 'untested'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {node.validationStatus || 'untested'}
          </span>
        </div>

        {/* Connected Pathways (Incoming & Outgoing Reasoning Links) */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Connected Reasoning Pathways ({outgoingEdges.length + incomingEdges.length})
          </span>

          <div className="space-y-2">
            {outgoingEdges.length === 0 && incomingEdges.length === 0 ? (
              <div className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded-lg">
                Root decision node with cascading branch links.
              </div>
            ) : null}

            {/* Outgoing Links */}
            {outgoingEdges.map(edge => {
              const target = getTargetNode(edge.target);
              if (!target) return null;
              const relation = RELATION_CONFIGS[edge.relation] || RELATION_CONFIGS.supports;

              return (
                <div
                  key={edge.id}
                  onClick={() => onSelectConnectedNode && onSelectConnectedNode(target)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
                      style={{
                        backgroundColor: `${relation.color}15`,
                        color: relation.color,
                      }}
                    >
                      {edge.label || relation.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                      {target.label}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
                </div>
              );
            })}

            {/* Incoming Links */}
            {incomingEdges.map(edge => {
              const source = getSourceNode(edge.source);
              if (!source) return null;
              const relation = RELATION_CONFIGS[edge.relation] || RELATION_CONFIGS.supports;

              return (
                <div
                  key={edge.id}
                  onClick={() => onSelectConnectedNode && onSelectConnectedNode(source)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                      Influenced by:
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                      {source.label}
                    </span>
                  </div>
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
                    style={{
                      backgroundColor: `${relation.color}15`,
                      color: relation.color,
                    }}
                  >
                    {edge.label || relation.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Probe Stress-Test Trigger */}
        {onProbeNodeWithAi && (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-indigo-600" />
                Adversarial AI Probe
              </span>
              <button
                onClick={() => onProbeNodeWithAi(node)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Stress-Test Node
              </button>
            </div>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed">
              Examine potential logical fallacies, unmitigated edge-cases, or empirical vulnerabilities specific to this reasoning node.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          Graphical representation is locked & verified
        </span>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 rounded"
        >
          Done
        </button>
      </div>
    </div>
  );
};
