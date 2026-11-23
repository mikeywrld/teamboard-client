import React, { useState } from 'react';
import { api } from '../api/client.js';

const DEMO_ACCOUNT = {
  label: 'Hoang Long (Project Owner)',
  email: 'long@student.uit.edu.vn',
  password: 'password123'
};

export function LoginPage({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      onSuccess(res);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setError('');
    setLoading(true);
    try {
      const res = await api.login({
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password
      });
      onSuccess(res);
    } catch (err) {
      setError(err.message || 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="auth-grid">
        <section className="hero-card" aria-labelledby="hero-heading">
          <p className="eyebrow">MSIS207 Final Project · Kanban Workspace</p>
          <h1 id="hero-heading" className="hero-title">
            Stop losing tasks in group chat. Track every contribution.
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>
            TeamBoard provides a lightweight 4-column Kanban board, deadline warnings, realtime
            Socket.IO sync, and an automated contribution log.
          </p>

          <ul className="feature-list">
            <li>
              <span>✅</span>
              <span>
                <strong>4-Column Kanban Board:</strong> To do, Doing, Review, Done with drag-and-drop
                and mobile 1-tap transitions.
              </span>
            </li>
            <li>
              <span>⏰</span>
              <span>
                <strong>48-Hour Deadline Alerts (F10):</strong> Automatically highlights overdue and
                due-soon tasks.
              </span>
            </li>
            <li>
              <span>📊</span>
              <span>
                <strong>Verifiable Contribution Stats &amp; CSV Export (F8, F9, F13):</strong> Every
                task move and comment is logged automatically.
              </span>
            </li>
            <li>
              <span>⚡</span>
              <span>
                <strong>Realtime Socket.IO + PWA (F11, F12):</strong> Instant board updates across
                tabs and installable web app manifest.
              </span>
            </li>
          </ul>

          <div className="demo-accounts-box">
            <strong style={{ fontSize: '13px', display: 'block' }}>
              🚀 1-Click Demo Sign-In:
            </strong>
            <div className="demo-accounts-grid">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={loading}
                onClick={handleQuickDemo}
              >
                {DEMO_ACCOUNT.label}
              </button>
            </div>
          </div>
        </section>

        <section className="surface-card" aria-labelledby="login-heading">
          <h2 id="login-heading" style={{ margin: '0 0 6px', fontSize: '22px' }}>
            Sign in to TeamBoard
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Enter your account credentials to open your project boards.
          </p>

          {error && (
            <div className="alert-banner alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                className="form-control"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="form-control"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div
            style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '13.5px'
            }}
          >
            New to TeamBoard?{' '}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-primary)', fontWeight: 700 }}
              onClick={onSwitchToRegister}
            >
              Create account
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
