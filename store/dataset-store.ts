import { create } from 'zustand';
import type { ProfileFilters, DatasetType } from '@/types/api';

interface DatasetStore {
  // Filter state
  filters: ProfileFilters;
  setFilters: (filters: ProfileFilters) => void;
  updateFilter: <K extends keyof ProfileFilters>(
    key: K,
    value: ProfileFilters[K]
  ) => void;
  clearFilters: () => void;

  // Selection state
  selectedProfiles: string[];
  toggleProfile: (profileId: string) => void;
  selectProfiles: (profileIds: string[]) => void;
  clearSelection: () => void;
  isProfileSelected: (profileId: string) => boolean;
}

const defaultFilters: ProfileFilters = {
  dataset_type: undefined,
  gender: undefined,
  age_min: undefined,
  age_max: undefined,
  mbti: undefined,
  search: undefined,
};

export const useDatasetStore = create<DatasetStore>((set, get) => ({
  // Initial state
  filters: defaultFilters,
  selectedProfiles: [],

  // Filter actions
  setFilters: (filters) =>
    set({
      filters: { ...defaultFilters, ...filters },
    }),

  updateFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  clearFilters: () =>
    set({
      filters: defaultFilters,
    }),

  // Selection actions
  toggleProfile: (profileId) =>
    set((state) => ({
      selectedProfiles: state.selectedProfiles.includes(profileId)
        ? state.selectedProfiles.filter((id) => id !== profileId)
        : [...state.selectedProfiles, profileId],
    })),

  selectProfiles: (profileIds) =>
    set({
      selectedProfiles: profileIds,
    }),

  clearSelection: () =>
    set({
      selectedProfiles: [],
    }),

  isProfileSelected: (profileId) => {
    return get().selectedProfiles.includes(profileId);
  },
}));
