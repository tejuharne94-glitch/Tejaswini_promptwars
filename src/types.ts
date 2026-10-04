export type NodeType =
  | 'claim'
  | 'reason'
  | 'evidence'
  | 'assumption'
  | 'inference'
  | 'risk'
  | 'contradiction'
  | 'missing_info'
  | 'alternative'
  | 'consequence';

export type RelationType =
  | 'supports'
  | 'depends_on'
  | 'undermines'
  | 'leads_to'
  | 'contradicts'
  | 'alternates'
  | 'assumes';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';
export type ImpactLevel = 'critical' | 'moderate' | 'minor';
export type ValidationStatus = 'verified' | 'untested' | 'questionable' | 'debunked';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  confidence: ConfidenceLevel;
  impact?: ImpactLevel;
  validationStatus?: ValidationStatus;
  tags?: string[];
  x: number;
  y: number;
  // Metadata for deep analysis
  counterArgument?: string;
  suggestedAction?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: RelationType;
  label?: string;
  strength?: 'strong' | 'moderate' | 'tenuous';
}

export interface SoundnessBreakdown {
  evidenceScore: number;       // 0 - 100: empirical grounding
  assumptionFragility: number; // 0 - 100: untested assumptions (lower fragility is better)
  riskExposure: number;        // 0 - 100: unaddressed risks (lower is better)
  coherenceScore: number;      // 0 - 100: logical consistency & low contradiction
}

export interface CognitiveBiasFinding {
  biasName: string;
  description: string;
  affectedNodeIds: string[];
  recommendation: string;
}

export interface ChallengeInsight {
  id: string;
  type: 'devils_advocate' | 'cognitive_bias' | 'what_if' | 'missing_evidence';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestedNode?: Partial<GraphNode>;
  suggestedEdge?: Partial<GraphEdge>;
}

export interface ReasoningAnalysis {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;
  decisionText: string;
  context?: string;
  constraints?: string;
  category?: string;
  soundnessScore: number;
  breakdown: SoundnessBreakdown;
  summary: string;
  keyTakeaway: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  detectedBiases: CognitiveBiasFinding[];
  challenges: ChallengeInsight[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  plan?: 'free' | 'pro' | 'vip';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export interface AiMetric {
  id: string;
  timestamp: string;
  model: string;
  action: 'analyze_graph' | 'challenge_reasoning' | 'expand_node' | 'bias_audit';
  promptTokens: number;
  responseTokens: number;
  latencyMs: number;
  userId?: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  userId?: string;
  stack?: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  totalAiCalls: number;
  totalTokensUsed: number;
  avgLatencyMs: number;
  errorCount: number;
  serverUptimeSeconds: number;
  nodeVersion: string;
  memoryUsageMb: number;
}
