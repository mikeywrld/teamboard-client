import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function ProjectsPage({ onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Create Project Form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Join Project Form
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await api.listProjects();
      setProjects(list || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setCreating(true);
    try {
      const created = await api.createProject({ name: newName, description: newDesc });
      setProjects((prev) => [created, ...prev]);
      setNewName('');
      setNewDesc('');
      setNotice(`Created project "${created.name}" with Join Code ${created.joinCode}`);
    } catch (err) {
      setError(err.message || 'Could not create project');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setJoining(true);
    try {
      const joined = await api.joinProject(joinCode.trim());
      await loadProjects();
      setJoinCode('');
      setNotice(`Joined project "${joined.name}" (${joined.joinCode})`);
    } catch (err) {
      setError(err.message || 'Could not join project with that code');
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteProject = async (project) => {
    setError('');
    setNotice('');
    try {
      await api.deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setNotice(`Deleted project "${project.name}"`);
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  return (
    <main className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <p className="eyebrow">Workspace Overview</p>
        <h1 style={{ margin: '0 0 6px', fontSize: '28px' }}>My Projects</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Create a new project for your team or enter a join code shared by your team lead.
        </p>
      </div>

      {error && (
        <div className="alert-banner alert-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="alert-banner alert-success" role="status">
          {notice}
        </div>
      )}

      <div className="projects-Split">
        <section className="surface-card" aria-labelledby="create-project-heading">
          <h2 id="create-project-heading" style={{ margin: '0 0 12px', fontSize: '18px' }}>
            Create New Project
          </h2>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="project-name-input">Project Name *</label>
              <input
                id="project-name-input"
                className="form-control"
                type="text"
                required
                maxLength={120}
                placeholder="e.g., Web Development Group 04"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-desc-input">Description (optional)</label>
              <input
                id="project-desc-input"
                className="form-control"
                type="text"
                placeholder="Short summary of project goals and deadlines"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating…' : '+ Create Project'}
            </button>
          </form>
        </section>

        <section className="surface-card" aria-labelledby="join-project-heading">
          <h2 id="join-project-heading" style={{ margin: '0 0 12px', fontSize: '18px' }}>
            Join with Invite Code
          </h2>
          <form onSubmit={handleJoinProject}>
            <div className="form-group">
              <label htmlFor="join-code-input">Project Join Code *</label>
              <input
                id="join-code-input"
                className="form-control"
                type="text"
                required
                placeholder="e.g., TB-MSIS207 or TB-DEMO05"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Ask your project owner for their unique <code>TB-...</code> code. Demo codes:{' '}
              <code>TB-MSIS207</code>, <code>TB-DEMO05</code>.
            </p>
            <button type="submit" className="btn btn-secondary" disabled={joining}>
              {joining ? 'Joining…' : 'Join with Code →'}
            </button>
          </form>
        </section>
      </div>

      <section aria-labelledby="project-list-heading">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}
        >
          <h2 id="project-list-heading" style={{ margin: 0, fontSize: '20px' }}>
            Active Projects ({projects.length})
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={loadProjects}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="surface-card">Loading your projects…</div>
        ) : projects.length === 0 ? (
          <div className="surface-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ margin: '0 0 8px' }}>Create or join your first project</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Use the forms above to start a new project board or join an existing team with a code.
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p) => {
              const pct =
                p.taskCount > 0 ? Math.round(((p.doneCount || 0) / p.taskCount) * 100) : 0;
              return (
                <article key={p.id} className="project-card">
                  <div>
                    <div className="project-card-header">
                      <h3 style={{ margin: 0, fontSize: '18px' }}>{p.name}</h3>
                      <span className={`role-badge ${p.role}`}>{p.role}</span>
                    </div>
                    {p.description && (
                      <p
                        style={{
                          margin: '8px 0 0',
                          fontSize: '13.5px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12.5px',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}
                    >
                      <span>👥 {p.memberCount || 1} members</span>
                      <span>
                        ✓ {p.doneCount || 0}/{p.taskCount || 0} tasks done ({pct}%)
                      </span>
                    </div>
                    <div className="progress-track" aria-label={`Completion ${pct}%`}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '14px',
                        gap: '8px'
                      }}
                    >
                      <span className="join-code-pill" title="Project Join Code">
                        Code: {p.joinCode}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.role === 'owner' && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProject(p)}
                          >
                            Delete
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenProject(p)}
                        >
                          Open Board →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
