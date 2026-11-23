const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

const TOKEN_STORAGE_KEY = 'teamboard_jwt_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (_e) {
    return '';
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (_e) {
    // ignore storage errors
  }
}

export async function apiRequest(path, { method = 'GET', body = undefined, token = getStoredToken(), signal = undefined } = {}) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const code = data?.error?.code || `HTTP_${response.status}`;
    const message = data?.error?.message || `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.code = code;
    throw err;
  }

  return data;
}

export const api = {
  checkHealth: (signal) => apiRequest('/api/v1/health', { token: '', signal }),

  register: (payload) =>
    apiRequest('/api/v1/auth/register', { method: 'POST', body: payload, token: '' }),

  login: (payload) =>
    apiRequest('/api/v1/auth/login', { method: 'POST', body: payload, token: '' }),

  getMe: () => apiRequest('/api/v1/auth/me'),

  listProjects: () => apiRequest('/api/v1/projects'),

  createProject: (payload) =>
    apiRequest('/api/v1/projects', { method: 'POST', body: payload }),

  joinProject: (joinCode) =>
    apiRequest('/api/v1/projects/join', { method: 'POST', body: { joinCode } }),

  getProject: (projectId) => apiRequest(`/api/v1/projects/${projectId}`),

  deleteProject: (projectId) =>
    apiRequest(`/api/v1/projects/${projectId}`, { method: 'DELETE' }),

  listMembers: (projectId) => apiRequest(`/api/v1/projects/${projectId}/members`),

  listTasks: (projectId, params = {}) => {
    const search = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        search.set(key, String(val));
      }
    }
    const qs = search.toString();
    return apiRequest(`/api/v1/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`);
  },

  createTask: (projectId, payload) =>
    apiRequest(`/api/v1/projects/${projectId}/tasks`, { method: 'POST', body: payload }),

  getTask: (taskId) => apiRequest(`/api/v1/tasks/${taskId}`),

  updateTask: (taskId, payload) =>
    apiRequest(`/api/v1/tasks/${taskId}`, { method: 'PUT', body: payload }),

  moveTaskStatus: (taskId, status) =>
    apiRequest(`/api/v1/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status }
    }),

  deleteTask: (taskId) =>
    apiRequest(`/api/v1/tasks/${taskId}`, { method: 'DELETE' }),

  listComments: (taskId) => apiRequest(`/api/v1/tasks/${taskId}/comments`),

  addComment: (taskId, content) =>
    apiRequest(`/api/v1/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { content }
    }),

  listActivities: (projectId) => apiRequest(`/api/v1/projects/${projectId}/activities`),

  getStats: (projectId) => apiRequest(`/api/v1/projects/${projectId}/stats`),

  downloadStatsCsv: async (projectId) => {
    const csvText = await apiRequest(`/api/v1/projects/${projectId}/stats?format=csv`);
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teamboard-stats-project-${projectId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
