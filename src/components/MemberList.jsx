import React, { useState } from 'react';

export function MemberList({ project, members }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(project.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {
      setCopied(false);
    }
  };

  return (
    <section className="surface-card" aria-labelledby="members-heading">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '18px'
        }}
      >
        <div>
          <h2 id="members-heading" style={{ margin: '0 0 4px', fontSize: '20px' }}>
            Project Members ({members.length})
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Share the invite code below with teammates so they can join this project board.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="join-code-pill">Join Code: {project.joinCode}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyCode}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined At</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId}>
                <td style={{ fontWeight: 700 }}>{m.name}</td>
                <td>{m.email}</td>
                <td>
                  <span className={`role-badge ${m.role}`}>{m.role}</span>
                </td>
                <td>{new Date(m.joinedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
