import React, { useState } from 'react';
import { TaskCard } from './TaskCard.jsx';

export function Column({
  status,
  title,
  tasks,
  onSelectTask,
  onMoveStatus,
  onQuickAdd,
  movingTaskId
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isInteger(taskId) && taskId > 0) {
      onMoveStatus(taskId, status);
    }
  };

  return (
    <section
      className={`kanban-column ${dragOver ? 'drag-over' : ''}`}
      aria-labelledby={`col-heading-${status}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h2 id={`col-heading-${status}`} style={{ margin: 0, fontSize: '13px' }}>
          <span className={`status-pill ${status}`}>{title}</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="column-count">{tasks.length}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onQuickAdd(status)}
            aria-label={`Add task to ${title}`}
          >
            + Add
          </button>
        </div>
      </div>

      <div className="column-cards">
        {tasks.length === 0 ? (
          <p
            style={{
              margin: '16px 0',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            No tasks in {title}
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
              onMoveStatus={onMoveStatus}
              movingTaskId={movingTaskId}
            />
          ))
        )}
      </div>
    </section>
  );
}
