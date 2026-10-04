import {
  User,
  ReasoningAnalysis,
  ChallengeInsight,
  SystemStats,
  AiMetric,
  SystemErrorLog,
} from '../types.js';

const TOKEN_KEY = 'rg_auth_token';
const USER_KEY = 'rg_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async register(params: { email: string; name: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async login(params: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async adminLogin(params: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async googleSignIn(params: { email?: string; name?: string; avatar?: string } = {}): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/google-sign-in', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearStoredAuth();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await request<{ user: User }>('/api/auth/me');
      setStoredAuth(getStoredToken()!, res.user);
      return res.user;
    } catch {
      clearStoredAuth();
      return null;
    }
  },

  async updatePlan(plan: 'free' | 'pro' | 'vip'): Promise<User> {
    const res = await request<{ user: User; success: boolean }>('/api/user/plan', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
    const token = getStoredToken();
    if (token) {
      setStoredAuth(token, res.user);
    }
    return res.user;
  },

  // Analyses
  async getAnalyses(): Promise<ReasoningAnalysis[]> {
    const res = await request<{ analyses: ReasoningAnalysis[] }>('/api/analyses');
    return res.analyses;
  },

  async getAnalysis(id: string): Promise<ReasoningAnalysis> {
    const res = await request<{ analysis: ReasoningAnalysis }>(`/api/analyses/${id}`);
    return res.analysis;
  },

  async generateAnalysis(params: {
    decisionText: string;
    context?: string;
    constraints?: string;
  }): Promise<ReasoningAnalysis> {
    const res = await request<{ analysis: ReasoningAnalysis }>('/api/analyses/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.analysis;
  },

  async updateAnalysis(id: string, updates: Partial<ReasoningAnalysis>): Promise<ReasoningAnalysis> {
    const res = await request<{ analysis: ReasoningAnalysis }>(`/api/analyses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.analysis;
  },

  async deleteAnalysis(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/analyses/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async challengeAnalysis(params: {
    analysisId: string;
    challengeType: 'devils_advocate' | 'cognitive_bias' | 'what_if' | 'missing_evidence';
    specificNodeId?: string;
    customQuery?: string;
  }): Promise<ChallengeInsight[]> {
    const res = await request<{ challenges: ChallengeInsight[] }>(`/api/analyses/${params.analysisId}/challenge`, {
      method: 'POST',
      body: JSON.stringify({
        challengeType: params.challengeType,
        specificNodeId: params.specificNodeId,
        customQuery: params.customQuery,
      }),
    });
    return res.challenges;
  },

  // Admin
  async getAdminStats(): Promise<SystemStats> {
    const res = await request<{ stats: SystemStats }>('/api/admin/stats');
    return res.stats;
  },

  async getAdminUsers(): Promise<(User & { analysisCount: number })[]> {
    const res = await request<{ users: (User & { analysisCount: number })[] }>('/api/admin/users');
    return res.users;
  },

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<User> {
    const res = await request<{ user: User }>(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.user;
  },

  async getAdminAnalyses(): Promise<any[]> {
    const res = await request<{ analyses: any[] }>('/api/admin/analyses');
    return res.analyses;
  },

  async getAdminAiMetrics(): Promise<AiMetric[]> {
    const res = await request<{ metrics: AiMetric[] }>('/api/admin/ai-metrics');
    return res.metrics;
  },

  async getAdminErrorLogs(): Promise<SystemErrorLog[]> {
    const res = await request<{ logs: SystemErrorLog[] }>('/api/admin/error-logs');
    return res.logs;
  },

  async clearAdminErrorLogs(): Promise<void> {
    await request('/api/admin/error-logs', { method: 'DELETE' });
  },

  async checkHealth(): Promise<any> {
    return request('/api/health');
  },
};
