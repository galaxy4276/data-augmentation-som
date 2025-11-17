import apiClient from "@/lib/api-client";
import type {
  DatasetInfo,
  DatasetType,
  PaginationParams,
  ProfileData,
  ProfileFilters,
  ProfileListResponse,
  ProfileSummary,
} from "@/types/api";

export const datasetApi = {
  /**
   * Get all datasets with statistics
   */
  getDatasets: async (): Promise<DatasetInfo[]> => {
    const response = await apiClient.get<DatasetInfo[]>("/datasets");
    return response.data;
  },

  /**
   * Get specific dataset information
   */
  getDataset: async (datasetType: DatasetType): Promise<DatasetInfo> => {
    const response = await apiClient.get<DatasetInfo>(
      `/datasets/${datasetType}`,
    );
    return response.data;
  },

  /**
   * Get profiles with pagination and filtering
   */
  getProfiles: async (
    datasetType: DatasetType,
    params: Partial<ProfileFilters & PaginationParams>,
  ): Promise<ProfileListResponse> => {
    const response = await apiClient.get<ProfileListResponse>(
      `/datasets/${datasetType}/profiles`,
      {
        params: {
          page: params.page || 1,
          page_size: params.page_size || 50,
          gender: params.gender,
          age_min: params.age_min,
          age_max: params.age_max,
          mbti: params.mbti,
          search: params.search,
        },
      },
    );
    return response.data;
  },

  /**
   * Get a single profile by ID
   */
  getProfile: async (
    datasetType: DatasetType,
    profileId: string,
  ): Promise<ProfileData> => {
    const response = await apiClient.get<ProfileData>(
      `/datasets/${datasetType}/profiles/${profileId}`,
    );
    return response.data;
  },

  /**
   * Export dataset to CSV
   */
  exportDataset: async (
    datasetType: DatasetType,
    filters?: Partial<ProfileFilters>,
  ): Promise<Blob> => {
    const response = await apiClient.get(`/export/${datasetType}`, {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Export custom filtered dataset to CSV
   */
  exportCustom: async (
    datasetType: DatasetType,
    filters: Partial<ProfileFilters>,
  ): Promise<Blob> => {
    const response = await apiClient.post(
      "/export/custom",
      {
        dataset_type: datasetType,
        filters,
      },
      {
        responseType: "blob",
      },
    );
    return response.data;
  },
};
