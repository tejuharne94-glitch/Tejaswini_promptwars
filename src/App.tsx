import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { AnalysisForm } from './components/AnalysisForm.js';
import { GraphCanvas } from './components/GraphCanvas.js';
import { HistoryPage } from './components/HistoryPage.js';
import { AuthModal } from './components/AuthModal.js';
import { User, ReasoningAnalysis } from './types.js';
import { api, getStoredUser } from './services/api.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [currentView, setCurrentView] = useState<'form' | 'studio' | 'history'>('form');
  const [activeAnalysis, setActiveAnalysis] = useState<ReasoningAnalysis | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initialize session & load initial demo if needed
  useEffect(() => {
    console.log('[AI Investigator] App initialized. Checking session status.');
    api.getCurrentUser().then(user => {
      if (user) {
        console.log('[AI Investigator] Restored active session for user:', user.email);
        setCurrentUser(user);
      }
    });

    // Pre-load default sample analysis so user can explore immediately
    api.getAnalyses().then(analyses => {
      if (analyses.length > 0) {
        setActiveAnalysis(analyses[0]);
      }
    }).catch(err => {
      console.error('[AI Investigator] Error fetching initial analyses:', err);
    });
  }, []);

  const handleAnalysisGenerated = (analysis: ReasoningAnalysis) => {
    console.log('[AI Investigator] Switching view to Studio for analysis:', analysis.id);
    setActiveAnalysis(analysis);
    setCurrentView('studio');
  };

  const handleOpenAnalysisFromHistory = async (id: string) => {
    console.log('[AI Investigator] Opening saved analysis from History:', id);
    try {
      const analysis = await api.getAnalysis(id);
      setActiveAnalysis(analysis);
      setCurrentView('studio');
    } catch (err) {
      console.error('[AI Investigator] Failed to load analysis from history:', err);
    }
  };

  const handleLogout = async () => {
    console.log('[AI Investigator] User logged out.');
    await api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. Simple Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={view => {
          console.log('[AI Investigator] Navigating to view:', view);
          setCurrentView(view);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'form' && (
          <AnalysisForm
            onAnalysisGenerated={handleAnalysisGenerated}
          />
        )}

        {currentView === 'studio' && activeAnalysis && (
          <GraphCanvas
            analysis={activeAnalysis}
            onNewAnalysis={() => setCurrentView('form')}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage
            onOpenAnalysis={handleOpenAnalysisFromHistory}
            onNewAnalysis={() => setCurrentView('form')}
          />
        )}
      </main>

      {/* 3. Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={user => {
          console.log('[AI Investigator] User authenticated successfully:', user.email);
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
