import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  ReasoningAnalysis,
  AiMetric,
  SystemErrorLog,
  SystemStats,
  GraphNode,
  GraphEdge
} from '../types.js';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

interface StoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  analyses: ReasoningAnalysis[];
  aiMetrics: AiMetric[];
  errorLogs: SystemErrorLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');
const startTime = Date.now();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Initial seed data
const SEED_USERS: StoredUser[] = [
  (() => {
    const salt = generateSalt();
    return {
      id: 'usr_admin_default',
      email: 'admin@reasoninggraph.internal',
      name: 'System Administrator',
      role: 'admin' as const,
      status: 'active' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      passwordHash: hashPassword('Admin@Reasoning2026!', salt),
      salt,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  })(),
  (() => {
    const salt = generateSalt();
    return {
      id: 'usr_demo_user',
      email: 'demo@reasoninggraph.com',
      name: 'Elena Rostova',
      role: 'user' as const,
      status: 'active' as const,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      passwordHash: hashPassword('User@Reasoning2026!', salt),
      salt,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  })(),
  (() => {
    const salt = generateSalt();
    return {
      id: 'usr_marcus_v',
      email: 'marcus.vance@techventures.io',
      name: 'Marcus Vance',
      role: 'user' as const,
      status: 'active' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      passwordHash: hashPassword('User@Reasoning2026!', salt),
      salt,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    };
  })(),
];

const SEED_ANALYSES: ReasoningAnalysis[] = [
  {
    id: 'ana_startup_pivot',
    userId: 'usr_demo_user',
    userEmail: 'demo@reasoninggraph.com',
    title: 'Quit VP Role to Bootstrap an AI Workflow Platform',
    decisionText: 'Should I resign from my VP of Product position at Series B firm to self-fund and bootstrap an AI agent workflow tool for legal compliance?',
    context: 'Have 18 months personal runway ($140k liquid). Current salary $210k. 8 years domain knowledge in legal tech.',
    constraints: 'Must reach cash-flow break-even within 14 months without venture capital dilution.',
    category: 'Career & Entrepreneurship',
    soundnessScore: 68,
    breakdown: {
      evidenceScore: 72,
      assumptionFragility: 65,
      riskExposure: 58,
      coherenceScore: 84
    },
    summary: 'The rationale displays strong domain alignment and runway discipline, but rests on unverified conversion velocity and underestimates sales-cycle length in enterprise legal departments.',
    keyTakeaway: 'High domain expertise offsets product execution risk, but procurement cycles in legal tech typically exceed 6-9 months, putting 14-month solvency under acute strain.',
    nodes: [
      {
        id: 'node_claim_1',
        type: 'claim',
        label: 'Resign and Bootstrap Legal AI Tool',
        description: 'Leave high-paying VP role immediately to build and launch an autonomous compliance agent.',
        confidence: 'medium',
        impact: 'critical',
        validationStatus: 'questionable',
        tags: ['Decision', 'Career'],
        x: 450,
        y: 60
      },
      {
        id: 'node_reason_1',
        type: 'reason',
        label: 'Unmatched 8-Yr Domain Knowledge',
        description: 'Deep understanding of legal workflow pain points and established network of 40+ general counsels.',
        confidence: 'high',
        impact: 'moderate',
        validationStatus: 'verified',
        tags: ['Advantage'],
        x: 200,
        y: 190
      },
      {
        id: 'node_reason_2',
        type: 'reason',
        label: 'Rapid GenAI Architecture Capabilities',
        description: 'Modern LLM APIs enable single-engineer multi-agent development previously requiring a team of 10.',
        confidence: 'high',
        impact: 'moderate',
        validationStatus: 'verified',
        tags: ['Technology'],
        x: 700,
        y: 190
      },
      {
        id: 'node_evidence_1',
        type: 'evidence',
        label: '$140k Liquid Runway (18 Mo)',
        description: 'Verified cash reserve providing $7,700/mo personal burn cushion.',
        confidence: 'high',
        impact: 'critical',
        validationStatus: 'verified',
        tags: ['Financial'],
        x: 80,
        y: 330
      },
      {
        id: 'node_assumption_1',
        type: 'assumption',
        label: 'Warm Contacts Will Convert to Paid Pilots',
        description: 'Assuming warm friendly conversations with corporate counsels will quickly translate to signed commercial contracts.',
        confidence: 'low',
        impact: 'critical',
        validationStatus: 'untested',
        tags: ['Sales Risk'],
        x: 320,
        y: 330
      },
      {
        id: 'node_risk_1',
        type: 'risk',
        label: 'Enterprise Security & SOC2 Lockout',
        description: 'Enterprise legal teams require SOC2 Type II, ISO27001, and vendor risk reviews taking 4-9 months.',
        confidence: 'high',
        impact: 'critical',
        validationStatus: 'verified',
        tags: ['Security', 'Compliance'],
        x: 580,
        y: 330
      },
      {
        id: 'node_contradiction_1',
        type: 'contradiction',
        label: 'Fast Runway vs 9-Month Legal Procurement',
        description: '14-month profitability target directly clashes with typical 6-12 month B2B legal procurement cycles.',
        confidence: 'high',
        impact: 'critical',
        validationStatus: 'questionable',
        tags: ['Timeline'],
        x: 820,
        y: 330
      },
      {
        id: 'node_alternative_1',
        type: 'alternative',
        label: 'Build MVP Nights/Weekends & Pre-sell',
        description: 'Retain VP position until securing 2 binding letters of intent (LOIs) with paid upfront pilot deposits.',
        confidence: 'high',
        impact: 'moderate',
        validationStatus: 'verified',
        tags: ['De-risked Path'],
        x: 220,
        y: 470
      },
      {
        id: 'node_missing_info_1',
        type: 'missing_info',
        label: 'Customer Willingness-To-Pay Benchmark',
        description: 'No empirical validation yet on whether boutique law firms will pay $500/mo or $5,000/mo.',
        confidence: 'unverified',
        impact: 'critical',
        validationStatus: 'untested',
        tags: ['Pricing'],
        x: 620,
        y: 470
      },
      {
        id: 'node_consequence_1',
        type: 'consequence',
        label: 'Career Opportunity Cost & Equity Loss',
        description: 'Forfeits ~$90k in unvested Series B stock options and stable executive compensation trajectory.',
        confidence: 'high',
        impact: 'moderate',
        validationStatus: 'verified',
        tags: ['Cost'],
        x: 450,
        y: 580
      }
    ],
    edges: [
      { id: 'edge_1', source: 'node_reason_1', target: 'node_claim_1', relation: 'supports', label: 'Domain Edge' },
      { id: 'edge_2', source: 'node_reason_2', target: 'node_claim_1', relation: 'supports', label: 'Tech Feasibility' },
      { id: 'edge_3', source: 'node_evidence_1', target: 'node_reason_1', relation: 'supports', label: 'Financial Backing' },
      { id: 'edge_4', source: 'node_assumption_1', target: 'node_claim_1', relation: 'assumes', label: 'Relies Upon' },
      { id: 'edge_5', source: 'node_risk_1', target: 'node_claim_1', relation: 'undermines', label: 'Enterprise Hurdle' },
      { id: 'edge_6', source: 'node_contradiction_1', target: 'node_assumption_1', relation: 'contradicts', label: 'Pacing Conflict' },
      { id: 'edge_7', source: 'node_alternative_1', target: 'node_claim_1', relation: 'alternates', label: 'Pragmatic Counterpart' },
      { id: 'edge_8', source: 'node_missing_info_1', target: 'node_claim_1', relation: 'depends_on', label: 'Needed to Decide' },
      { id: 'edge_9', source: 'node_claim_1', target: 'node_consequence_1', relation: 'leads_to', label: 'Direct Impact' }
    ],
    detectedBiases: [
      {
        biasName: 'Optimism Bias (Planning Fallacy)',
        description: 'Assuming a 14-month runway is ample while ignoring the standard 9-month procurement hurdle in legal tech.',
        affectedNodeIds: ['node_claim_1', 'node_assumption_1'],
        recommendation: 'Double estimated timeline to first enterprise revenue from 4 months to 8-10 months.'
      },
      {
        biasName: 'False Consensus Effect',
        description: 'Equating friendly informal encouragement from peers with contractual purchasing intent.',
        affectedNodeIds: ['node_assumption_1'],
        recommendation: 'Require conditional paid pilot agreements ($2k deposit) prior to resigning.'
      }
    ],
    challenges: [
      {
        id: 'chal_1',
        type: 'devils_advocate',
        title: 'Enterprise Legal Departments Reject Solo Founders',
        description: 'General Counsels fear data liability and catastrophic leaks. An unvetted solo venture faces near-zero probability of security signoff without institutional backing.',
        impact: 'high'
      },
      {
        id: 'chal_2',
        type: 'what_if',
        title: 'What if Anthropic/OpenAI releases this as a native turnkey feature?',
        description: 'If frontier models launch legal compliance primitives out of the box, thin wrapper products lose pricing power within 6 months.',
        impact: 'high'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ana_microservices_refactor',
    userId: 'usr_marcus_v',
    userEmail: 'marcus.vance@techventures.io',
    title: 'Refactor Core Monolith into Distributed Microservices',
    decisionText: 'Should our 25-person engineering department decompose our Ruby on Rails monolith into Go/gRPC microservices before Q4 peak season?',
    context: 'Deployments take 35 minutes. Test suite is flaking. Team of 25 engineers across 4 squads.',
    constraints: 'Zero downtime acceptable. Q4 sales represent 60% of annual revenue.',
    category: 'Engineering Architecture',
    soundnessScore: 42,
    breakdown: {
      evidenceScore: 45,
      assumptionFragility: 82,
      riskExposure: 88,
      coherenceScore: 50
    },
    summary: 'Severely fragile reasoning. The team is conflating deployment pipeline friction with architectural limitations, introducing distributed systems complexity right before peak commercial season.',
    keyTakeaway: 'The primary bottleneck is CI/CD test orchestration, not monolith architecture. Undertaking a distributed migration before Q4 creates existential availability risks.',
    nodes: [
      {
        id: 'node_m_claim',
        type: 'claim',
        label: 'Decompose Monolith into Go Services',
        description: 'Initiate major refactoring sprint to split Rails backend into microservices before Q4.',
        confidence: 'low',
        impact: 'critical',
        validationStatus: 'debunked',
        tags: ['Architecture'],
        x: 450,
        y: 60
      },
      {
        id: 'node_m_reason1',
        type: 'reason',
        label: 'Slow 35-Minute Deploy Times',
        description: 'Engineers report deployment wait times and queue bottlenecks blocking continuous delivery.',
        confidence: 'high',
        impact: 'moderate',
        validationStatus: 'verified',
        tags: ['Productivity'],
        x: 220,
        y: 190
      },
      {
        id: 'node_m_assumption1',
        type: 'assumption',
        label: 'Microservices Will Speed Up Delivery',
        description: 'Assumes network boundaries automatically improve developer velocity without considering network debugging.',
        confidence: 'low',
        impact: 'critical',
        validationStatus: 'questionable',
        tags: ['Fallacy'],
        x: 680,
        y: 190
      },
      {
        id: 'node_m_risk1',
        type: 'risk',
        label: 'Catastrophic Q4 Outage During Migration',
        description: 'Q4 represents 60% of annual revenue. Distributed data consistency bugs could cause database desync.',
        confidence: 'high',
        impact: 'critical',
        validationStatus: 'verified',
        tags: ['Business Hazard'],
        x: 750,
        y: 330
      },
      {
        id: 'node_m_contradiction1',
        type: 'contradiction',
        label: 'Zero Downtime Rule vs In-Flight Service Cutover',
        description: 'Zero downtime mandate is structurally contradicted by breaking shared database foreign keys in Rails.',
        confidence: 'high',
        impact: 'critical',
        validationStatus: 'verified',
        tags: ['Constraint Clash'],
        x: 450,
        y: 330
      },
      {
        id: 'node_m_alternative1',
        type: 'alternative',
        label: 'Modular Monolith + Parallelized CI/CD',
        description: 'Invest 2 weeks in caching CI test runners and enforcing Rails packwerk boundaries at 1/10th the risk.',
        confidence: 'high',
        impact: 'critical',
        validationStatus: 'verified',
        tags: ['Sane Alternative'],
        x: 180,
        y: 460
      },
      {
        id: 'node_m_missing1',
        type: 'missing_info',
        label: 'Observability & Distributed Tracing Readiness',
        description: 'No telemetry exists for OpenTelemetry or Jaeger to diagnose cross-service cascading failures.',
        confidence: 'unverified',
        impact: 'critical',
        validationStatus: 'untested',
        tags: ['DevOps Gap'],
        x: 550,
        y: 460
      }
    ],
    edges: [
      { id: 'edge_m_1', source: 'node_m_reason1', target: 'node_m_claim', relation: 'supports' },
      { id: 'edge_m_2', source: 'node_m_assumption1', target: 'node_m_claim', relation: 'assumes' },
      { id: 'edge_m_3', source: 'node_m_risk1', target: 'node_m_claim', relation: 'undermines' },
      { id: 'edge_m_4', source: 'node_m_contradiction1', target: 'node_m_claim', relation: 'contradicts' },
      { id: 'edge_m_5', source: 'node_m_alternative1', target: 'node_m_claim', relation: 'alternates' },
      { id: 'edge_m_6', source: 'node_m_missing1', target: 'node_m_assumption1', relation: 'undermines' }
    ],
    detectedBiases: [
      {
        biasName: 'Resume-Driven Development (Novelty Bias)',
        description: 'Engineers choosing complex distributed architecture to learn trendy technologies rather than solving business latency.',
        affectedNodeIds: ['node_m_claim', 'node_m_assumption1'],
        recommendation: 'Evaluate against simple alternatives like GitHub Actions parallel matrix testing.'
      }
    ],
    challenges: [
      {
        id: 'chal_m_1',
        type: 'devils_advocate',
        title: 'You are trading compile-time safety for network timeouts',
        description: 'A 25-person team rarely has the SRE bandwidth to manage Kafka partitions, schema registries, and distributed deadlocks.',
        impact: 'high'
      }
    ],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  }
];

const SEED_METRICS: AiMetric[] = [
  {
    id: 'met_1',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    model: 'gemini-3.8-flash',
    action: 'analyze_graph',
    promptTokens: 840,
    responseTokens: 1250,
    latencyMs: 1420,
    userId: 'usr_demo_user',
    status: 'success'
  },
  {
    id: 'met_2',
    timestamp: new Date(Date.now() - 65000).toISOString(),
    model: 'gemini-3.8-flash',
    action: 'challenge_reasoning',
    promptTokens: 1120,
    responseTokens: 680,
    latencyMs: 1180,
    userId: 'usr_demo_user',
    status: 'success'
  },
  {
    id: 'met_3',
    timestamp: new Date(Date.now() - 32000).toISOString(),
    model: 'gemini-3.8-flash',
    action: 'bias_audit',
    promptTokens: 950,
    responseTokens: 540,
    latencyMs: 980,
    userId: 'usr_marcus_v',
    status: 'success'
  }
];

const SEED_ERRORS: SystemErrorLog[] = [
  {
    id: 'err_1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    endpoint: '/api/auth/login',
    method: 'POST',
    statusCode: 401,
    message: 'Invalid credentials attempted for unknown user test@unverified.org',
    userId: undefined
  },
  {
    id: 'err_2',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    endpoint: '/api/analysis/invalid_id',
    method: 'GET',
    statusCode: 404,
    message: 'Analysis record not found',
    userId: 'usr_demo_user'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || SEED_USERS,
          sessions: parsed.sessions || [],
          analyses: parsed.analyses || SEED_ANALYSES,
          aiMetrics: parsed.aiMetrics || SEED_METRICS,
          errorLogs: parsed.errorLogs || SEED_ERRORS,
        };
      }
    } catch (e) {
      console.error('Failed to load database.json, resetting to seed data:', e);
    }

    const initial: DatabaseSchema = {
      users: SEED_USERS,
      sessions: [],
      analyses: SEED_ANALYSES,
      aiMetrics: SEED_METRICS,
      errorLogs: SEED_ERRORS,
    };
    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    try {
      const payload = data || this.data;
      fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database.json:', err);
    }
  }

  // --- USER OPERATIONS ---
  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getAllUsers(): User[] {
    return this.data.users.map(({ passwordHash, salt, ...safeUser }) => safeUser);
  }

  public createUser(params: { email: string; name: string; password?: string; role?: 'user' | 'admin'; avatar?: string }): User {
    const salt = generateSalt();
    const rawPass = params.password || 'User@Reasoning2026!';
    const passwordHash = hashPassword(rawPass, salt);
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: params.email.toLowerCase().trim(),
      name: params.name.trim(),
      role: params.role || 'user',
      status: 'active',
      avatar: params.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash: _, salt: __, ...safe } = newUser;
    return safe;
  }

  public verifyPassword(user: StoredUser, passwordAttempt: string): boolean {
    const hash = hashPassword(passwordAttempt, user.salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.passwordHash));
  }

  public updateUserStatus(userId: string, status: 'active' | 'disabled'): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.status = status;
    this.save();
    const { passwordHash: _, salt: __, ...safe } = user;
    return safe;
  }

  public updateUserRole(userId: string, role: 'user' | 'admin'): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.role = role;
    this.save();
    const { passwordHash: _, salt: __, ...safe } = user;
    return safe;
  }

  public updateUserPlan(userId: string, plan: 'free' | 'pro' | 'vip'): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.plan = plan;
    this.save();
    const { passwordHash: _, salt: __, ...safe } = user;
    return safe;
  }

  public touchUserLogin(userId: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.save();
    }
  }

  // --- SESSIONS ---
  public createSession(userId: string): string {
    const token = `rg_tok_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 7 * 86400000; // 7 days
    this.data.sessions.push({ token, userId, expiresAt });
    this.save();
    return token;
  }

  public getSession(token: string): User | null {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }
    const user = this.findUserById(session.userId);
    if (!user || user.status === 'disabled') return null;
    const { passwordHash: _, salt: __, ...safe } = user;
    return safe;
  }

  public deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  // --- ANALYSES ---
  public getAllAnalyses(): ReasoningAnalysis[] {
    return [...this.data.analyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAnalysesByUser(userId: string): ReasoningAnalysis[] {
    return this.data.analyses
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAnalysisById(id: string): ReasoningAnalysis | null {
    return this.data.analyses.find(a => a.id === id) || null;
  }

  public saveAnalysis(analysis: ReasoningAnalysis): ReasoningAnalysis {
    const idx = this.data.analyses.findIndex(a => a.id === analysis.id);
    if (idx >= 0) {
      this.data.analyses[idx] = { ...analysis, updatedAt: new Date().toISOString() };
    } else {
      this.data.analyses.unshift(analysis);
    }
    this.save();
    return analysis;
  }

  public deleteAnalysis(id: string, userId: string, isAdmin = false): boolean {
    const initialLen = this.data.analyses.length;
    this.data.analyses = this.data.analyses.filter(a => {
      if (a.id === id) {
        if (isAdmin || a.userId === userId) {
          return false; // remove
        }
      }
      return true;
    });
    const removed = this.data.analyses.length < initialLen;
    if (removed) this.save();
    return removed;
  }

  // --- AI METRICS ---
  public recordAiMetric(metric: Omit<AiMetric, 'id'>): AiMetric {
    const item: AiMetric = {
      ...metric,
      id: `met_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    this.data.aiMetrics.unshift(item);
    if (this.data.aiMetrics.length > 500) {
      this.data.aiMetrics = this.data.aiMetrics.slice(0, 500);
    }
    this.save();
    return item;
  }

  public getAiMetrics(): AiMetric[] {
    return this.data.aiMetrics;
  }

  // --- ERROR LOGS ---
  public logError(error: Omit<SystemErrorLog, 'id' | 'timestamp'>): SystemErrorLog {
    const logItem: SystemErrorLog = {
      ...error,
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.errorLogs.unshift(logItem);
    if (this.data.errorLogs.length > 300) {
      this.data.errorLogs = this.data.errorLogs.slice(0, 300);
    }
    this.save();
    return logItem;
  }

  public getErrorLogs(): SystemErrorLog[] {
    return this.data.errorLogs;
  }

  public clearErrorLogs() {
    this.data.errorLogs = [];
    this.save();
  }

  // --- SYSTEM STATS ---
  public getSystemStats(): SystemStats {
    const totalAiCalls = this.data.aiMetrics.length;
    const totalTokensUsed = this.data.aiMetrics.reduce((acc, m) => acc + (m.promptTokens + m.responseTokens), 0);
    const avgLatencyMs = totalAiCalls > 0
      ? Math.round(this.data.aiMetrics.reduce((acc, m) => acc + m.latencyMs, 0) / totalAiCalls)
      : 0;

    return {
      totalUsers: this.data.users.length,
      activeUsers: this.data.users.filter(u => u.status === 'active').length,
      totalAnalyses: this.data.analyses.length,
      totalAiCalls,
      totalTokensUsed,
      avgLatencyMs,
      errorCount: this.data.errorLogs.length,
      serverUptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }
}

export const db = new Database();
