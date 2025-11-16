import { useQuery } from '@tanstack/react-query';
import { datasetApi } from '@/lib/api';
import type { DatasetInfo, DatasetStats, DatasetType } from '@/types/api';

/**
 * Hook to fetch all datasets with statistics
 * Refetches every 5 seconds to keep data fresh
 */
export function useDatasets() {
  return useQuery<DatasetInfo[], Error>({
    queryKey: ['datasets'],
    queryFn: datasetApi.getDatasets,
    refetchInterval: 5000, // 5 seconds
    staleTime: 4000, // Consider data stale after 4 seconds
  });
}

/**
 * Hook to fetch a specific dataset's statistics
 */
export function useDataset(datasetType: DatasetType) {
  return useQuery<DatasetInfo, Error>({
    queryKey: ['dataset', datasetType],
    queryFn: () => datasetApi.getDataset(datasetType),
    refetchInterval: 5000, // 5 seconds
    staleTime: 4000,
  });
}
