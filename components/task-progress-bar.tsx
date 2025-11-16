"use client";

import { FileText, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskLogViewer } from "@/components/task-log-viewer";
import { Button } from "@/components/ui/button";
import { useTaskStatus } from "@/hooks/use-task-status";

interface TaskProgressBarProps {
  taskId: string;
  onComplete?: () => void;
}

export function TaskProgressBar({ taskId, onComplete }: TaskProgressBarProps) {
  const { data: taskStatus, isLoading } = useTaskStatus(taskId);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (taskStatus?.status === "completed" && onComplete) {
      onComplete();
    }
  }, [taskStatus?.status, onComplete]);

  if (isLoading || !taskStatus) {
    return (
      <div className="p-4 border rounded-lg bg-card animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
        <div className="h-2 bg-muted rounded w-full" />
      </div>
    );
  }

  const {
    status,
    progress,
    current_step,
    total_steps,
    estimated_completion,
    error,
  } = taskStatus;

  const progressPercent = Math.min(Math.max(progress, 0), 100);

  const statusColors = {
    pending: "bg-yellow-500",
    running: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  const statusLabels = {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
  };

  const statusTextColors = {
    pending: "text-yellow-600",
    running: "text-blue-600",
    completed: "text-green-600",
    failed: "text-red-600",
  };

  return (
    <>
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`}
            />
            <div>
              <span className="text-sm font-medium">데이터 추출 진행 중</span>
              <div className="text-xs text-muted-foreground">
                ID: {taskId.slice(0, 8)}...
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${statusTextColors[status]} bg-opacity-10 ${statusColors[status].replace("bg-", "bg-opacity-10 text-")}`}
            >
              {statusLabels[status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Logs
            </Button>
            <div className="text-sm font-bold">
              {progressPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${statusColors[status]} ${status === "running" ? "animate-pulse" : ""}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="font-medium">현재 단계:</span>
            <span>{current_step}</span>
          </div>
          {total_steps > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-medium">진행률:</span>
              <span>
                Step {Math.ceil((progressPercent / 100) * total_steps)} /{" "}
                {total_steps}
              </span>
            </div>
          )}
          {estimated_completion && status === "running" && (
            <div className="flex items-center justify-between">
              <span className="font-medium">예상 완료:</span>
              <span>{new Date(estimated_completion).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Status-specific messages */}
        {status === "pending" && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
            <span className="font-medium">대기 중:</span> 태스크가 큐에 대기
            중입니다. 잠시 후 시작됩니다.
          </div>
        )}

        {status === "running" && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">진행 중:</span> 데이터를 추출하고
            처리하고 있습니다.
          </div>
        )}

        {status === "completed" && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-xs text-green-700 dark:text-green-300">
            <span className="font-medium">완료!</span> 데이터 추출이 성공적으로
            완료되었습니다.
          </div>
        )}

        {error && status === "failed" && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
            <div className="font-medium mb-1">오류 발생:</div>
            <div className="whitespace-pre-wrap break-words">{error}</div>
          </div>
        )}
      </div>

      {/* Log Viewer Drawer */}
      <TaskLogViewer
        taskId={taskId}
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
      />
    </>
  );
}
