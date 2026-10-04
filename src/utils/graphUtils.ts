import { NodeType, RelationType, GraphNode, GraphEdge, ReasoningAnalysis } from '../types.js';

export interface NodeTypeConfig {
  label: string;
  badgeLabel: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  badgeText: string;
  accentHex: string;
  iconName: string;
  description: string;
}

export const NODE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  claim: {
    label: 'Decision / Claim',
    badgeLabel: 'CLAIM',
    bgClass: 'bg-white',
    borderClass: 'border-indigo-600',
    textClass: 'text-indigo-950',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    accentHex: '#4f46e5',
    iconName: 'Target',
    description: 'The primary decision, claim, or strategic dilemma under scrutiny.',
  },
  reason: {
    label: 'Reason',
    badgeLabel: 'REASON',
    bgClass: 'bg-white',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-950',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    accentHex: '#2563eb',
    iconName: 'CheckCircle2',
    description: 'A primary rationale or affirmative justification.',
  },
  evidence: {
    label: 'Evidence',
    badgeLabel: 'EVIDENCE',
    bgClass: 'bg-white',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-950',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    accentHex: '#059669',
    iconName: 'Database',
    description: 'Empirical data, verified benchmarks, or observed precedent.',
  },
  assumption: {
    label: 'Assumption',
    badgeLabel: 'ASSUMPTION',
    bgClass: 'bg-white',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-950',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    accentHex: '#d97706',
    iconName: 'HelpCircle',
    description: 'An unproven presupposition that must hold true for the reasoning to stand.',
  },
  inference: {
    label: 'Inference',
    badgeLabel: 'INFERENCE',
    bgClass: 'bg-white',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-950',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    accentHex: '#7c3aed',
    iconName: 'GitFork',
    description: 'A deduced intermediate conclusion linking premises together.',
  },
  risk: {
    label: 'Risk',
    badgeLabel: 'RISK',
    bgClass: 'bg-white',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-950',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    accentHex: '#dc2626',
    iconName: 'AlertTriangle',
    description: 'Potential failure point, vulnerability, or downside hazard.',
  },
  contradiction: {
    label: 'Contradiction',
    badgeLabel: 'CONTRADICTION',
    bgClass: 'bg-white',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-950',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    accentHex: '#ea580c',
    iconName: 'Split',
    description: 'Direct friction between conflicting claims, constraints, or goals.',
  },
  missing_info: {
    label: 'Missing Information',
    badgeLabel: 'MISSING INFO',
    bgClass: 'bg-white',
    borderClass: 'border-sky-500',
    textClass: 'text-sky-950',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    accentHex: '#0284c7',
    iconName: 'Search',
    description: 'Unknown data benchmark needed to validate the path before execution.',
  },
  alternative: {
    label: 'Alternative',
    badgeLabel: 'ALTERNATIVE',
    bgClass: 'bg-white',
    borderClass: 'border-teal-500',
    textClass: 'text-teal-950',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    accentHex: '#0d9488',
    iconName: 'Compass',
    description: 'A competing option, hedged hybrid, or staged fallback path.',
  },
  consequence: {
    label: 'Consequence',
    badgeLabel: 'CONSEQUENCE',
    bgClass: 'bg-white',
    borderClass: 'border-slate-400',
    textClass: 'text-slate-900',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    accentHex: '#475569',
    iconName: 'ArrowDownRight',
    description: 'Downstream second-order outcome or delayed ripple effect.',
  },
};

export const RELATION_CONFIGS: Record<RelationType, { label: string; color: string; dash?: boolean }> = {
  supports: { label: 'supports', color: '#059669' },
  depends_on: { label: 'depends on', color: '#0284c7' },
  undermines: { label: 'undermines', color: '#dc2626', dash: true },
  leads_to: { label: 'leads to', color: '#4f46e5' },
  contradicts: { label: 'contradicts', color: '#ea580c', dash: true },
  alternates: { label: 'alternative to', color: '#0d9488' },
  assumes: { label: 'assumes', color: '#d97706', dash: true },
};

export function getSoundnessTier(score: number): { label: string; colorClass: string; hex: string; description: string } {
  if (score >= 80) {
    return {
      label: 'Solid Grounding',
      colorClass: 'text-emerald-700',
      hex: '#059669',
      description: 'High evidence backing, tested assumptions, and low unmitigated risk exposure.',
    };
  }
  if (score >= 60) {
    return {
      label: 'Moderately Sound',
      colorClass: 'text-blue-700',
      hex: '#2563eb',
      description: 'Reasonable logical coherence, but contains pivotal untested assumptions requiring validation.',
    };
  }
  if (score >= 40) {
    return {
      label: 'Vulnerable',
      colorClass: 'text-amber-700',
      hex: '#d97706',
      description: 'Significant exposure to unverified premises, high-impact risks, or timing tensions.',
    };
  }
  return {
    label: 'Critical Fragility',
    colorClass: 'text-rose-700',
    hex: '#dc2626',
    description: 'Dominated by wishful assumptions, unaddressed contradictions, and severe failure hazards.',
  };
}

// Auto-layout algorithm to distribute nodes cleanly in layers
export function autoLayoutNodes(nodes: GraphNode[], edges: GraphEdge[], canvasWidth = 1100): GraphNode[] {
  const tiers: Record<number, GraphNode[]> = {
    0: [], // Claims (top)
    1: [], // Reasons & Inferences
    2: [], // Evidence, Assumptions, Risks, Contradictions
    3: [], // Alternatives, Missing Info
    4: [], // Consequences
  };

  nodes.forEach(node => {
    switch (node.type) {
      case 'claim':
        tiers[0].push(node);
        break;
      case 'reason':
      case 'inference':
        tiers[1].push(node);
        break;
      case 'evidence':
      case 'assumption':
      case 'risk':
      case 'contradiction':
        tiers[2].push(node);
        break;
      case 'alternative':
      case 'missing_info':
        tiers[3].push(node);
        break;
      case 'consequence':
      default:
        tiers[4].push(node);
        break;
    }
  });

  const rowY = [60, 210, 370, 530, 680];
  const positioned: GraphNode[] = [];

  Object.entries(tiers).forEach(([tierIndexStr, rowNodes]) => {
    const tierIndex = parseInt(tierIndexStr, 10);
    const y = rowY[tierIndex] || 700;
    const count = rowNodes.length;

    if (count === 0) return;

    const spacing = Math.min(270, (canvasWidth - 140) / Math.max(count, 1));
    const startX = (canvasWidth - (count - 1) * spacing) / 2;

    rowNodes.forEach((node, idx) => {
      positioned.push({
        ...node,
        x: Math.round(startX + idx * spacing),
        y: Math.round(y),
      });
    });
  });

  return positioned;
}

export function exportAnalysisAsMarkdown(analysis: ReasoningAnalysis): string {
  const soundness = getSoundnessTier(analysis.soundnessScore);
  let md = `# Reasoning Graph: ${analysis.title}\n\n`;
  md += `> "Make Your Thinking Visible"\n\n`;
  md += `**Category:** ${analysis.category || 'General'}\n`;
  md += `**Date:** ${new Date(analysis.createdAt).toLocaleDateString()}\n`;
  md += `**Soundness Score:** ${analysis.soundnessScore}/100 (${soundness.label})\n\n`;

  md += `## 1. The Core Decision / Dilemma\n`;
  md += `${analysis.decisionText}\n\n`;
  if (analysis.context) md += `**Context:** ${analysis.context}\n\n`;
  if (analysis.constraints) md += `**Constraints:** ${analysis.constraints}\n\n`;

  md += `## 2. Diagnostic Summary\n`;
  md += `**Summary:** ${analysis.summary}\n\n`;
  md += `**Key Diagnostic Takeaway:** ${analysis.keyTakeaway}\n\n`;

  md += `### Soundness Index Breakdown\n`;
  md += `- Evidence Grounding: ${analysis.breakdown.evidenceScore}/100\n`;
  md += `- Assumption Fragility: ${analysis.breakdown.assumptionFragility}/100 (lower fragility is better)\n`;
  md += `- Risk Exposure: ${analysis.breakdown.riskExposure}/100 (lower is better)\n`;
  md += `- Logical Coherence: ${analysis.breakdown.coherenceScore}/100\n\n`;

  md += `## 3. Reasoning Nodes (${analysis.nodes.length} Elements)\n\n`;
  const grouped: Record<string, GraphNode[]> = {};
  analysis.nodes.forEach(n => {
    grouped[n.type] = grouped[n.type] || [];
    grouped[n.type].push(n);
  });

  Object.entries(grouped).forEach(([type, items]) => {
    const cfg = NODE_CONFIGS[type as NodeType] || { label: type };
    md += `### ${cfg.label} (${items.length})\n`;
    items.forEach(item => {
      md += `- **${item.label}** [Confidence: ${item.confidence || 'untested'}, Impact: ${item.impact || 'moderate'}]\n`;
      md += `  ${item.description}\n`;
    });
    md += `\n`;
  });

  if (analysis.detectedBiases && analysis.detectedBiases.length > 0) {
    md += `## 4. Detected Cognitive Biases & Blind Spots\n\n`;
    analysis.detectedBiases.forEach(b => {
      md += `### ${b.biasName}\n`;
      md += `${b.description}\n`;
      md += `**Recommendation:** ${b.recommendation}\n\n`;
    });
  }

  if (analysis.challenges && analysis.challenges.length > 0) {
    md += `## 5. Adversarial Stress-Tests & Counterarguments\n\n`;
    analysis.challenges.forEach(c => {
      md += `- **${c.title}** [${c.type.toUpperCase()}]\n  ${c.description}\n`;
    });
    md += `\n`;
  }

  return md;
}
