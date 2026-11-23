import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function TaskModal({
  projectId,
  task,
  defaultStatus = 'todo',
  members = [],
  onClose,
  onSaved,
  onDeleted
}) {
  const isEditing = Boolean(task?.id);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || defaultStatus);
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [assigneeId, setAssigneeId] = useState(
    task?.assigneeId ? String(task.assigneeId) : ''
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Comments state (F7)
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    setLoadingComments(true);
    api
      .listComments(task.id)
      .then((list) => {
        if (active) setComments(list || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingComments(false);
      });
    return () => {
      active = false;
    };
  }, [isEditing, task?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        status,
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId ? Number(assigneeId) : null
      };

      let saved;
      if (isEditing) {
        saved = await api.updateTask(task.id, payload);
        if (status !== task.status) {
          saved = await api.moveTaskStatus(task.id, status);
        }
      } else {
        saved = await api.createTask(projectId, payload);
      }
      onSaved(saved);
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setError('');
    setDeleting(true);
    try {
      await api.deleteTask(task.id);
      onDeleted(task.id);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      setDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isEditing) return;
    setPostingComment(true);
    setError('');
    try {
      const added = await api.addComment(task.id, commentText.trim());
      setComments((prev) => [...prev, added]);
      setCommentText('');
      onSaved({ ...task, commentCount: (task.commentCount || 0) + 1 }, { keepOpen: true });
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <h2 id="task-modal-title" style={{ margin: 0, fontSize: '20px' }}>
            {isEditing ? `Edit Task #${task.id}` : 'Create New Task'}
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {error && (
          <div className="alert-banner alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title-input">Title *</label>
            <input
              id="task-title-input"
              className="form-control"
              type="text"
              required
              maxLength={120}
              placeholder="e.g., Implement REST API v1 endpoints"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc-input">Description</label>
            <textarea
              id="task-desc-input"
              className="form-control"
              placeholder="Acceptance criteria, notes, or implementation details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}
          >
            <div className="form-group">
              <label htmlFor="task-assignee-select">Assignee</label>
              <select
                id="task-assignee-select"
                className="form-control"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-status-select">Column Status</label>
              <select
                id="task-status-select"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To do</option>
                <option value="doing">Doing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority-select">Priority</label>
              <select
                id="task-priority-select"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-duedate-input">Due Date</label>
              <input
                id="task-duedate-input"
                className="form-control"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting || saving}
                  onClick={handleDelete}
                >
                  {deleting ? 'Deleting…' : 'Delete Task'}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Task'}
              </button>
            </div>
          </div>
        </form>

        {isEditing && (
          <section
            aria-labelledby="task-comments-heading"
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <h3 id="task-comments-heading" style={{ margin: '0 0 12px', fontSize: '16px' }}>
              Comments ({comments.length})
            </h3>

            {loadingComments ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading comments…</p>
            ) : comments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No comments yet. Share progress or ask a question below.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
                {comments.map((c) => (
                  <article
                    key={c.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}
                    >
                      <strong>{c.author?.name || 'Member'}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>{c.content}</p>
                  </article>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
              <label htmlFor="new-comment-input" style={{ position: 'absolute', left: '-9999px' }}>
                Add a comment
              </label>
              <input
                id="new-comment-input"
                className="form-control"
                type="text"
                placeholder="Write a comment on this task..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={postingComment || !commentText.trim()}
              >
                {postingComment ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
