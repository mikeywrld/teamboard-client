import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { api, getStoredToken, setStoredToken } from './api/client.js';
import { HeaderBar } from './components/HeaderBar.jsx';
import { LoginPage } from './pages/Login.jsx';
import { RegisterPage } from './pages/Register.jsx';
import { ProjectsPage } from './pages/Projects.jsx';
import { BoardPage } from './pages/Board.jsx';

const ACTIVE_PROJECT_KEY = 'teamboard_active_project';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeProject, setActiveProject] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ACTIVE_PROJECT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_e) {
      return null;
    }
  });
  const [bootstrapping, setBootstrapping] = useState(true);
  const [healthState, setHealthState] = useState('loading');

  const checkApiHealth = useCallback(async () => {
    setHealthState('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await api.checkHealth(controller.signal);
      if (res?.status === 'ok') {
        setHealthState('ok');
      } else {
        setHealthState('error');
      }
    } catch (_err) {
      setHealthState('error');
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
  }, [checkApiHealth]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }
    api
      .getMe()
      .then((me) => {
        setUser(me.user || me);
      })
      .catch(() => {
        setStoredToken('');
        setUser(null);
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, []);

  const handleAuthSuccess = (authData) => {
    if (authData?.token) {
      setStoredToken(authData.token);
    }
    setUser(authData?.user || authData);
  };

  const handleOpenProject = (project) => {
    setActiveProject(project);
    try {
      sessionStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(project));
    } catch (_e) {
      // ignore
    }
  };

  const handleCloseProject = () => {
    setActiveProject(null);
    try {
      sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
    } catch (_e) {
      // ignore
    }
  };

  const handleLogout = () => {
    setStoredToken('');
    setUser(null);
    handleCloseProject();
    setAuthView('login');
  };

  return (
    <>
      <HeaderBar
        user={user}
        healthState={healthState}
        onRetryHealth={checkApiHealth}
        onGoProjects={handleCloseProject}
        onLogout={handleLogout}
      />

      {bootstrapping ? (
        <main className="page-container">
          <div className="surface-card" role="status">
            Connecting to TeamBoard API… (If hosted on Render free tier, waking up may take a moment.)
          </div>
        </main>
      ) : !user ? (
        authView === 'register' ? (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        ) : (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        )
      ) : activeProject ? (
        <BoardPage project={activeProject} onBackToProjects={handleCloseProject} />
      ) : (
        <ProjectsPage onOpenProject={handleOpenProject} />
      )}

      <footer
        style={{
          maxWidth: '1280px',
          margin: '32px auto 0',
          padding: '20px 16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <span>TeamBoard · A Kanban-based Project Management Web App for Student Teams (MSIS207)</span>
        <span>React + Express RESTful API v1 + MongoDB + Socket.IO + PWA</span>
      </footer>
    </>
  );
}

// Register Service Worker for PWA support (F12)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(<App />);
