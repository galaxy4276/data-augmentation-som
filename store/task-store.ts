import { create } from 'zustand';
import type { TaskStatusResponse, TaskLogEntry, LogLevel } from '@/types/api';

interface TaskStore {
  // Active tasks tracking
  activeTasks: Map<string, TaskStatusResponse>;
  taskTypes: Map<string, 'extraction' | 'augmentation'>;

  // Cached arrays for selectors (to prevent infinite loops)
  runningTasks: TaskStatusResponse[];
  completedTasks: TaskStatusResponse[];
  failedTasks: TaskStatusResponse[];

  // Task actions
  addTask: (taskId: string, status: TaskStatusResponse, type?: 'extraction' | 'augmentation') => void;
  updateTask: (taskId: string, status: TaskStatusResponse) => void;
  removeTask: (taskId: string) => void;
  getTask: (taskId: string) => TaskStatusResponse | undefined;
  getTaskType: (taskId: string) => 'extraction' | 'augmentation' | undefined;

  // Task queries
  hasActiveTasks: () => boolean;

  // Clear actions
  clearCompletedTasks: () => void;
  clearAllTasks: () => void;

  // Export history
  exportHistory: Array<{
    timestamp: string;
    datasetType: string;
    filters?: Record<string, unknown>;
    filename: string;
    status: 'success' | 'error';
    error?: string;
  }>;
  addExportHistory: (entry: {
    timestamp: string;
    datasetType: string;
    filters?: Record<string, unknown>;
    filename: string;
    status: 'success' | 'error';
    error?: string;
  }) => void;

  // Task logs cache
  taskLogs: Map<string, TaskLogEntry[]>;
  addTaskLogs: (taskId: string, logs: TaskLogEntry[]) => void;
  getTaskLogs: (taskId: string) => TaskLogEntry[];
  clearTaskLogs: (taskId?: string) => void;

  // Log viewer preferences
  logViewerPreferences: {
    autoScroll: boolean;
    pageSize: number;
    selectedLevels: LogLevel[];
  };
  setLogViewerPreferences: (preferences: Partial<{
    autoScroll: boolean;
    pageSize: number;
    selectedLevels: LogLevel[];
  }>) => void;

  // Internal helper to update cached arrays
  _updateCachedArrays: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  activeTasks: new Map(),
  taskTypes: new Map(),
  runningTasks: [],
  completedTasks: [],
  failedTasks: [],
  exportHistory: [],
  taskLogs: new Map(),
  logViewerPreferences: {
    autoScroll: true,
    pageSize: 50,
    selectedLevels: [],
  },

  // Internal helper to update cached arrays
  _updateCachedArrays: () => {
    const tasks = Array.from(get().activeTasks.values());
    set({
      runningTasks: tasks.filter(
        (task) => task.status === 'pending' || task.status === 'running'
      ),
      completedTasks: tasks.filter((task) => task.status === 'completed'),
      failedTasks: tasks.filter((task) => task.status === 'failed'),
    });
  },

  // Task actions
  addTask: (taskId, status, type) => {
    set((state) => {
      const newTasks = new Map(state.activeTasks);
      const newTypes = new Map(state.taskTypes);
      newTasks.set(taskId, status);
      if (type) {
        newTypes.set(taskId, type);
      }
      return {
        activeTasks: newTasks,
        taskTypes: newTypes,
      };
    });
    get()._updateCachedArrays();
  },

  updateTask: (taskId, status) => {
    set((state) => {
      const newTasks = new Map(state.activeTasks);
      if (newTasks.has(taskId)) {
        newTasks.set(taskId, status);
      }
      return { activeTasks: newTasks };
    });
    get()._updateCachedArrays();
  },

  removeTask: (taskId) => {
    set((state) => {
      const newTasks = new Map(state.activeTasks);
      const newTypes = new Map(state.taskTypes);
      newTasks.delete(taskId);
      newTypes.delete(taskId);
      return {
        activeTasks: newTasks,
        taskTypes: newTypes,
      };
    });
    get()._updateCachedArrays();
  },

  getTask: (taskId) => {
    return get().activeTasks.get(taskId);
  },

  getTaskType: (taskId) => {
    return get().taskTypes.get(taskId);
  },

  // Task queries
  hasActiveTasks: () => {
    return get().runningTasks.length > 0;
  },

  // Clear actions
  clearCompletedTasks: () => {
    set((state) => {
      const newTasks = new Map(state.activeTasks);
      for (const [taskId, task] of newTasks.entries()) {
        if (task.status === 'completed') {
          newTasks.delete(taskId);
        }
      }
      return { activeTasks: newTasks };
    });
    get()._updateCachedArrays();
  },

  clearAllTasks: () => {
    set({
      activeTasks: new Map(),
      taskTypes: new Map(),
      runningTasks: [],
      completedTasks: [],
      failedTasks: [],
    });
  },

  // Export history
  addExportHistory: (entry) => {
    set((state) => ({
      exportHistory: [
        entry,
        ...state.exportHistory,
      ].slice(0, 50), // Keep last 50 exports
    }));
  },

  // Task logs methods
  addTaskLogs: (taskId, logs) => {
    set((state) => {
      const newTaskLogs = new Map(state.taskLogs);
      const existingLogs = newTaskLogs.get(taskId) || [];

      // Merge logs, avoiding duplicates
      const existingLogIds = new Set(existingLogs.map(log => log.id));
      const newUniqueLogs = logs.filter(log => !existingLogIds.has(log.id));
      const mergedLogs = [...existingLogs, ...newUniqueLogs];

      newTaskLogs.set(taskId, mergedLogs);
      return { taskLogs: newTaskLogs };
    });
  },

  getTaskLogs: (taskId) => {
    return get().taskLogs.get(taskId) || [];
  },

  clearTaskLogs: (taskId) => {
    set((state) => {
      const newTaskLogs = new Map(state.taskLogs);
      if (taskId) {
        newTaskLogs.delete(taskId);
      } else {
        newTaskLogs.clear();
      }
      return { taskLogs: newTaskLogs };
    });
  },

  // Log viewer preferences
  setLogViewerPreferences: (preferences) => {
    set((state) => ({
      logViewerPreferences: {
        ...state.logViewerPreferences,
        ...preferences,
      },
    }));
  },
}));
