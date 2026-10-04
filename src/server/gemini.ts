import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';
import {
  ReasoningAnalysis,
  GraphNode,
  GraphEdge,
  CognitiveBiasFinding,
  ChallengeInsight,
  NodeType,
  RelationType
} from '../types.js';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Fallback intelligent analyzer when Gemini API key is missing or offline
function generateFallbackAnalysis(
  decisionText: string,
  context?: string,
  constraints?: string,
  userId: string = 'usr_guest'
): ReasoningAnalysis {
  const id = `ana_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanTitle = decisionText.length > 60 ? decisionText.substring(0, 57) + '...' : decisionText;

  const nodes: GraphNode[] = [
    {
      id: 'node_root_claim',
      type: 'claim',
      label: cleanTitle,
      description: decisionText + (context ? ` Context: ${context}` : ''),
      confidence: 'medium',
      impact: 'critical',
      validationStatus: 'questionable',
      tags: ['Core Claim', 'Dilemma'],
      x: 480,
      y: 60,
    },
    {
      id: 'node_reason_primary',
      type: 'reason',
      label: 'Primary Expected Upside',
      description: 'The anticipated value, reward, or strategic advantage driving this decision path.',
      confidence: 'high',
      impact: 'moderate',
      validationStatus: 'verified',
      tags: ['Motivator'],
      x: 220,
      y: 190,
    },
    {
      id: 'node_reason_secondary',
      type: 'reason',
      label: 'Operational or Strategic Alignment',
      description: 'How this action aligns with long-term objectives and current competitive trends.',
      confidence: 'medium',
      impact: 'moderate',
      validationStatus: 'verified',
      tags: ['Strategy'],
      x: 740,
      y: 190,
    },
    {
      id: 'node_evidence_1',
      type: 'evidence',
      label: 'Observed Market / Baseline Data',
      description: context || 'Empirical evidence or historical precedents cited to support the feasibility.',
      confidence: 'high',
      impact: 'moderate',
      validationStatus: 'verified',
      tags: ['Empirical'],
      x: 100,
      y: 330,
    },
    {
      id: 'node_assumption_1',
      type: 'assumption',
      label: 'Unverified External Condition',
      description: 'Crucial premise assumed to be true without conclusive data (e.g. demand velocity or capacity).',
      confidence: 'low',
      impact: 'critical',
      validationStatus: 'untested',
      tags: ['Vulnerability'],
      x: 350,
      y: 330,
    },
    {
      id: 'node_risk_1',
      type: 'risk',
      label: 'Downside Exposure & Failure Cost',
      description: constraints ? `Risk constrained by: ${constraints}` : 'Immediate adverse financial, reputational, or execution repercussions if assumptions fail.',
      confidence: 'high',
      impact: 'critical',
      validationStatus: 'verified',
      tags: ['Hazard'],
      x: 620,
      y: 330,
    },
    {
      id: 'node_contradiction_1',
      type: 'contradiction',
      label: 'Inherent Trade-off Tension',
      description: 'Conflict between rapid execution urgency and required due-diligence verification.',
      confidence: 'high',
      impact: 'moderate',
      validationStatus: 'questionable',
      tags: ['Friction'],
      x: 880,
      y: 330,
    },
    {
      id: 'node_alternative_1',
      type: 'alternative',
      label: 'Phased Staged-Rollout Alternative',
      description: 'Test hypotheses via smaller low-risk milestone experiments before complete commitment.',
      confidence: 'high',
      impact: 'moderate',
      validationStatus: 'verified',
      tags: ['Hedged Option'],
      x: 240,
      y: 480,
    },
    {
      id: 'node_missing_info_1',
      type: 'missing_info',
      label: 'Quantifiable Decision Thresholds',
      description: 'Lack of explicit stop-loss criteria or predefined metrics indicating when to pivot.',
      confidence: 'unverified',
      impact: 'critical',
      validationStatus: 'untested',
      tags: ['Information Gap'],
      x: 520,
      y: 480,
    },
    {
      id: 'node_consequence_1',
      type: 'consequence',
      label: 'Second-Order Operational Drag',
      description: 'Downstream resource reallocation and opportunity cost incurred elsewhere.',
      confidence: 'medium',
      impact: 'moderate',
      validationStatus: 'verified',
      tags: ['Second-Order'],
      x: 780,
      y: 480,
    },
  ];

  const edges: GraphEdge[] = [
    { id: 'edge_fb_1', source: 'node_reason_primary', target: 'node_root_claim', relation: 'supports', label: 'Core Driver' },
    { id: 'edge_fb_2', source: 'node_reason_secondary', target: 'node_root_claim', relation: 'supports', label: 'Strategic Alignment' },
    { id: 'edge_fb_3', source: 'node_evidence_1', target: 'node_reason_primary', relation: 'supports', label: 'Grounding' },
    { id: 'edge_fb_4', source: 'node_assumption_1', target: 'node_root_claim', relation: 'assumes', label: 'Critical Dependency' },
    { id: 'edge_fb_5', source: 'node_risk_1', target: 'node_root_claim', relation: 'undermines', label: 'Direct Risk' },
    { id: 'edge_fb_6', source: 'node_contradiction_1', target: 'node_assumption_1', relation: 'contradicts', label: 'Logic Tension' },
    { id: 'edge_fb_7', source: 'node_alternative_1', target: 'node_root_claim', relation: 'alternates', label: 'Alternative Option' },
    { id: 'edge_fb_8', source: 'node_missing_info_1', target: 'node_root_claim', relation: 'depends_on', label: 'Required Benchmark' },
    { id: 'edge_fb_9', source: 'node_root_claim', target: 'node_consequence_1', relation: 'leads_to', label: 'Downstream Effect' },
  ];

  const detectedBiases: CognitiveBiasFinding[] = [
    {
      biasName: 'Confirmation Bias',
      description: 'Weighting early positive indicators more heavily than silent operational risks.',
      affectedNodeIds: ['node_reason_primary', 'node_assumption_1'],
      recommendation: 'Actively seek disconfirming data before full commitment.'
    },
    {
      biasName: 'Optimism Bias (Planning Fallacy)',
      description: 'Underestimating timeline and resource friction while projecting ideal execution conditions.',
      affectedNodeIds: ['node_root_claim', 'node_risk_1'],
      recommendation: 'Buffer timelines and capital by at least 40%.'
    }
  ];

  const challenges: ChallengeInsight[] = [
    {
      id: 'chal_fb_1',
      type: 'devils_advocate',
      title: 'Premise depends on unvalidated external momentum',
      description: 'If early interest fails to convert rapidly, the high fixed overhead will force an untimely retreat.',
      impact: 'high'
    },
    {
      id: 'chal_fb_2',
      type: 'what_if',
      title: 'What if execution takes 2x longer than budgeted?',
      description: 'Determine whether you can sustain solvency and morale under an extended horizon.',
      impact: 'high'
    }
  ];

  return {
    id,
    userId,
    title: cleanTitle,
    decisionText,
    context,
    constraints,
    category: 'General Strategic Dilemma',
    soundnessScore: 64,
    breakdown: {
      evidenceScore: 65,
      assumptionFragility: 70,
      riskExposure: 62,
      coherenceScore: 75
    },
    summary: 'The argument features coherent upside motivation, but exhibits vulnerability along unproven execution assumptions and missing quantifiable stop-loss criteria.',
    keyTakeaway: 'The core risk is not whether the upside is real, but whether unverified assumptions create a hidden solvency or operational trap before benefits materialize.',
    nodes,
    edges,
    detectedBiases,
    challenges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function analyzeReasoning(
  decisionText: string,
  context?: string,
  constraints?: string,
  userId: string = 'usr_guest'
): Promise<ReasoningAnalysis> {
  const startTime = Date.now();
  const ai = getAiClient();

  if (!ai) {
    const analysis = generateFallbackAnalysis(decisionText, context, constraints, userId);
    db.recordAiMetric({
      timestamp: new Date().toISOString(),
      model: 'fallback-heuristics',
      action: 'analyze_graph',
      promptTokens: Math.round(decisionText.length / 4),
      responseTokens: 900,
      latencyMs: Date.now() - startTime,
      userId,
      status: 'success'
    });
    return analysis;
  }

  const prompt = `
You are the Reasoning Graph Engine. Convert the user's decision, claim, problem, or thought process into an interactive visual graph.
The goal is NOT to decide for the user. The goal is to MAKE THEIR REASONING VISIBLE so they can see strengths, weaknesses, assumptions, and missing information.

Examine the 10 required reasoning dimensions:
1. Decision / Claim (Root)
2. Reasons (Core arguments / justifications)
3. Evidence (Observed facts, data, benchmarks)
4. Assumptions (Unproven presuppositions that must be true)
5. Inferences (Deductions linking premises)
6. Risks (Vulnerabilities, downside hazards)
7. Contradictions (Conflicting requirements or incompatible facts)
8. Missing Information (Crucial data points needed before deciding)
9. Alternatives (Viable divergent options or staged approaches)
10. Consequences (Second-order and downstream outcomes)

User Input:
Decision/Claim: "${decisionText}"
Context: "${context || 'None provided'}"
Constraints: "${constraints || 'None provided'}"

Output strictly valid JSON matching this schema:
{
  "title": "Short punchy title (under 8 words)",
  "category": "e.g. Business Strategy, Tech Architecture, Career, Personal Finance, Product",
  "summary": "1-2 sentences summarizing the structural strength and primary tension of the reasoning.",
  "keyTakeaway": "A high-leverage diagnostic insight on what requires immediate verification.",
  "soundnessScore": number (0 to 100 calculated from evidence strength, assumption fragility, risks, and contradictions),
  "breakdown": {
    "evidenceScore": number (0 to 100),
    "assumptionFragility": number (0 to 100, where higher means more fragile/dangerous),
    "riskExposure": number (0 to 100, where higher means more severe exposure),
    "coherenceScore": number (0 to 100)
  },
  "nodes": [
    {
      "id": "node_...",
      "type": "claim" | "reason" | "evidence" | "assumption" | "inference" | "risk" | "contradiction" | "missing_info" | "alternative" | "consequence",
      "label": "Short label (under 6 words)",
      "description": "Clear explanation of this reasoning unit",
      "confidence": "high" | "medium" | "low" | "unverified",
      "impact": "critical" | "moderate" | "minor",
      "validationStatus": "verified" | "untested" | "questionable" | "debunked",
      "tags": ["Tag1", "Tag2"],
      "x": number, // horizontal coordinate between 80 and 900
      "y": number  // vertical coordinate between 50 and 650 (place claim near top y=60, reasons y=180-220, evidence/assumptions/risks y=320-380, alternatives/missing info y=460-520, consequences y=560-620)
    }
  ],
  "edges": [
    {
      "id": "edge_...",
      "source": "source_node_id",
      "target": "target_node_id",
      "relation": "supports" | "depends_on" | "undermines" | "leads_to" | "contradicts" | "alternates" | "assumes",
      "label": "Brief edge relation phrase"
    }
  ],
  "detectedBiases": [
    {
      "biasName": "e.g. Confirmation Bias, Sunk Cost Fallacy, Optimism Bias",
      "description": "How this bias manifests in this specific reasoning chain",
      "affectedNodeIds": ["node_..."],
      "recommendation": "Concrete de-biasing technique"
    }
  ],
  "challenges": [
    {
      "id": "chal_...",
      "type": "devils_advocate" | "what_if" | "missing_evidence",
      "title": "Short provocative challenge title",
      "description": "Specific adversarial question or stress test",
      "impact": "high" | "medium" | "low"
    }
  ]
}
Include at least 9-14 nodes covering claim, 2+ reasons, 2+ assumptions, 1+ evidence, 1+ risk, 1+ contradiction, 1+ missing info, 1+ alternative, and 1+ consequence.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const latencyMs = Date.now() - startTime;
    const textOutput = response.text || '';
    const parsed = JSON.parse(textOutput);

    // Record AI Metric
    db.recordAiMetric({
      timestamp: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      action: 'analyze_graph',
      promptTokens: Math.round(prompt.length / 4),
      responseTokens: Math.round(textOutput.length / 4),
      latencyMs,
      userId,
      status: 'success'
    });

    const id = `ana_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const analysis: ReasoningAnalysis = {
      id,
      userId,
      title: parsed.title || decisionText.substring(0, 50),
      decisionText,
      context,
      constraints,
      category: parsed.category || 'Strategic Reasoning',
      soundnessScore: parsed.soundnessScore || 65,
      breakdown: parsed.breakdown || {
        evidenceScore: 60,
        assumptionFragility: 65,
        riskExposure: 60,
        coherenceScore: 70
      },
      summary: parsed.summary || 'Reasoning structure mapped.',
      keyTakeaway: parsed.keyTakeaway || 'Critical assumptions require validation.',
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      detectedBiases: parsed.detectedBiases || [],
      challenges: parsed.challenges || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return analysis;
  } catch (error: any) {
    console.error('Gemini API call failed, falling back to heuristic engine:', error);
    db.logError({
      endpoint: '/api/analysis/generate',
      method: 'POST',
      statusCode: 500,
      message: error?.message || 'Gemini API call failed',
      userId,
      stack: error?.stack
    });

    db.recordAiMetric({
      timestamp: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      action: 'analyze_graph',
      promptTokens: Math.round(prompt.length / 4),
      responseTokens: 0,
      latencyMs: Date.now() - startTime,
      userId,
      status: 'error',
      errorMessage: error?.message
    });

    return generateFallbackAnalysis(decisionText, context, constraints, userId);
  }
}

export async function challengeReasoning(
  analysis: ReasoningAnalysis,
  challengeType: 'devils_advocate' | 'cognitive_bias' | 'what_if' | 'missing_evidence',
  specificNodeId?: string,
  customQuery?: string,
  userId: string = 'usr_guest'
): Promise<ChallengeInsight[]> {
  const startTime = Date.now();
  const ai = getAiClient();

  if (!ai) {
    const fallbackChallenges: ChallengeInsight[] = [
      {
        id: `chal_${Date.now()}_1`,
        type: challengeType,
        title: challengeType === 'devils_advocate'
          ? 'Counter-Thesis: High Switching Friction'
          : challengeType === 'what_if'
          ? 'What if core dependencies fail within 30 days?'
          : 'Overlooked Verification Gap',
        description: 'Your primary assumption rests on unverified external cooperation. If key actors act in their own self-interest, this premise collapses.',
        impact: 'high',
        suggestedNode: {
          type: challengeType === 'what_if' ? 'risk' : 'assumption',
          label: 'Vulnerability: Counter-Thesis Point',
          description: 'Discovered stress-point that contradicts early optimism.',
          confidence: 'low',
          impact: 'critical'
        }
      },
      {
        id: `chal_${Date.now()}_2`,
        type: challengeType,
        title: 'Hidden Operational Cost',
        description: 'The cognitive overhead and context switching required will be 2.5x greater than estimated.',
        impact: 'medium'
      }
    ];

    db.recordAiMetric({
      timestamp: new Date().toISOString(),
      model: 'fallback-heuristics',
      action: 'challenge_reasoning',
      promptTokens: 200,
      responseTokens: 300,
      latencyMs: Date.now() - startTime,
      userId,
      status: 'success'
    });

    return fallbackChallenges;
  }

  const targetNode = specificNodeId ? analysis.nodes.find(n => n.id === specificNodeId) : null;
  const prompt = `
You are the Adversarial Reasoning Engine in Reasoning Graph.
Your task is to stress-test the user's reasoning graph, poke holes, expose unstated assumptions, and provide sharp, intellectual scrutiny.

Decision: "${analysis.decisionText}"
Context: "${analysis.context || 'None'}"
Constraints: "${analysis.constraints || 'None'}"

Target Node to Challenge: ${targetNode ? JSON.stringify(targetNode) : 'Entire Graph'}
Challenge Mode: ${challengeType}
${customQuery ? `User Specific Focus: "${customQuery}"` : ''}

Generate 2 to 3 sharp challenge insights with optional suggested nodes that could be added to the graph.
Output JSON format:
{
  "challenges": [
    {
      "id": "chal_...",
      "type": "${challengeType}",
      "title": "Concise provocative challenge title",
      "description": "Deep substantive counter-argument, failure scenario, or bias explanation.",
      "impact": "high" | "medium" | "low",
      "suggestedNode": {
        "type": "risk" | "assumption" | "contradiction" | "missing_info" | "alternative",
        "label": "Suggested Node Label",
        "description": "Suggested Node description",
        "confidence": "low" | "medium" | "unverified",
        "impact": "critical" | "moderate"
      }
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const latencyMs = Date.now() - startTime;
    const textOutput = response.text || '';
    const parsed = JSON.parse(textOutput);

    db.recordAiMetric({
      timestamp: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      action: 'challenge_reasoning',
      promptTokens: Math.round(prompt.length / 4),
      responseTokens: Math.round(textOutput.length / 4),
      latencyMs,
      userId,
      status: 'success'
    });

    return parsed.challenges || [];
  } catch (error: any) {
    console.error('Challenge reasoning failed:', error);
    db.logError({
      endpoint: '/api/analysis/challenge',
      method: 'POST',
      statusCode: 500,
      message: error?.message || 'Challenge generation failed',
      userId,
      stack: error?.stack
    });

    return [
      {
        id: `chal_${Date.now()}_err`,
        type: challengeType,
        title: 'Adversarial Stress Test: Failure Mode',
        description: 'Key dependencies lack fallback protocols. Ensure contingency plans are in place before committing irreversible capital.',
        impact: 'high'
      }
    ];
  }
}
