import React, { useState } from 'react';
import { api } from '../api/client.js';

export function RegisterPage({ onSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register({ name, email, password });
      onSuccess(res);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div style={{ maxWidth: '480px', margin: '16px auto' }}>
        <section className="surface-card" aria-labelledby="register-heading">
          <p className="eyebrow">Create Student Account</p>
          <h1 id="register-heading" style={{ margin: '0 0 6px', fontSize: '24px' }}>
            Join TeamBoard
          </h1>
          <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Create an account to start a new student project or join with a teammate’s code.
          </p>

          {error && (
            <div className="alert-banner alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="register-name">Full Name *</label>
              <input
                id="register-name"
                className="form-control"
                type="text"
                required
                maxLength={100}
                placeholder="e.g., Tran Minh Khoa"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email Address *</label>
              <input
                id="register-email"
                className="form-control"
                type="email"
                required
                placeholder="student@uit.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password (min 6 chars) *</label>
              <input
                id="register-password"
                className="form-control"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
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
              {loading ? 'Creating account…' : 'Create account'}
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
            Already have an account?{' '}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-primary)', fontWeight: 700 }}
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
