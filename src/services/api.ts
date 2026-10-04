import {
  User,
  ReasoningAnalysis,
  ChallengeInsight,
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

/**
 * Traceable API requester:
 * Logs all network calls, payloads, and results so an AI investigator or developer
 * can trace user input, processing logic, API calls, and responses.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET';
  console.log(`[AI Investigator - API Call] ${method} ${endpoint}`);
  
  if (options.body) {
    try {
      console.log(`[AI Investigator - Request Payload]:`, JSON.parse(options.body as string));
    } catch {
      console.log(`[AI Investigator - Request Body]:`, options.body);
    }
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[AI Investigator - API Error] Status ${response.status} on ${endpoint}:`, data.error || data);
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    console.log(`[AI Investigator - API Response Success] Status ${response.status} from ${endpoint}`);
    return data;
  } catch (err: any) {
    console.error(`[AI Investigator - Network Error] on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  async register(params: { email: string; name: string; password: string }): Promise<{ user: User; token: string }> {
    console.log('[AI Investigator] User registering with email:', params.email);
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async login(params: { email: string; password: string }): Promise<{ user: User; token: string }> {
    console.log('[AI Investigator] User logging in with email:', params.email);
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async googleSignIn(params: { email?: string; name?: string; avatar?: string } = {}): Promise<{ user: User; token: string }> {
    console.log('[AI Investigator] Google demo sign-in requested');
    const res = await request<{ user: User; token: string }>('/api/auth/google-sign-in', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async logout(): Promise<void> {
    console.log('[AI Investigator] User logging out');
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearStoredAuth();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await request<{ user: User }>('/api/auth/me');
      setStoredAuth(token, res.user);
      return res.user;
    } catch {
      clearStoredAuth();
      return null;
    }
  },

  // Analyses
  async getAnalyses(): Promise<ReasoningAnalysis[]> {
    console.log('[AI Investigator] Fetching saved reasoning analyses list');
    const res = await request<{ analyses: ReasoningAnalysis[] }>('/api/analyses');
    return res.analyses;
  },

  async getAnalysis(id: string): Promise<ReasoningAnalysis> {
    console.log('[AI Investigator] Fetching single analysis details for ID:', id);
    const res = await request<{ analysis: ReasoningAnalysis }>(`/api/analyses/${id}`);
    return res.analysis;
  },

  async generateAnalysis(params: {
    decisionText: string;
    context?: string;
    constraints?: string;
  }): Promise<ReasoningAnalysis> {
    console.log('[AI Investigator] Submitting new reasoning analysis input:', params);
    const res = await request<{ analysis: ReasoningAnalysis }>('/api/analyses/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    console.log('[AI Investigator] Reasoning analysis output received. Soundness score:', res.analysis.soundnessScore);
    return res.analysis;
  },

  async deleteAnalysis(id: string): Promise<void> {
    console.log('[AI Investigator] Deleting analysis ID:', id);
    await request(`/api/analyses/${id}`, {
      method: 'DELETE',
    });
  },

  async challengeAnalysis(params: {
    analysisId: string;
    challengeType?: string;
    customQuery?: string;
  }): Promise<ChallengeInsight[]> {
    console.log('[AI Investigator] Requesting adversarial challenge stress-test:', params);
    const res = await request<{ challenges: ChallengeInsight[] }>('/api/analyses/challenge', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    console.log('[AI Investigator] Challenge insights output received. Total items:', res.challenges.length);
    return res.challenges;
  },
};
