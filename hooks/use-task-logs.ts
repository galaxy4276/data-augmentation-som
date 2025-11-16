import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { taskApi } from "@/lib/api";
import { useTaskStore } from "@/store/task-store";
import type { LogLevel, TaskLogsResponse } from "@/types/api";

/**
 * Hook to fetch and cache task logs
 * Includes local caching and real-time updates
 */
export function useTaskLogs(
  taskId: string | null | undefined,
  params?: {
    page?: number;
    page_size?: number;
    level?: LogLevel;
    search?: string;
  },
) {
  const addTaskLogs = useTaskStore((state) => state.addTaskLogs);
  const getTaskType = useTaskStore((state) => state.getTaskType);

  const query = useQuery<TaskLogsResponse, Error>({
    queryKey: ["task-logs", taskId, params],
    queryFn: () => {
      if (!taskId) throw new Error("Task ID is required");
      const taskType = getTaskType(taskId);
      return taskApi.getTaskLogs(taskId, taskType, params);
    },
    enabled: !!taskId,
    staleTime: 1000, // Consider logs stale after 1 second
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 2 seconds if there are recent logs (task likely running)
      const hasRecentLogs = data?.logs.some((log) => {
        const logTime = new Date(log.timestamp);
        const oneMinuteAgo = new Date(Date.now() - 60000);
        return logTime > oneMinuteAgo;
      });
      return hasRecentLogs ? 2000 : false;
    },
  });

  // Update store when logs change
  useEffect(() => {
    if (query.data && taskId) {
      addTaskLogs(taskId, query.data.logs);
    }
  }, [query.data, taskId, addTaskLogs]);

  return query;
}

/**
 * Hook to get cached task logs for a specific task
 */
export function useCachedTaskLogs(taskId: string | null | undefined) {
  const getTaskLogs = useTaskStore((state) => state.getTaskLogs);

  return taskId ? getTaskLogs(taskId) : [];
}

/**
 * Hook to manage log viewer preferences
 */
export function useLogViewerPreferences() {
  const preferences = useTaskStore((state) => state.logViewerPreferences);
  const setPreferences = useTaskStore((state) => state.setLogViewerPreferences);

  return {
    ...preferences,
    updatePreferences: (newPrefs: Partial<typeof preferences>) => {
      setPreferences(newPrefs);
    },
    toggleAutoScroll: () => {
      setPreferences({ autoScroll: !preferences.autoScroll });
    },
    setPageSize: (pageSize: number) => {
      setPreferences({ pageSize });
    },
    setSelectedLevels: (selectedLevels: LogLevel[]) => {
      setPreferences({ selectedLevels });
    },
  };
}
