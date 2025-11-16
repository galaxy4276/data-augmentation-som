"use client";

import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useTaskStatus } from "@/hooks/use-task-status";

interface TaskStatusModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  title?: string;
}

export function TaskStatusModal({
  taskId,
  isOpen,
  onClose,
  onComplete,
  title = "데이터 추출 진행 상황",
}: TaskStatusModalProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { data: taskStatus, isLoading } = useTaskStatus(taskId);

  if (!taskId || !isOpen) return null;

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    running: <AlertCircle className="w-4 h-4 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />,
  };

  const statusColors = {
    pending: "bg-yellow-500",
    running: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  const statusLabels = {
    pending: "대기 중",
    running: "진행 중",
    completed: "완료",
    failed: "실패",
  };

  const progress = taskStatus?.progress || 0;
  const currentStep = taskStatus?.current_step || "";
  const totalSteps = taskStatus?.total_steps || 1;
  const currentStepNum = Math.ceil((progress / 100) * totalSteps);
  const estimatedCompletion = taskStatus?.estimated_completion;
  const error = taskStatus?.error;

  // Auto-close when completed
  if (taskStatus?.status === "completed" && onComplete) {
    onComplete();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {taskStatus && statusIcons[taskStatus.status]}
            {title}
          </DialogTitle>
          <DialogDescription>
            데이터 추출 작업의 실시간 진행 상황을 모니터링합니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-2 bg-muted rounded w-full mb-2" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          </div>
        ) : taskStatus ? (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${statusColors[taskStatus.status]} animate-pulse`}
                />
                <Badge
                  variant="outline"
                  className={statusColors[taskStatus.status].replace(
                    "bg-",
                    "text-",
                  )}
                >
                  {statusLabels[taskStatus.status]}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>전체 진행률</span>
                <span>
                  {currentStepNum} / {totalSteps} 단계
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Step */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-1">현재 작업:</div>
              <div className="text-sm text-muted-foreground">{currentStep}</div>
            </div>

            {/* Estimated Completion */}
            {estimatedCompletion && taskStatus.status === "running" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  예상 완료 시간:{" "}
                  {new Date(estimatedCompletion).toLocaleString()}
                </span>
              </div>
            )}

            {/* Error Display */}
            {error && taskStatus.status === "failed" && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-2">
                  <XCircle className="w-4 h-4" />
                  오류가 발생했습니다
                </div>
                <div className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                  {error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {taskStatus.status === "completed" && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  데이터 추출이 성공적으로 완료되었습니다!
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1"
              >
                {showDetails ? "간단히 보기" : "자세히 보기"}
              </Button>

              {taskStatus.status === "completed" ||
              taskStatus.status === "failed" ? (
                <Button onClick={onClose} className="flex-1">
                  닫기
                </Button>
              ) : (
                <Button variant="outline" onClick={onClose}>
                  백그라운드 실행
                </Button>
              )}
            </div>

            {/* Detailed Information */}
            {showDetails && (
              <div className="space-y-4 pt-4 border-t">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">태스크 ID:</span>
                    <span className="font-mono text-xs">{taskId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">생성 시간:</span>
                    <span>
                      {new Date(taskStatus.created_at).toLocaleString()}
                    </span>
                  </div>
                  {taskStatus.started_at && (
                    <div className="flex justify-between">
                      <span className="font-medium">시작 시간:</span>
                      <span>
                        {new Date(taskStatus.started_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {taskStatus.completed_at && (
                    <div className="flex justify-between">
                      <span className="font-medium">완료 시간:</span>
                      <span>
                        {new Date(taskStatus.completed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                {taskStatus.metadata && (
                  <div className="text-sm">
                    <div className="font-medium mb-2">추가 정보:</div>
                    <div className="p-2 bg-muted/50 rounded text-xs space-y-1">
                      {Object.entries(taskStatus.metadata).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            태스크 상태를 불러오는 중입니다...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
