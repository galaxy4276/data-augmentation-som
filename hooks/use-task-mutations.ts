import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/api';
import type {
  ExtractValidationResponse,
  GenerateAugmentationResponse,
  GenerateAugmentationRequest,
  GenerateImagesRequest,
  GeneratePreferencesRequest,
} from '@/lib/api';
import { useTaskStore } from '@/store/task-store';

/**
 * Hook to trigger validation dataset extraction
 */
export function useExtractValidation() {
  const queryClient = useQueryClient();
  const addTask = useTaskStore((state) => state.addTask);

  return useMutation<ExtractValidationResponse, Error>({
    mutationFn: taskApi.extractValidation,
    onSuccess: (data) => {
      // Add task to store for tracking
      addTask(data.task_id, {
        task_id: data.task_id,
        status: 'pending',
        progress: 0,
        current_step: 'Starting extraction',
        total_steps: 1,
      }, 'extraction');

      // Invalidate datasets query to refresh stats
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

/**
 * Hook to trigger learning dataset generation
 */
export function useGenerateAugmentation() {
  const queryClient = useQueryClient();
  const addTask = useTaskStore((state) => state.addTask);

  return useMutation<
    GenerateAugmentationResponse,
    Error,
    GenerateAugmentationRequest
  >({
    mutationFn: taskApi.generateAugmentation,
    onSuccess: (data) => {
      // Add task to store for tracking
      addTask(data.task_id, {
        task_id: data.task_id,
        status: 'pending',
        progress: 0,
        current_step: 'Starting augmentation',
        total_steps: data.target_count,
      }, 'augmentation');

      // Invalidate datasets query to refresh stats
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

/**
 * Hook to generate images for a profile
 */
export function useGenerateImages() {
  return useMutation<{ task_id: string }, Error, GenerateImagesRequest>({
    mutationFn: taskApi.generateImages,
  });
}

/**
 * Hook to generate preferences for a profile
 */
export function useGeneratePreferences() {
  return useMutation<{ preferences: any }, Error, GeneratePreferencesRequest>({
    mutationFn: taskApi.generatePreferences,
  });
}
