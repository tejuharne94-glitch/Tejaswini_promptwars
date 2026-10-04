import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './components/LandingPage.js';
import { AnalysisForm } from './components/AnalysisForm.js';
import { GraphCanvas } from './components/GraphCanvas.js';
import { HistoryPage } from './components/HistoryPage.js';
import { ProfilePage } from './components/ProfilePage.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { AdminLogin } from './components/AdminLogin.js';
import { AuthModal } from './components/AuthModal.js';
import { SoundnessScoreModal } from './components/SoundnessScoreModal.js';
import { ChallengeDrawer } from './components/ChallengeDrawer.js';
import { NodeInspector } from './components/NodeInspector.js';
import { VipUpgradeModal } from './components/VipUpgradeModal.js';
import { MonteCarloModal } from './components/MonteCarloModal.js';
import { ExecutiveMemoModal } from './components/ExecutiveMemoModal.js';
import { AnalysisCompareModal } from './components/AnalysisCompareModal.js';
import { User, ReasoningAnalysis, GraphNode, GraphEdge } from './types.js';
import { api, getStoredUser } from './services/api.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [currentView, setCurrentView] = useState<'landing' | 'new' | 'studio' | 'history' | 'profile' | 'admin' | 'admin_login'>('landing');

  // Analyses State
  const [analysesList, setAnalysesList] = useState<ReasoningAnalysis[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<ReasoningAnalysis | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [presetInputText, setPresetInputText] = useState<string>('');

  // Modals & Panels
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [soundnessModalOpen, setSoundnessModalOpen] = useState(false);
  const [challengeDrawerOpen, setChallengeDrawerOpen] = useState(false);
  const [nodeInspectorOpen, setNodeInspectorOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [monteCarloModalOpen, setMonteCarloModalOpen] = useState(false);
  const [executiveMemoModalOpen, setExecutiveMemoModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareAnalysisA, setCompareAnalysisA] = useState<ReasoningAnalysis | null>(null);
  const [compareAnalysisB, setCompareAnalysisB] = useState<ReasoningAnalysis | null>(null);

  // VIP Membership Check
  const isVip = Boolean(currentUser?.plan === 'vip' || currentUser?.plan === 'pro');

  const handleOpenCompare = (a: ReasoningAnalysis, b: ReasoningAnalysis) => {
    setCompareAnalysisA(a);
    setCompareAnalysisB(b);
    setCompareModalOpen(true);
  };

  // Load session verification & seed analyses
  useEffect(() => {
    api.getCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });

    api.getAnalyses().then(list => {
      setAnalysesList(list);
      if (list.length > 0 && !activeAnalysis) {
        setActiveAnalysis(list[0]);
      }
    });
  }, []);

  const handleNavigate = async (view: string, analysisId?: string) => {
    if (view === 'admin' && currentUser?.role !== 'admin') {
      setCurrentView('admin_login');
      return;
    }

    if (view === 'studio' && analysisId) {
      try {
        const ana = await api.getAnalysis(analysisId);
        setActiveAnalysis(ana);
      } catch (err) {
        console.error('Failed to load analysis:', err);
      }
    }

    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    if (currentView === 'admin' || currentView === 'profile') {
      setCurrentView('landing');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin' = 'login') => {
    if (mode === 'admin') {
      setCurrentView('admin_login');
    } else {
      setAuthInitialMode(mode);
      setAuthModalOpen(true);
    }
  };

  const handleSelectNode = (node: GraphNode | null) => {
    setSelectedNode(node);
    setNodeInspectorOpen(Boolean(node));
  };

  const handleUpdateActiveAnalysis = async (updated: ReasoningAnalysis) => {
    setActiveAnalysis(updated);
    setAnalysesList(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    try {
      await api.updateAnalysis(updated.id, updated);
    } catch (err) {
      console.error('Failed to sync updated analysis to server:', err);
    }
  };

  const handleUpdateNode = (updatedNode: GraphNode) => {
    if (!activeAnalysis) return;
    const newNodes = activeAnalysis.nodes.map(n => (n.id === updatedNode.id ? updatedNode : n));
    const updated = { ...activeAnalysis, nodes: newNodes };
    handleUpdateActiveAnalysis(updated);
    setSelectedNode(updatedNode);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeAnalysis) return;
    const newNodes = activeAnalysis.nodes.filter(n => n.id !== nodeId);
    const newEdges = activeAnalysis.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    const updated = { ...activeAnalysis, nodes: newNodes, edges: newEdges };
    handleUpdateActiveAnalysis(updated);
    setSelectedNode(null);
    setNodeInspectorOpen(false);
  };

  const handleAddEdge = (edge: Partial<GraphEdge>) => {
    if (!activeAnalysis || !edge.source || !edge.target) return;
    const newEdge: GraphEdge = {
      id: `edge_${Date.now()}`,
      source: edge.source,
      target: edge.target,
      relation: edge.relation || 'supports',
      label: edge.label,
      strength: 'strong',
    };
    const updated = { ...activeAnalysis, edges: [...activeAnalysis.edges, newEdge] };
    handleUpdateActiveAnalysis(updated);
  };

  const handleAddNodeFromChallenge = (newNodeData: Partial<GraphNode>, newEdgeData?: Partial<GraphEdge>) => {
    if (!activeAnalysis) return;
    const newId = `node_chal_${Date.now()}`;
    const claimNode = activeAnalysis.nodes.find(n => n.type === 'claim') || activeAnalysis.nodes[0];

    const node: GraphNode = {
      id: newId,
      type: newNodeData.type || 'risk',
      label: newNodeData.label || 'Counter-Point Challenge',
      description: newNodeData.description || 'Identified adversarial reasoning challenge point.',
      confidence: newNodeData.confidence || 'low',
      impact: newNodeData.impact || 'critical',
      validationStatus: newNodeData.validationStatus || 'questionable',
      tags: ['Adversarial'],
      x: claimNode ? claimNode.x + (Math.random() > 0.5 ? 260 : -260) : 400,
      y: claimNode ? claimNode.y + 260 : 350,
    };

    const newNodes = [...activeAnalysis.nodes, node];
    const newEdges = [...activeAnalysis.edges];

    if (claimNode) {
      newEdges.push({
        id: `edge_chal_${Date.now()}`,
        source: newId,
        target: claimNode.id,
        relation: newEdgeData?.relation || 'undermines',
        label: newEdgeData?.label || 'Adversarial Edge',
        strength: 'strong',
      });
    }

    const updated = { ...activeAnalysis, nodes: newNodes, edges: newEdges };
    handleUpdateActiveAnalysis(updated);
  };

  const handleProbeNodeWithAi = (node: GraphNode) => {
    setChallengeDrawerOpen(true);
  };

  const handleStartAnalysisFromPreset = (presetText?: string) => {
    setPresetInputText(presetText || '');
    setCurrentView('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Clean Navigation / Header */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenVipUpgrade={() => setVipModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Routed Main Page Content */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onStartAnalysis={handleStartAnalysisFromPreset}
            onExploreDemo={demoId => handleNavigate('studio', demoId)}
            demoAnalyses={analysesList}
            onOpenVipUpgrade={() => setVipModalOpen(true)}
          />
        )}

        {currentView === 'new' && (
          <AnalysisForm
            initialDecisionText={presetInputText}
            onAnalysisGenerated={analysis => {
              setActiveAnalysis(analysis);
              setAnalysesList(prev => [analysis, ...prev]);
              setCurrentView('studio');
            }}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'studio' && activeAnalysis && (
          <GraphCanvas
            analysis={activeAnalysis}
            onUpdateAnalysis={handleUpdateActiveAnalysis}
            onOpenChallenge={() => setChallengeDrawerOpen(true)}
            onOpenSoundness={() => setSoundnessModalOpen(true)}
            onOpenMonteCarlo={() => setMonteCarloModalOpen(true)}
            onOpenExecutiveMemo={() => setExecutiveMemoModalOpen(true)}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id || null}
            isVip={isVip}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage
            onOpenAnalysis={id => handleNavigate('studio', id)}
            onNewAnalysis={() => setCurrentView('new')}
            isVip={isVip}
            onOpenVipUpgrade={() => setVipModalOpen(true)}
            onOpenCompare={handleOpenCompare}
          />
        )}

        {currentView === 'profile' && currentUser && (
          <ProfilePage
            user={currentUser}
            onLogout={handleLogout}
            onNavigateHistory={() => setCurrentView('history')}
            onNavigateNew={() => setCurrentView('new')}
            onOpenVipUpgrade={() => setVipModalOpen(true)}
          />
        )}

        {currentView === 'admin_login' && (
          <AdminLogin
            onSuccess={adminUser => {
              setCurrentUser(adminUser);
              setCurrentView('admin');
            }}
            onBackToUser={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard
            onLogout={handleLogout}
            onOpenAnalysis={id => handleNavigate('studio', id)}
          />
        )}
      </main>

      {/* Universal Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={user => setCurrentUser(user)}
        onSwitchToAdmin={() => setCurrentView('admin_login')}
      />

      <VipUpgradeModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={user => setCurrentUser(user)}
        onRequireAuth={() => handleOpenAuth('login')}
      />

      <AnalysisCompareModal
        analysisA={compareAnalysisA}
        analysisB={compareAnalysisB}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        isVip={isVip}
        onOpenUpgrade={() => {
          setCompareModalOpen(false);
          setVipModalOpen(true);
        }}
      />

      {activeAnalysis && (
        <>
          <SoundnessScoreModal
            analysis={activeAnalysis}
            isOpen={soundnessModalOpen}
            onClose={() => setSoundnessModalOpen(false)}
          />

          <ChallengeDrawer
            analysis={activeAnalysis}
            isOpen={challengeDrawerOpen}
            onClose={() => setChallengeDrawerOpen(false)}
            onAddNodeToGraph={handleAddNodeFromChallenge}
            isVip={isVip}
            onOpenUpgrade={() => setVipModalOpen(true)}
          />

          <MonteCarloModal
            analysis={activeAnalysis}
            isOpen={monteCarloModalOpen}
            onClose={() => setMonteCarloModalOpen(false)}
            isVip={isVip}
            onOpenUpgrade={() => setVipModalOpen(true)}
          />

          <ExecutiveMemoModal
            analysis={activeAnalysis}
            isOpen={executiveMemoModalOpen}
            onClose={() => setExecutiveMemoModalOpen(false)}
            isVip={isVip}
            onOpenUpgrade={() => setVipModalOpen(true)}
          />

          <NodeInspector
            node={selectedNode}
            allNodes={activeAnalysis.nodes}
            allEdges={activeAnalysis.edges}
            isOpen={nodeInspectorOpen}
            onClose={() => {
              setNodeInspectorOpen(false);
              setSelectedNode(null);
            }}
            onSelectConnectedNode={handleSelectNode}
            onProbeNodeWithAi={handleProbeNodeWithAi}
          />
        </>
      )}
    </div>
  );
}
