import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { connectProjectSocket } from '../api/socket.js';
import { Column } from '../components/Column.jsx';
import { TaskModal } from '../components/TaskModal.jsx';
import { MemberList } from '../components/MemberList.jsx';
import { ActivityPanel } from '../components/ActivityPanel.jsx';
import { StatsPage } from './Stats.jsx';

const COLUMNS = [
  { status: 'todo', title: 'To do' },
  { status: 'doing', title: 'Doing' },
  { status: 'review', title: 'Review' },
  { status: 'done', title: 'Done' }
];

export function BoardPage({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'members' | 'activity' | 'stats'

  // Tasks & Pagination state (F4, F6)
  const [tasks, setTasks] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, perPage: 50, total: 0, totalPages: 1 });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState('');

  // Filters (F6)
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('-created-at');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  // Members & Activities
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState('todo');
  const [movingTaskId, setMovingTaskId] = useState(null);

  // Socket.IO Realtime Status (F11)
  const [socketState, setSocketState] = useState('connecting');
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setError('');
    try {
      const res = await api.listTasks(project.id, {
        q: searchQuery.trim() || undefined,
        assignee: assigneeFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        sort: sortBy,
        page,
        'per-page': perPage
      });
      setTasks(res.items || []);
      setPageInfo({
        page: res.page || 1,
        perPage: res.perPage || perPage,
        total: res.total || 0,
        totalPages: res.totalPages || 1
      });
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [project.id, searchQuery, assigneeFilter, statusFilter, priorityFilter, sortBy, page, perPage]);

  const fetchMembersAndActivities = useCallback(async () => {
    try {
      const [mList, aList] = await Promise.all([
        api.listMembers(project.id),
        api.listActivities(project.id)
      ]);
      setMembers(mList || []);
      setActivities(aList || []);
    } catch (_err) {
      // non-fatal
    }
  }, [project.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchMembersAndActivities();
  }, [fetchMembersAndActivities]);

  // Connect Socket.IO room for realtime updates (F11)
  useEffect(() => {
    const disconnect = connectProjectSocket(project.id, {
      onStatusChange: (st) => setSocketState(st),
      onTaskCreated: () => {
        fetchTasks();
        fetchMembersAndActivities();
      },
      onTaskUpdated: () => {
        fetchTasks();
        fetchMembersAndActivities();
      },
      onTaskMoved: () => {
        fetchTasks();
        fetchMembersAndActivities();
      },
      onTaskDeleted: () => {
        fetchTasks();
        fetchMembersAndActivities();
      },
      onCommentAdded: () => {
        fetchTasks();
        fetchMembersAndActivities();
      }
    });
    return disconnect;
  }, [project.id, fetchTasks, fetchMembersAndActivities]);

  const handleMoveStatus = async (taskId, nextStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target || target.status === nextStatus) return;

    setMovingTaskId(taskId);
    setError('');
    try {
      const updated = await api.moveTaskStatus(taskId, nextStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      fetchMembersAndActivities();
    } catch (err) {
      setError(err.message || 'Could not move task');
    } finally {
      setMovingTaskId(null);
    }
  };

  const handleOpenNewTask = (initialStatus = 'todo') => {
    setSelectedTask(null);
    setDefaultModalStatus(initialStatus);
    setModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setSelectedTask(task);
    setDefaultModalStatus(task.status);
    setModalOpen(true);
  };

  const handleTaskSaved = (savedTask, options = {}) => {
    fetchTasks();
    fetchMembersAndActivities();
    if (!options.keepOpen) {
      setModalOpen(false);
      setSelectedTask(null);
    } else {
      setSelectedTask(savedTask);
    }
  };

  const handleTaskDeleted = () => {
    setModalOpen(false);
    setSelectedTask(null);
    fetchTasks();
    fetchMembersAndActivities();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(project.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (_e) {
      setCopiedCode(false);
    }
  };

  // Count overdue & due-soon tasks (F10)
  const overdueCount = tasks.filter((t) => t.dueAlert === 'overdue').length;
  const dueSoonCount = tasks.filter((t) => t.dueAlert === 'due_soon').length;

  return (
    <main className="page-container">
      {/* Top Project Bar */}
      <div className="board-topbar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBackToProjects}
            >
              ← Projects
            </button>
            <h1 style={{ margin: 0, fontSize: '22px' }}>{project.name}</h1>
            <span className={`role-badge ${project.role || 'member'}`}>
              {project.role || 'member'}
            </span>
            <button
              type="button"
              className="join-code-pill"
              style={{ cursor: 'pointer' }}
              onClick={handleCopyCode}
              title="Click to copy project Join Code"
            >
              🔑 {project.joinCode} {copiedCode ? '(Copied!)' : ''}
            </button>
            <span
              className="health-pill"
              title="Socket.IO Realtime Sync Status (F11)"
            >
              <span
                className={`health-dot ${
                  socketState === 'joined' || socketState === 'connected' ? 'ok' : 'loading'
                }`}
              />
              Realtime: {socketState === 'joined' ? 'Live' : socketState}
            </span>
          </div>
          {project.description && (
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {project.description}
            </p>
          )}
        </div>

        <nav className="board-tabs" aria-label="Project sections">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
            onClick={() => setActiveTab('board')}
          >
            📋 Board ({pageInfo.total})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            👥 Members ({members.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            🕒 Activity ({activities.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats &amp; CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenNewTask('todo')}
          >
            + New Task
          </button>
        </nav>
      </div>

      {error && (
        <div className="alert-banner alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Deadline warning banner (F10) */}
      {activeTab === 'board' && (overdueCount > 0 || dueSoonCount > 0) && (
        <div className="alert-banner alert-info" role="status">
          ⏰ <strong>Deadline Alert (F10):</strong> This board has{' '}
          <strong>{overdueCount} overdue</strong> task(s) and{' '}
          <strong>{dueSoonCount} task(s) due within 48 hours</strong>.
        </div>
      )}

      {activeTab === 'board' && (
        <>
          {/* Filter, Search, Sort & Pagination Bar (F6) */}
          <section className="filter-bar" aria-label="Filter and search tasks">
            <div className="filter-field">
              <label htmlFor="filter-search-q">Search Tasks (q)</label>
              <input
                id="filter-search-q"
                className="form-control"
                type="search"
                placeholder="Search title or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="filter-assignee">Assignee</label>
              <select
                id="filter-assignee"
                className="form-control"
                value={assigneeFilter}
                onChange={(e) => {
                  setAssigneeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Members</option>
                <option value="unassigned">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                className="form-control"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Columns</option>
                <option value="todo">To do</option>
                <option value="doing">Doing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-priority">Priority</label>
              <select
                id="filter-priority"
                className="form-control"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-sort">Sort By</label>
              <select
                id="filter-sort"
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="-created-at">Newest First (-created-at)</option>
                <option value="created-at">Oldest First (created-at)</option>
                <option value="due-date">Due Date Earliest (due-date)</option>
                <option value="-due-date">Due Date Latest (-due-date)</option>
                <option value="-priority">Priority High→Low (-priority)</option>
                <option value="title">Title A→Z (title)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {(searchQuery || assigneeFilter || statusFilter || priorityFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setAssigneeFilter('');
                    setStatusFilter('');
                    setPriorityFilter('');
                    setPage(1);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </section>

          {/* 4-Column Kanban Board */}
          {loadingTasks ? (
            <div className="surface-card">Loading Kanban board…</div>
          ) : (
            <div className="kanban-board">
              {COLUMNS.map((col) => (
                <Column
                  key={col.status}
                  status={col.status}
                  title={col.title}
                  tasks={tasks.filter((t) => t.status === col.status)}
                  onSelectTask={handleOpenEditTask}
                  onMoveStatus={handleMoveStatus}
                  onQuickAdd={handleOpenNewTask}
                  movingTaskId={movingTaskId}
                />
              ))}
            </div>
          )}

          {/* Pagination Footer (F6) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '14px',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            <div>
              Showing <strong>{tasks.length}</strong> of <strong>{pageInfo.total}</strong> tasks ·
              Page <strong>{pageInfo.page}</strong> of <strong>{pageInfo.totalPages}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="per-page-select" style={{ fontSize: '12px', fontWeight: 600 }}>
                Per page:
              </label>
              <select
                id="per-page-select"
                className="form-control"
                style={{ width: 'auto', padding: '4px 8px' }}
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= pageInfo.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'members' && <MemberList project={project} members={members} />}

      {activeTab === 'activity' && (
        <ActivityPanel activities={activities} onRefresh={fetchMembersAndActivities} />
      )}

      {activeTab === 'stats' && (
        <StatsPage project={project} onBackToBoard={() => setActiveTab('board')} />
      )}

      {modalOpen && (
        <TaskModal
          projectId={project.id}
          task={selectedTask}
          defaultStatus={defaultModalStatus}
          members={members}
          onClose={() => {
            setModalOpen(false);
            setSelectedTask(null);
          }}
          onSaved={handleTaskSaved}
          onDeleted={handleTaskDeleted}
        />
      )}
    </main>
  );
}
