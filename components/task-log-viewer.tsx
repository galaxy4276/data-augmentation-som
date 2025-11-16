"use client";

import {
  AlertTriangle,
  Bug,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Info,
  Search,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogViewerPreferences, useTaskLogs } from "@/hooks/use-task-logs";
import type { LogLevel, TaskLogEntry } from "@/types/api";

interface TaskLogViewerProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const LOG_LEVELS: LogLevel[] = ["DEBUG", "INFO", "WARNING", "ERROR", "SUCCESS"];

const LOG_LEVEL_CONFIG = {
  DEBUG: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
    icon: Bug,
    label: "DEBUG",
  },
  INFO: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Info,
    label: "INFO",
  },
  WARNING: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: AlertTriangle,
    label: "WARN",
  },
  ERROR: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    icon: X,
    label: "ERROR",
  },
  SUCCESS: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle,
    label: "SUCCESS",
  },
};

export function TaskLogViewer({ taskId, isOpen, onClose }: TaskLogViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "">("");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { autoScroll, updatePreferences, toggleAutoScroll } =
    useLogViewerPreferences();

  const { data, isLoading, error, refetch } = useTaskLogs(taskId, {
    page: currentPage,
    page_size: 50,
    level: selectedLevel || undefined,
    search: searchTerm || undefined,
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.logs, autoScroll]);

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setCurrentPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const getLogIcon = (level: LogLevel) => {
    const IconComponent = LOG_LEVEL_CONFIG[level].icon;
    return <IconComponent className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-4xl bg-background shadow-2xl transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-card p-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              Task Logs - {taskId.slice(0, 8)}...
            </h2>
            <Badge variant="secondary" className="text-xs">
              {data?.total_logs || 0} logs
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoScroll}
              className={autoScroll ? "text-primary" : "text-muted-foreground"}
            >
              <Clock className="h-4 w-4 mr-1" />
              Auto-scroll
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b bg-card p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-32">
              <Select
                value={selectedLevel}
                onValueChange={(value) => {
                  setSelectedLevel(value as LogLevel | "");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  {LOG_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        {getLogIcon(level)}
                        {level}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 mb-2">Failed to load logs</div>
                <div className="text-sm text-muted-foreground">
                  {error.message}
                </div>
                <Button onClick={() => refetch()} className="mt-4">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {data?.logs?.length === 0 && !isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2">No logs found</div>
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      Clear filters
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {data?.logs?.map((log) => (
                    <div
                      key={log.id}
                      className={`
                        border-l-4 ${LOG_LEVEL_CONFIG[log.level].borderColor}
                        ${LOG_LEVEL_CONFIG[log.level].bgColor}
                        hover:opacity-90 transition-opacity
                      `}
                    >
                      <div
                        className="cursor-pointer p-4"
                        onClick={() => toggleLogExpansion(log.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={LOG_LEVEL_CONFIG[log.level].color}>
                            {getLogIcon(log.level)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className={`
                                  text-xs font-mono
                                  ${LOG_LEVEL_CONFIG[log.level].color}
                                  ${LOG_LEVEL_CONFIG[log.level].bgColor}
                                  ${LOG_LEVEL_CONFIG[log.level].borderColor}
                                  border
                                `}
                              >
                                {LOG_LEVEL_CONFIG[log.level].label}
                              </Badge>

                              <span className="text-xs text-muted-foreground font-mono">
                                {formatTimestamp(log.timestamp)}
                              </span>

                              {log.step && (
                                <Badge variant="outline" className="text-xs">
                                  {log.step}
                                </Badge>
                              )}

                              {log.progress !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {log.progress}%
                                </Badge>
                              )}

                              {log.duration_ms && (
                                <span className="text-xs text-muted-foreground">
                                  {log.duration_ms}ms
                                </span>
                              )}
                            </div>

                            <div className="text-sm font-medium break-words">
                              {log.message}
                            </div>

                            {log.details && expandedLogs.has(log.id) && (
                              <div className="mt-2 p-3 bg-background rounded border text-xs">
                                <pre className="whitespace-pre-wrap break-words font-mono">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {log.details &&
                              (expandedLogs.has(log.id) ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 animate-pulse" />
                    Loading logs...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {data && data.total_pages > 1 && (
          <div className="border-t bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {data.logs.length} of {data.total_logs} logs
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground px-3">
                  Page {currentPage} of {data.total_pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= data.total_pages}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(data.total_pages, prev + 1),
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
