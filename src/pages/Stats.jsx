import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function StatsPage({ project, onBackToBoard }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getStats(project.id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load contribution stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [project.id]);

  const handleExportCsv = async () => {
    setDownloading(true);
    setError('');
    try {
      await api.downloadStatsCsv(project.id);
    } catch (err) {
      setError(err.message || 'Failed to export CSV report');
    } finally {
      setDownloading(false);
    }
  };

  const summary = data?.summary || {};
  const members = data?.members || [];

  return (
    <section aria-labelledby="stats-heading">
      <div
        className="surface-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div>
          <h2 id="stats-heading" style={{ margin: '0 0 4px', fontSize: '20px' }}>
            Contribution Statistics · {project.name}
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Transparent breakdown of tasks assigned, tasks completed, and comments per team member (F9 &amp; F13).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBackToBoard}>
            ← Back to Board
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={downloading || loading}
            onClick={handleExportCsv}
          >
            {downloading ? 'Exporting…' : '⬇ Export CSV Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface-card">Calculating contribution statistics…</div>
      ) : (
        <>
          <div className="stats-summary-grid">
            <div className="stat-metric-card">
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                TOTAL TASKS
              </div>
              <div className="stat-metric-value">{summary.totalTasks || 0}</div>
            </div>
            <div className="stat-metric-card">
              <div style={{ fontSize: '12px', color: 'var(--status-done)', fontWeight: 700 }}>
                DONE TASKS
              </div>
              <div className="stat-metric-value" style={{ color: 'var(--status-done)' }}>
                {summary.doneCount || 0}
              </div>
            </div>
            <div className="stat-metric-card">
              <div style={{ fontSize: '12px', color: 'var(--status-doing)', fontWeight: 700 }}>
                IN PROGRESS / REVIEW
              </div>
              <div className="stat-metric-value" style={{ color: 'var(--status-doing)' }}>
                {(summary.doingCount || 0) + (summary.reviewCount || 0)}
              </div>
            </div>
            <div className="stat-metric-card">
              <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 700 }}>
                OVERDUE / DUE &lt; 48H
              </div>
              <div className="stat-metric-value" style={{ color: 'var(--danger)' }}>
                {summary.overdueCount || 0} / {summary.dueSoonCount || 0}
              </div>
            </div>
            <div className="stat-metric-card">
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                COMMENTS / LOGS
              </div>
              <div className="stat-metric-value">
                {summary.totalComments || 0} / {summary.totalActivities || 0}
              </div>
            </div>
          </div>

          <div className="surface-card">
            <h3 style={{ margin: '0 0 12px', fontSize: '17px' }}>
              Member Contribution Breakdown
            </h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Assigned</th>
                    <th>To Do</th>
                    <th>Doing</th>
                    <th>Review</th>
                    <th>Done</th>
                    <th>Overdue</th>
                    <th>Comments</th>
                    <th>Activities</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.userId}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.email}</div>
                      </td>
                      <td>
                        <span className={`role-badge ${m.role}`}>{m.role}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{m.assignedTasks}</td>
                      <td>{m.todoTasks}</td>
                      <td>{m.doingTasks}</td>
                      <td>{m.reviewTasks}</td>
                      <td style={{ fontWeight: 700, color: 'var(--status-done)' }}>
                        {m.completedTasks}
                      </td>
                      <td style={{ color: m.overdueTasks > 0 ? 'var(--danger)' : 'inherit', fontWeight: m.overdueTasks > 0 ? 700 : 400 }}>
                        {m.overdueTasks}
                      </td>
                      <td>{m.commentCount}</td>
                      <td>{m.activityCount}</td>
                      <td style={{ minWidth: '120px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>
                          {m.completionRate}%
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${m.completionRate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
