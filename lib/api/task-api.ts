import apiClient from "@/lib/api-client";
import type {
  LogLevel,
  TaskLogsResponse,
  TaskStatusResponse,
} from "@/types/api";

export interface ExtractValidationResponse {
  task_id: string;
  message: string;
}

export interface GenerateAugmentationResponse {
  task_id: string;
  message: string;
  target_count: number;
}

export interface GenerateAugmentationRequest {
  target_count: number;
  batch_size?: number;
}

export interface GenerateImagesRequest {
  profile_data: {
    age: number;
    gender: "MALE" | "FEMALE";
    mbti: string;
  };
  num_images?: number;
}

export interface GeneratePreferencesRequest {
  profile_context: {
    age: number;
    gender: "MALE" | "FEMALE";
    mbti: string;
  };
}

export const taskApi = {
  /**
   * Trigger validation dataset extraction
   */
  extractValidation: async (): Promise<ExtractValidationResponse> => {
    const response = await apiClient.post<ExtractValidationResponse>(
      "/extract/validation",
    );
    return response.data;
  },

  /**
   * Get task logs with pagination and filtering
   */
  getTaskLogs: async (
    taskId: string,
    taskType?: "extraction" | "augmentation",
    params?: {
      page?: number;
      page_size?: number;
      level?: LogLevel;
      search?: string;
    },
  ): Promise<TaskLogsResponse> => {
    const endpoint =
      taskType === "extraction"
        ? `/extract/validation/${taskId}/logs`
        : `/generate/augmentation/${taskId}/logs`;

    const response = await apiClient.get<TaskLogsResponse>(endpoint, {
      params: {
        page: params?.page || 1,
        page_size: params?.page_size || 100,
        level: params?.level,
        search: params?.search,
      },
    });
    return response.data;
  },

  /**
   * Trigger learning dataset generation
   */
  generateAugmentation: async (
    request: GenerateAugmentationRequest,
  ): Promise<GenerateAugmentationResponse> => {
    const response = await apiClient.post<GenerateAugmentationResponse>(
      "/generate/augmentation",
      request,
    );
    return response.data;
  },

  /**
   * Get task status and progress
   */
  getTaskStatus: async (
    taskId: string,
    taskType?: "extraction" | "augmentation",
  ): Promise<TaskStatusResponse> => {
    // Default to augmentation endpoint for backward compatibility
    const endpoint =
      taskType === "extraction"
        ? `/extract/validation/${taskId}/status`
        : `/generate/images/${taskId}/status`;

    const response = await apiClient.get<TaskStatusResponse>(endpoint);
    return response.data;
  },

  /**
   * Generate images for a specific profile
   */
  generateImages: async (
    request: GenerateImagesRequest,
  ): Promise<{ task_id: string }> => {
    const response = await apiClient.post<{ task_id: string }>(
      "/augment/images",
      request,
    );
    return response.data;
  },

  /**
   * Generate preferences for a specific profile
   */
  generatePreferences: async (
    request: GeneratePreferencesRequest,
  ): Promise<{ preferences: any }> => {
    const response = await apiClient.post<{ preferences: any }>(
      "/augment/preferences",
      request,
    );
    return response.data;
  },
};
