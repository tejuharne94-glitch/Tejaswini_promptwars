import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.js';
import { requireAuth, requireAdmin, optionalAuth, AuthenticatedRequest } from './src/server/auth.js';
import { analyzeReasoning, challengeReasoning } from './src/server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Global request logger & error boundary
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  try {
    const user = db.createUser({ email, name, password, role: 'user' });
    const token = db.createSession(user.id);
    return res.status(201).json({ user, token });
  } catch (error: any) {
    db.logError({
      endpoint: '/api/auth/register',
      method: 'POST',
      statusCode: 500,
      message: error?.message || 'Registration failure',
      stack: error?.stack,
    });
    return res.status(500).json({ error: 'Could not complete registration. Please try again.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    db.logError({
      endpoint: '/api/auth/login',
      method: 'POST',
      statusCode: 401,
      message: `Failed login attempt for non-existent user: ${email}`,
    });
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  const isValid = db.verifyPassword(user, password);
  if (!isValid) {
    db.logError({
      endpoint: '/api/auth/login',
      method: 'POST',
      statusCode: 401,
      message: `Failed login attempt for user: ${email}`,
      userId: user.id,
    });
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  db.touchUserLogin(user.id);
  const token = db.createSession(user.id);
  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

// Dedicated Admin Login Endpoint
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Admin email and secure password required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.role !== 'admin') {
    db.logError({
      endpoint: '/api/auth/admin-login',
      method: 'POST',
      statusCode: 403,
      message: `Unauthorized admin login attempt: ${email}`,
    });
    return res.status(403).json({ error: 'Access denied. Account is not recognized as an administrator.' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'Admin account has been deactivated.' });
  }

  const isValid = db.verifyPassword(user, password);
  if (!isValid) {
    db.logError({
      endpoint: '/api/auth/admin-login',
      method: 'POST',
      statusCode: 401,
      message: `Invalid password for admin user: ${email}`,
      userId: user.id,
    });
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  db.touchUserLogin(user.id);
  const token = db.createSession(user.id);
  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

// Google Sign-In Flow
app.post('/api/auth/google-sign-in', (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;
  const userEmail = email || 'google.user@example.com';
  const userName = name || 'Google User';

  let user = db.findUserByEmail(userEmail);
  if (!user) {
    const created = db.createUser({
      email: userEmail,
      name: userName,
      role: 'user',
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userEmail)}`,
    });
    user = db.findUserById(created.id);
  }

  if (user!.status === 'disabled') {
    return res.status(403).json({ error: 'This account has been deactivated.' });
  }

  db.touchUserLogin(user!.id);
  const token = db.createSession(user!.id);
  const { passwordHash: _, salt: __, ...safeUser } = user!;
  return res.json({ user: safeUser, token });
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.token) {
    db.deleteSession(req.token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

app.post('/api/user/plan', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { plan } = req.body;
  if (!plan || !['free', 'pro', 'vip'].includes(plan)) {
    return res.status(400).json({ error: 'Valid plan required: free, pro, or vip.' });
  }

  const updatedUser = db.updateUserPlan(req.user!.id, plan);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({ user: updatedUser, success: true });
});

// --- ANALYSES ROUTES ---
app.get('/api/analyses', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    // Return sample analyses for unauthenticated guests
    return res.json({ analyses: db.getAllAnalyses().slice(0, 2) });
  }
  if (req.user?.role === 'admin') {
    return res.json({ analyses: db.getAllAnalyses() });
  }
  return res.json({ analyses: db.getAnalysesByUser(userId) });
});

app.get('/api/analyses/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const analysis = db.getAnalysisById(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }
  return res.json({ analysis });
});

app.post('/api/analyses/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { decisionText, context, constraints } = req.body;
  console.log('[AI Investigator Server] User input received for reasoning analysis:', {
    decisionText,
    context,
    constraints,
    userId: req.user?.id || 'guest',
  });

  if (!decisionText || typeof decisionText !== 'string' || decisionText.trim().length < 5) {
    return res.status(400).json({ error: 'Please enter a substantive decision, claim, or dilemma (at least 5 characters).' });
  }

  const userId = req.user?.id || 'usr_demo_user';
  const userEmail = req.user?.email || 'demo@reasoninggraph.com';

  try {
    console.log('[AI Investigator Server] Calling Gemini reasoning engine...');
    const analysis = await analyzeReasoning(decisionText.trim(), context, constraints, userId);
    analysis.userEmail = userEmail;
    db.saveAnalysis(analysis);
    console.log('[AI Investigator Server] Output generated successfully:', {
      id: analysis.id,
      title: analysis.title,
      soundnessScore: analysis.soundnessScore,
      nodesCount: analysis.nodes.length,
      edgesCount: analysis.edges.length,
    });
    return res.status(201).json({ analysis });
  } catch (error: any) {
    console.error('[AI Investigator Server] Error processing reasoning analysis:', error?.message);
    db.logError({
      endpoint: '/api/analyses/generate',
      method: 'POST',
      statusCode: 500,
      message: error?.message || 'Failed to generate reasoning analysis',
      userId,
      stack: error?.stack,
    });
    return res.status(500).json({ error: 'Failed to process reasoning graph. Please try again.' });
  }
});

app.put('/api/analyses/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getAnalysisById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  db.saveAnalysis(updated);
  return res.json({ analysis: updated });
});

app.delete('/api/analyses/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  console.log('[AI Investigator Server] Deleting analysis ID:', req.params.id);
  const deleted = db.deleteAnalysis(req.params.id, req.user?.id || '', true);
  return res.json({ success: deleted });
});

app.post('/api/analyses/challenge', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { analysisId, challengeType, specificNodeId, customQuery } = req.body;
  console.log('[AI Investigator Server] Challenge stress-test requested:', {
    analysisId,
    challengeType,
    customQuery,
  });

  const analysis = db.getAnalysisById(analysisId);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }

  const userId = req.user?.id || 'usr_guest';

  try {
    const insights = await challengeReasoning(
      analysis,
      challengeType || 'devils_advocate',
      specificNodeId,
      customQuery,
      userId
    );
    console.log('[AI Investigator Server] Challenge insights generated count:', insights.length);
    return res.json({ challenges: insights });
  } catch (error: any) {
    console.error('[AI Investigator Server] Challenge generation failed:', error?.message);
    return res.status(500).json({ error: 'Failed to generate challenge insights.' });
  }
});

app.post('/api/analyses/:id/challenge', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const analysis = db.getAnalysisById(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }

  const { challengeType, specificNodeId, customQuery } = req.body;
  const userId = req.user?.id || 'usr_guest';

  try {
    const insights = await challengeReasoning(
      analysis,
      challengeType || 'devils_advocate',
      specificNodeId,
      customQuery,
      userId
    );
    return res.json({ challenges: insights });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to generate challenge insights.' });
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getSystemStats();
  return res.json({ stats });
});

app.get('/api/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  const analyses = db.getAllAnalyses();
  const enhancedUsers = users.map(u => ({
    ...u,
    analysisCount: analyses.filter(a => a.userId === u.id).length,
  }));
  return res.json({ users: enhancedUsers });
});

app.put('/api/admin/users/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (status !== 'active' && status !== 'disabled') {
    return res.status(400).json({ error: 'Status must be active or disabled.' });
  }
  const user = db.updateUserStatus(req.params.id, status);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user });
});

app.get('/api/admin/analyses', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const analyses = db.getAllAnalyses().map(a => ({
    id: a.id,
    userId: a.userId,
    userEmail: a.userEmail,
    title: a.title,
    category: a.category,
    soundnessScore: a.soundnessScore,
    nodeCount: a.nodes.length,
    edgeCount: a.edges.length,
    createdAt: a.createdAt,
  }));
  return res.json({ analyses });
});

app.get('/api/admin/ai-metrics', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const metrics = db.getAiMetrics();
  return res.json({ metrics });
});

app.get('/api/admin/error-logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getErrorLogs();
  return res.json({ logs });
});

app.delete('/api/admin/error-logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  db.clearErrorLogs();
  return res.json({ success: true, message: 'Logs cleared.' });
});

// System Health Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    node: process.version,
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// --- VITE MIDDLEWARE & STATIC ASSET HANDLER ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Reasoning Graph] Full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
