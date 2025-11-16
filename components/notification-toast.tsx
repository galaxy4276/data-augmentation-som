"use client";

import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

interface TaskNotificationProps {
  taskId: string;
  taskType: "extraction" | "augmentation";
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function TaskNotification({
  taskId,
  taskType,
  onComplete,
  onError,
}: TaskNotificationProps) {
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  // Function to show notification based on status
  const showNotification = (status: string, message?: string) => {
    // Dismiss previous notification if exists
    if (notificationId) {
      toast.dismiss(notificationId);
    }

    const taskTypeLabels = {
      extraction: "데이터 추출",
      augmentation: "데이터 증강",
    };

    let title = "";
    let description = "";
    let icon = null;
    let options: any = {};

    switch (status) {
      case "pending":
        title = `${taskTypeLabels[taskType]} 대기 중`;
        description = "태스크가 큐에 대기 중입니다...";
        icon = <Clock className="w-4 h-4" />;
        options = {
          duration: 3000,
          action: {
            label: "진행 상황 보기",
            onClick: () => {
              // Could open a modal or navigate to status page
            },
          },
        };
        break;

      case "running":
        title = `${taskTypeLabels[taskType]} 진행 중`;
        description = message || "데이터를 처리하고 있습니다...";
        icon = <AlertCircle className="w-4 h-4 animate-pulse" />;
        options = {
          duration: 5000,
          action: {
            label: "자세히 보기",
            onClick: () => {
              // Open detailed progress modal
            },
          },
        };
        break;

      case "completed":
        title = `${taskTypeLabels[taskType]} 완료!`;
        description = "작업이 성공적으로 완료되었습니다.";
        icon = <CheckCircle className="w-4 h-4" />;
        options = {
          duration: 5000,
          action: {
            label: "결과 확인",
            onClick: () => {
              // Navigate to datasets page or show results
              if (onComplete) onComplete();
            },
          },
        };
        break;

      case "failed":
        title = `${taskTypeLabels[taskType]} 실패`;
        description = message || "작업 중 오류가 발생했습니다.";
        icon = <XCircle className="w-4 h-4" />;
        options = {
          duration: 10000,
          action: {
            label: "오류 상세 보기",
            onClick: () => {
              // Show error details modal
              if (onError) onError(message || "알 수 없는 오류");
            },
          },
        };
        break;
    }

    const id = toast(title, {
      description,
      icon,
      ...options,
    });

    setNotificationId(id);
  };

  // This would be integrated with your useTaskStatus hook
  // For now, this is a demonstration of the notification system
  useEffect(() => {
    // Example: Simulate status changes
    const timer = setTimeout(() => {
      showNotification("running", "데이터베이스에서 프로필을 추출하는 중...");
    }, 1000);

    return () => clearTimeout(timer);
  }, [taskId, taskType]);

  return <Toaster />;
}

// Custom hook for task notifications
export function useTaskNotification() {
  return {
    notifyPending: (
      taskType: "extraction" | "augmentation",
      taskId: string,
    ) => {
      const taskTypeLabels = {
        extraction: "데이터 추출",
        augmentation: "데이터 증강",
      };

      toast(`${taskTypeLabels[taskType]} 대기 중`, {
        description: "태스크가 큐에 대기 중입니다...",
        icon: <Clock className="w-4 h-4" />,
        duration: 3000,
      });
    },

    notifyRunning: (
      taskType: "extraction" | "augmentation",
      message: string,
    ) => {
      const taskTypeLabels = {
        extraction: "데이터 추출",
        augmentation: "데이터 증강",
      };

      toast(`${taskTypeLabels[taskType]} 진행 중`, {
        description: message,
        icon: <AlertCircle className="w-4 h-4 animate-pulse" />,
        duration: 5000,
      });
    },

    notifyCompleted: (
      taskType: "extraction" | "augmentation",
      onComplete?: () => void,
    ) => {
      const taskTypeLabels = {
        extraction: "데이터 추출",
        augmentation: "데이터 증강",
      };

      toast.success(`${taskTypeLabels[taskType]} 완료!`, {
        description: "작업이 성공적으로 완료되었습니다.",
        icon: <CheckCircle className="w-4 h-4" />,
        duration: 5000,
        action: {
          label: "결과 확인",
          onClick: onComplete,
        },
      });
    },

    notifyFailed: (
      taskType: "extraction" | "augmentation",
      error: string,
      onError?: (error: string) => void,
    ) => {
      const taskTypeLabels = {
        extraction: "데이터 추출",
        augmentation: "데이터 증강",
      };

      toast.error(`${taskTypeLabels[taskType]} 실패`, {
        description: error,
        icon: <XCircle className="w-4 h-4" />,
        duration: 10000,
        action: {
          label: "오류 상세 보기",
          onClick: () => {
            if (onError) onError(error);
          },
        },
      });
    },
  };
}

// Browser notification helper
export function useBrowserNotification() {
  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
      });
    }
  };

  return { requestPermission, showNotification };
}
