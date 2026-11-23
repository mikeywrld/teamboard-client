import React from 'react';

const ACTION_LABELS = {
  project_created: '🌱 Created Project',
  member_joined: '🤝 Joined Project',
  task_created: '➕ Created Task',
  task_updated: '✏️ Updated Task',
  task_moved: '🔄 Moved Task Column',
  task_deleted: '🗑️ Deleted Task',
  comment_added: '💬 Added Comment'
};

export function ActivityPanel({ activities, onRefresh }) {
  return (
    <section className="surface-card" aria-labelledby="activity-heading">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <div>
          <h2 id="activity-heading" style={{ margin: '0 0 4px', fontSize: '20px' }}>
            Automated Activity Log ({activities.length})
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Every task creation, status transition, update, and comment is automatically recorded with its actor.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No activities recorded yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Task</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700 }}>{a.actor?.name || 'Member'}</td>
                  <td>
                    <span className="join-code-pill">
                      {ACTION_LABELS[a.action] || a.action}
                    </span>
                  </td>
                  <td>{a.taskTitle || (a.taskId ? `Task #${a.taskId}` : '—')}</td>
                  <td>{a.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
