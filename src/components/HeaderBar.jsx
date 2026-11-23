import React from 'react';
import { API_BASE_URL } from '../api/client.js';

export function HeaderBar({ user, healthState, onRetryHealth, onGoProjects, onLogout }) {
  const statusLabel =
    healthState === 'ok'
      ? 'API Online'
      : healthState === 'loading'
        ? 'Waking API…'
        : 'API Offline';

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="brand-link"
            onClick={onGoProjects}
            aria-label="Go to TeamBoard home"
          >
            TeamBoard
            <span className="brand-badge">MSIS207</span>
          </button>
          <span
            className="health-pill"
            role="status"
            title="API Server Health Status (Render wake-up indicator)"
          >
            <span className={`health-dot ${healthState}`} />
            {statusLabel}
          </span>
          {healthState === 'error' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRetryHealth}>
              Retry API
            </button>
          )}
        </div>

        <nav className="header-right" aria-label="Main navigation">
          <a
            href={`${API_BASE_URL}/api/v1/docs`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
          >
            API v1 Docs ↗
          </a>
          {user && (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onGoProjects}>
                My Projects
              </button>
              <span className="user-chip" title={user.email}>
                👤 {user.name}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
                Sign out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
