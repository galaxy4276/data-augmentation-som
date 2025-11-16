"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExportDataset } from "@/hooks/use-export-dataset";
import { useTaskStore } from "@/store/task-store";
import type { DatasetType, ProfileFilters } from "@/types/api";

interface ExportDialogProps {
  datasetType: DatasetType;
  filters?: Partial<ProfileFilters>;
  totalProfiles?: number;
  trigger?: React.ReactNode;
}

export function ExportDialog({
  datasetType,
  filters,
  totalProfiles,
  trigger,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [useCustomExport, setUseCustomExport] = useState(false);
  const exportDataset = useExportDataset();
  const addExportHistory = useTaskStore((state) => state.addExportHistory);

  const hasFilters =
    filters &&
    Object.keys(filters).some((key) => {
      const value = filters[key as keyof ProfileFilters];
      return value !== undefined && value !== null && value !== "";
    });

  const handleExport = async () => {
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const filename = `${datasetType}_export_${dateStr}.csv`;

    try {
      await exportDataset.mutateAsync({
        datasetType,
        filters: useCustomExport ? filters : undefined,
        useCustomExport,
      });

      // Log successful export
      addExportHistory({
        timestamp,
        datasetType,
        filters: useCustomExport ? filters : undefined,
        filename,
        status: "success",
      });

      toast.success("Export completed", {
        description: `Successfully exported ${filename}`,
      });

      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Log failed export
      addExportHistory({
        timestamp,
        datasetType,
        filters: useCustomExport ? filters : undefined,
        filename,
        status: "error",
        error: errorMessage,
      });

      toast.error("Export failed", {
        description: errorMessage,
        action: {
          label: "Retry",
          onClick: () => handleExport(),
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Dataset</DialogTitle>
          <DialogDescription>
            Export profiles to CSV format for ML model consumption
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dataset Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dataset Type:</span>
            <Badge
              variant={datasetType === "validation" ? "default" : "secondary"}
            >
              {datasetType}
            </Badge>
          </div>

          {/* Total Profiles */}
          {totalProfiles !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Profiles:</span>
              <span className="text-sm text-muted-foreground">
                {totalProfiles}
              </span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3 pt-2 border-t">
            <div className="text-sm font-medium">Export Options:</div>

            {/* Full Export */}
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="export-type"
                checked={!useCustomExport}
                onChange={() => setUseCustomExport(false)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">Full Dataset</div>
                <div className="text-xs text-muted-foreground">
                  Export all profiles in the {datasetType} dataset
                </div>
              </div>
            </label>

            {/* Filtered Export */}
            {hasFilters && (
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="export-type"
                  checked={useCustomExport}
                  onChange={() => setUseCustomExport(true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Filtered Dataset</div>
                  <div className="text-xs text-muted-foreground">
                    Export only profiles matching current filters
                  </div>
                  {useCustomExport && (
                    <div className="mt-2 space-y-1">
                      {filters?.gender && (
                        <div className="text-xs">
                          <span className="font-medium">Gender:</span>{" "}
                          {filters.gender}
                        </div>
                      )}
                      {(filters?.age_min || filters?.age_max) && (
                        <div className="text-xs">
                          <span className="font-medium">Age:</span>{" "}
                          {filters.age_min || "any"} -{" "}
                          {filters.age_max || "any"}
                        </div>
                      )}
                      {filters?.mbti && (
                        <div className="text-xs">
                          <span className="font-medium">MBTI:</span>{" "}
                          {filters.mbti}
                        </div>
                      )}
                      {filters?.search && (
                        <div className="text-xs">
                          <span className="font-medium">Search:</span>{" "}
                          {filters.search}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            )}
          </div>

          {/* File Format Info */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <div className="font-medium mb-1">Export Format:</div>
            <div>
              CSV file with columns: id, dataset_type, age, gender, name, mbti,
              introduction, university, department, image_paths,
              preferences_self, preferences_partner, match_score, partner_id
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={exportDataset.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exportDataset.isPending}>
            {exportDataset.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
