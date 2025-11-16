import { useMutation } from '@tanstack/react-query';
import { datasetApi } from '@/lib/api';
import type { DatasetType, ProfileFilters } from '@/types/api';

interface ExportDatasetParams {
  datasetType: DatasetType;
  filters?: Partial<ProfileFilters>;
  useCustomExport?: boolean;
}

/**
 * Hook to export dataset to CSV
 * Returns a mutation that triggers the download
 */
export function useExportDataset() {
  return useMutation<Blob, Error, ExportDatasetParams>({
    mutationFn: async ({ datasetType, filters, useCustomExport }) => {
      if (useCustomExport && filters) {
        return datasetApi.exportCustom(datasetType, filters);
      }
      return datasetApi.exportDataset(datasetType, filters);
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `${variables.datasetType}_export_${timestamp}.csv`;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook to export dataset with automatic filename generation
 */
export function useExportDatasetWithFilename() {
  return useMutation<
    { blob: Blob; filename: string },
    Error,
    ExportDatasetParams
  >({
    mutationFn: async ({ datasetType, filters, useCustomExport }) => {
      const blob = useCustomExport && filters
        ? await datasetApi.exportCustom(datasetType, filters)
        : await datasetApi.exportDataset(datasetType, filters);

      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `${datasetType}_export_${timestamp}.csv`;

      return { blob, filename };
    },
  });
}
