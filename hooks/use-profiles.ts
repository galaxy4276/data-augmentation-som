import { useQuery } from "@tanstack/react-query";
import { datasetApi } from "@/lib/api";
import type {
  DatasetType,
  PaginationParams,
  ProfileData,
  ProfileFilters,
  ProfileListResponse,
  ProfileSummary,
} from "@/types/api";

interface UseProfilesParams
  extends Partial<ProfileFilters>,
    Partial<PaginationParams> {
  datasetType: DatasetType;
}

/**
 * Hook to fetch profiles with pagination and filtering
 * Supports keepPreviousData for smooth pagination transitions
 */
export function useProfiles({
  datasetType,
  page = 1,
  page_size = 50,
  ...filters
}: UseProfilesParams) {
  return useQuery<ProfileListResponse, Error>({
    queryKey: ["profiles", datasetType, page, page_size, filters],
    queryFn: () =>
      datasetApi.getProfiles(datasetType, {
        page,
        page_size,
        ...filters,
      }),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single profile by ID
 */
export function useProfile(datasetType: DatasetType, profileId: string) {
  return useQuery<ProfileData, Error>({
    queryKey: ["profile", datasetType, profileId],
    queryFn: () => datasetApi.getProfile(datasetType, profileId),
    enabled: !!profileId, // Only fetch if profileId is provided
    staleTime: 60000, // 1 minute
  });
}
