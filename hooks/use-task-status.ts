import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTaskNotification } from "@/components/notification-toast";
import { taskApi } from "@/lib/api";
import { useTaskStore } from "@/store/task-store";
import type { TaskStatusResponse } from "@/types/api";

/**
 * Hook to fetch task status with conditional polling
 * Polls every 2 seconds when task is running, stops when completed/failed
 * Includes automatic notifications for status changes
 */
export function useTaskStatus(taskId: string | null | undefined) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const getTaskType = useTaskStore((state) => state.getTaskType);
  const { notifyPending, notifyRunning, notifyCompleted, notifyFailed } =
    useTaskNotification();
  const [notifiedStatuses, setNotifiedStatuses] = useState<Set<string>>(
    new Set(),
  );

  const query = useQuery<TaskStatusResponse, Error>({
    queryKey: ["task", taskId],
    queryFn: () => {
      const taskType = getTaskType(taskId!);
      return taskApi.getTaskStatus(taskId!, taskType);
    },
    enabled: !!taskId, // Only fetch if taskId is provided
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 2 seconds if task is pending or running
      if (data?.status === "pending" || data?.status === "running") {
        return 2000;
      }
      // Stop polling if completed or failed
      return false;
    },
    staleTime: 0, // Always fetch fresh data
  });

  // Handle notifications for status changes
  useEffect(() => {
    if (!query.data || !taskId) return;

    const status = query.data.status;
    const taskType = getTaskType(taskId);
    const notificationKey = `${taskId}-${status}`;

    // Only notify once per status change
    if (!notifiedStatuses.has(notificationKey)) {
      switch (status) {
        case "pending":
          notifyPending(taskType, taskId);
          break;
        case "running":
          notifyRunning(taskType, query.data.current_step_name || "처리 중...");
          break;
        case "completed":
          notifyCompleted(taskType, () => {
            // Could refresh datasets or navigate to results
            console.log("Task completed:", taskId);
          });
          break;
        case "failed":
          notifyFailed(
            taskType,
            query.data.error || "알 수 없는 오류",
            (error) => {
              console.error("Task failed:", taskId, error);
            },
          );
          break;
      }

      setNotifiedStatuses((prev) => new Set([...prev, notificationKey]));
    }
  }, [
    query.data,
    taskId,
    notifiedStatuses,
    notifyPending,
    notifyRunning,
    notifyCompleted,
    notifyFailed,
    getTaskType,
  ]);

  // Update task store when data changes
  useEffect(() => {
    if (query.data && taskId) {
      updateTask(taskId, query.data);
    }
  }, [query.data, taskId, updateTask]);

  return query;
}

/**
 * Hook to monitor multiple tasks
 */
export function useTaskStatuses(taskIds: string[]) {
  return useQuery<TaskStatusResponse[], Error>({
    queryKey: ["tasks", taskIds],
    queryFn: async () => {
      const results = await Promise.all(
        taskIds.map((taskId) => taskApi.getTaskStatus(taskId)),
      );
      return results;
    },
    enabled: taskIds.length > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll if any task is still running
      const hasRunningTasks = data?.some(
        (task) => task.status === "pending" || task.status === "running",
      );
      return hasRunningTasks ? 2000 : false;
    },
    staleTime: 0,
  });
}
