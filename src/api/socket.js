import { io } from 'socket.io-client';
import { API_BASE_URL, getStoredToken } from './client.js';

export function connectProjectSocket(projectId, handlers = {}) {
  const token = getStoredToken();
  if (!token || !projectId) return () => {};

  const socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    handlers.onStatusChange?.('connected');
    socket.emit('project:join', projectId, (ack) => {
      if (ack?.ok) {
        handlers.onStatusChange?.('joined');
      }
    });
  });

  socket.on('disconnect', () => {
    handlers.onStatusChange?.('disconnected');
  });

  socket.on('connect_error', () => {
    handlers.onStatusChange?.('offline');
  });

  if (handlers.onTaskCreated) socket.on('task:created', handlers.onTaskCreated);
  if (handlers.onTaskUpdated) socket.on('task:updated', handlers.onTaskUpdated);
  if (handlers.onTaskMoved) socket.on('task:moved', handlers.onTaskMoved);
  if (handlers.onTaskDeleted) socket.on('task:deleted', handlers.onTaskDeleted);
  if (handlers.onCommentAdded) socket.on('comment:added', handlers.onCommentAdded);
  if (handlers.onActivityCreated) socket.on('activity:created', handlers.onActivityCreated);

  return () => {
    socket.emit('project:leave', projectId);
    socket.disconnect();
  };
}
