"use client";

import Link from "next/link";
import { useState } from "react";
import { DatasetStatsCard } from "@/components/dataset-stats-card";
import { TaskProgressBar } from "@/components/task-progress-bar";
import { Button } from "@/components/ui/button";
import { useDatasets } from "@/hooks/use-datasets";
import {
  useExtractValidation,
  useGenerateAugmentation,
} from "@/hooks/use-task-mutations";
import { useTaskStore } from "@/store/task-store";

export default function Home() {
  const { data: datasets, isLoading: isDatasetsLoading } = useDatasets();
  const extractValidation = useExtractValidation();
  const generateAugmentation = useGenerateAugmentation();
  const activeTasks = useTaskStore((state) => state.activeTasks);

  // Convert Map to array and filter running tasks
  const runningTasks = Array.from(activeTasks.values()).filter(
    (task) => task.status === "pending" || task.status === "running",
  );

  const [augmentationCount, setAugmentationCount] = useState(1000);

  // Find test (backend: validation) and learning datasets
  const datasetsArray = Array.isArray(datasets)
    ? datasets
    : datasets?.items || [];
  const testDataset = datasetsArray?.find(
    (d) => d.dataset_type === "validation",
  );
  const learningDataset = datasetsArray?.find(
    (d) => d.dataset_type === "learning",
  );

  const handleExtractTest = async () => {
    try {
      await extractValidation.mutateAsync();
    } catch (error) {
      console.error("Failed to start test extraction:", error);
    }
  };

  const handleGenerateAugmentation = async () => {
    try {
      await generateAugmentation.mutateAsync({
        target_count: augmentationCount,
        batch_size: 100,
      });
    } catch (error) {
      console.error("Failed to start augmentation generation:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              ML Data Augmentation System
            </h1>
            <p className="text-lg text-muted-foreground">
              Machine Learning Data Augmentation and Management System
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/logs-demo">
              <Button variant="outline" size="lg">
                📋 Log Viewer Demo
              </Button>
            </Link>
            <Link href="/datasets">
              <Button variant="outline" size="lg">
                Browse Datasets
              </Button>
            </Link>
          </div>
        </div>

        {/* Dataset Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DatasetStatsCard
            datasetType="test"
            stats={testDataset || null}
            isLoading={isDatasetsLoading}
          />
          <DatasetStatsCard
            datasetType="learning"
            stats={learningDataset || null}
            isLoading={isDatasetsLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test Extraction */}
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">
                Extract Test Dataset
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract 282 mutual like pairs from production database with
                images from S3
              </p>
              <button
                onClick={handleExtractTest}
                disabled={extractValidation.isPending}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {extractValidation.isPending
                  ? "Starting..."
                  : "Start Extraction"}
              </button>
              {extractValidation.isError && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Error: {extractValidation.error.message}
                </div>
              )}
            </div>

            {/* Augmentation Generation */}
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">
                Generate Learning Dataset
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate synthetic profiles using AI (Replicate + LangChain)
              </p>
              <div className="mb-4">
                <label
                  htmlFor="augmentation-count"
                  className="block text-sm font-medium mb-2"
                >
                  Target Count
                </label>
                <input
                  id="augmentation-count"
                  type="number"
                  min="100"
                  max="15000"
                  step="100"
                  value={augmentationCount}
                  onChange={(e) => setAugmentationCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
              <button
                onClick={handleGenerateAugmentation}
                disabled={generateAugmentation.isPending}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {generateAugmentation.isPending
                  ? "Starting..."
                  : "Start Generation"}
              </button>
              {generateAugmentation.isError && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Error: {generateAugmentation.error.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        {runningTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Active Tasks</h2>
            <div className="space-y-4">
              {runningTasks.map((task) => (
                <TaskProgressBar
                  key={task.task_id}
                  taskId={task.task_id}
                  onComplete={() => {
                    console.log(`Task ${task.task_id} completed`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Summary */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(testDataset?.stats?.total_profiles || 0) +
                  (learningDataset?.stats?.total_profiles || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Profiles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(testDataset?.stats?.total_images || 0) +
                  (learningDataset?.stats?.total_images || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {testDataset?.stats?.total_profiles || 0}
              </div>
              <div className="text-sm text-muted-foreground">Test Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {learningDataset?.stats?.total_profiles || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Learning Profiles
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
