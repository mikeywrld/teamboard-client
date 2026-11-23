import React from 'react';

const STATUS_ORDER = ['todo', 'doing', 'review', 'done'];
const STATUS_LABELS = {
  todo: 'To do',
  doing: 'Doing',
  review: 'Review',
  done: 'Done'
};

export function TaskCard({ task, onSelectTask, onMoveStatus, movingTaskId }) {
  const currentIdx = STATUS_ORDER.indexOf(task.status);
  const prevStatus = currentIdx > 0 ? STATUS_ORDER[currentIdx - 1] : null;
  const nextStatus =
    currentIdx >= 0 && currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null;

  const isBusy = movingTaskId === task.id;

  const dueAlertClass =
    task.dueAlert === 'overdue'
      ? 'overdue-card'
      : task.dueAlert === 'due_soon'
        ? 'duesoon-card'
        : '';

  const renderDueBadge = () => {
    if (!task.dueDate) return null;
    if (task.dueAlert === 'overdue') {
      return (
        <span className="due-badge overdue" title="Overdue task (F10 alert)">
          ⚠ Overdue · {task.dueDate}
        </span>
      );
    }
    if (task.dueAlert === 'due_soon') {
      return (
        <span className="due-badge due_soon" title="Due within 48 hours (F10 alert)">
          ⏰ Due &lt; 48h · {task.dueDate}
        </span>
      );
    }
    if (task.dueAlert === 'completed') {
      return <span className="due-badge completed">✓ Done · {task.dueDate}</span>;
    }
    return <span className="due-badge normal">📅 {task.dueDate}</span>;
  };

  return (
    <article
      className={`task-card ${dueAlertClass}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
      }}
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-top">
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
        {renderDueBadge()}
      </div>

      <button
        type="button"
        className="task-title-btn"
        onClick={() => onSelectTask(task)}
      >
        {task.title}
      </button>

      {task.description && <p className="task-desc-snippet">{task.description}</p>}

      <div className="task-meta-row">
        <span>
          {task.assignee ? `👤 ${task.assignee.name}` : '⚪ Unassigned'}
        </span>
        <span>💬 {task.commentCount || 0}</span>
      </div>

      <div className="task-actions-row">
        <div style={{ display: 'flex', gap: '4px' }}>
          {prevStatus && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={isBusy}
              onClick={() => onMoveStatus(task.id, prevStatus)}
              title={`Move back to ${STATUS_LABELS[prevStatus]}`}
            >
              ← {STATUS_LABELS[prevStatus]}
            </button>
          )}
          {nextStatus && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={isBusy}
              onClick={() => onMoveStatus(task.id, nextStatus)}
              title={`Move to ${STATUS_LABELS[nextStatus]}`}
            >
              {STATUS_LABELS[nextStatus]} →
            </button>
          )}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onSelectTask(task)}
        >
          Details
        </button>
      </div>
    </article>
  );
}
