import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Layers,
  Cpu,
  AlertOctagon,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Server,
  Terminal,
  LogOut,
} from 'lucide-react';
import {
  SystemStats,
  User,
  AiMetric,
  SystemErrorLog,
} from '../types.js';
import { api } from '../services/api.js';

interface AdminDashboardProps {
  onLogout: () => void;
  onOpenAnalysis: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onOpenAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analyses' | 'ai' | 'errors' | 'health'>('users');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<(User & { analysisCount: number })[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<AiMetric[]>([]);
  const [errors, setErrors] = useState<SystemErrorLog[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, analysesRes, metricsRes, errorsRes, healthRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAnalyses(),
        api.getAdminAiMetrics(),
        api.getAdminErrorLogs(),
        api.checkHealth(),
      ]);

      setStats(statsRes);
      setUsers(usersRes);
      setAnalyses(analysesRes);
      setMetrics(metricsRes);
      setErrors(errorsRes);
      setHealthData(healthRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleToggleUserStatus = async (user: User & { analysisCount: number }) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      const updated = await api.updateUserStatus(user.id, nextStatus);
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: updated.status } : u)));
    } catch (err: any) {
      alert(err?.message || 'Could not update user status');
    }
  };

  const handleClearErrors = async () => {
    if (!confirm('Clear all recorded system error logs?')) return;
    try {
      await api.clearAdminErrorLogs();
      setErrors([]);
    } catch (err: any) {
      alert(err?.message || 'Failed to clear error logs');
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">System Administration Dashboard</h1>
              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Administrator
              </span>
            </div>
            <p className="text-xs text-slate-500">
              User privilege control, telemetry, error audits, and system health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold">Total Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalUsers ?? '...'}</div>
          <div className="text-[10px] text-emerald-700 font-medium">
            {stats?.activeUsers ?? '...'} active
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold">Total Analyses</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalAnalyses ?? '...'}</div>
          <div className="text-[10px] text-slate-500">across all accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold">AI Requests</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalAiCalls ?? '...'}</div>
          <div className="text-[10px] text-indigo-700 font-mono">avg {stats?.avgLatencyMs ?? 0}ms</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold">AI Tokens</span>
            <Terminal className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats ? (stats.totalTokensUsed > 1000 ? `${(stats.totalTokensUsed / 1000).toFixed(1)}k` : stats.totalTokensUsed) : '...'}
          </div>
          <div className="text-[10px] text-slate-500">processed</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold">Error Count</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats?.errorCount ?? 0}</div>
          <div className="text-[10px] text-slate-500">system logs</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold">Server Uptime</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-1">
            {stats ? formatUptime(stats.serverUptimeSeconds) : '...'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">{stats?.memoryUsageMb ?? 0} MB heap</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-6 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analyses')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'analyses'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Analyses Metadata ({analyses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'ai'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Request Telemetry ({metrics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'errors'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Error Logs ({errors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'health'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Health</span>
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Registered Users Directory</h3>
            <span className="text-xs text-slate-500">Total: {users.length} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Analyses</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" /> Disabled
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-slate-700">{u.analysisCount}</td>

                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Analyses */}
      {activeTab === 'analyses' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Analyses Metadata Explorer</h3>
            <span className="text-xs text-slate-500">Total: {analyses.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Soundness</th>
                  <th className="p-3">Elements</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{a.title}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{a.userEmail || a.userId}</td>
                    <td className="p-3 text-indigo-700">{a.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{a.soundnessScore}/100</td>
                    <td className="p-3 font-mono text-slate-600">
                      {a.nodeCount} nodes • {a.edgeCount} edges
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenAnalysis(a.id)}
                        className="p-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
                        title="Open in Studio"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: AI Telemetry */}
      {activeTab === 'ai' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">AI Model Calls Telemetry</h3>
            <span className="text-xs text-slate-500 font-mono">gemini-3.8-flash</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Prompt</th>
                  <th className="p-3">Response</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {metrics.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-slate-500">{new Date(m.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 text-slate-900 font-sans font-semibold">{m.action}</td>
                    <td className="p-3 text-slate-500">{m.model}</td>
                    <td className="p-3 text-slate-700">{m.promptTokens}</td>
                    <td className="p-3 text-slate-700">{m.responseTokens}</td>
                    <td className="p-3 text-indigo-700 font-bold">{m.latencyMs} ms</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Error Logs */}
      {activeTab === 'errors' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">System Exceptions & Audit Logs</h3>
            <button
              onClick={handleClearErrors}
              disabled={errors.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          </div>

          {errors.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <CheckCircle className="w-7 h-7 mx-auto text-emerald-600 mb-2" />
              No errors logged. All system services operating normally.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Endpoint</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {errors.map(err => (
                    <tr key={err.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {new Date(err.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-mono text-slate-800">{err.endpoint}</td>
                      <td className="p-3 font-mono text-slate-600">{err.method}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">{err.statusCode}</td>
                      <td className="p-3 text-slate-700 max-w-md truncate">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Health */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Server Architecture & Runtime Health
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Node.js Runtime</span>
                <span className="font-mono font-bold text-slate-900">{healthData?.node || process.version}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">API Health Check</span>
                <span className="text-emerald-700 font-bold uppercase">{healthData?.status || 'Healthy'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Uptime</span>
                <span className="font-mono text-slate-900">{stats ? formatUptime(stats.serverUptimeSeconds) : '...'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">V8 Heap Memory</span>
                <span className="font-mono text-slate-900">{stats?.memoryUsageMb ?? 0} MB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Gemini SDK Pipeline</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Active & Operational
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-600" />
              RBAC & Cryptographic Security
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                • <strong>Separated Administration:</strong> Admin logins require credentials verified against salted PBKDF2 hashes.
              </p>
              <p>
                • <strong>Bearer Token Session Gate:</strong> Every request to <code>/api/admin/*</code> is cryptographically validated on the server.
              </p>
              <p>
                • <strong>Operational Autonomy:</strong> Administrators have instant toggle capability to disable compromised accounts and inspect error trends in real time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
