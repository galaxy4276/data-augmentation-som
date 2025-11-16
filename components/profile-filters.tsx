"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DatasetType, Gender, ProfileFilters } from "@/types/api";

interface ProfileFiltersProps {
  filters: ProfileFilters;
  onFiltersChange: (filters: ProfileFilters) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ProfileFilters({
  filters,
  onFiltersChange,
}: ProfileFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]);

  const handleDatasetTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dataset_type: value === "all" ? undefined : (value as DatasetType),
    });
  };

  const handleGenderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      gender: value === "all" ? undefined : (value as Gender),
    });
  };

  const handleAgeMinChange = (value: string) => {
    const ageMin = value ? Number(value) : undefined;
    onFiltersChange({ ...filters, age_min: ageMin });
  };

  const handleAgeMaxChange = (value: string) => {
    const ageMax = value ? Number(value) : undefined;
    onFiltersChange({ ...filters, age_max: ageMax });
  };

  const handleMbtiChange = (value: string) => {
    onFiltersChange({
      ...filters,
      mbti: value === "all" ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      dataset_type: undefined,
      gender: undefined,
      age_min: undefined,
      age_max: undefined,
      mbti: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters =
    filters.dataset_type ||
    filters.gender ||
    filters.age_min ||
    filters.age_max ||
    filters.mbti ||
    filters.search;

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Clear
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="lg:col-span-3">
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name, MBTI, or preferences..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Dataset Type */}
        <div>
          <label
            htmlFor="dataset-type"
            className="block text-sm font-medium mb-2"
          >
            Dataset Type
          </label>
          <Select
            value={filters.dataset_type || "all"}
            onValueChange={handleDatasetTypeChange}
          >
            <SelectTrigger id="dataset-type">
              <SelectValue placeholder="All datasets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All datasets</SelectItem>
              <SelectItem value="validation">Validation</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium mb-2">
            Gender
          </label>
          <Select
            value={filters.gender || "all"}
            onValueChange={handleGenderChange}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="All genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* MBTI */}
        <div>
          <label htmlFor="mbti" className="block text-sm font-medium mb-2">
            MBTI
          </label>
          <Select
            value={filters.mbti || "all"}
            onValueChange={handleMbtiChange}
          >
            <SelectTrigger id="mbti">
              <SelectValue placeholder="All MBTI types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All MBTI types</SelectItem>
              <SelectItem value="INTJ">INTJ</SelectItem>
              <SelectItem value="INTP">INTP</SelectItem>
              <SelectItem value="ENTJ">ENTJ</SelectItem>
              <SelectItem value="ENTP">ENTP</SelectItem>
              <SelectItem value="INFJ">INFJ</SelectItem>
              <SelectItem value="INFP">INFP</SelectItem>
              <SelectItem value="ENFJ">ENFJ</SelectItem>
              <SelectItem value="ENFP">ENFP</SelectItem>
              <SelectItem value="ISTJ">ISTJ</SelectItem>
              <SelectItem value="ISFJ">ISFJ</SelectItem>
              <SelectItem value="ESTJ">ESTJ</SelectItem>
              <SelectItem value="ESFJ">ESFJ</SelectItem>
              <SelectItem value="ISTP">ISTP</SelectItem>
              <SelectItem value="ISFP">ISFP</SelectItem>
              <SelectItem value="ESTP">ESTP</SelectItem>
              <SelectItem value="ESFP">ESFP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Range */}
        <div>
          <label htmlFor="age-min" className="block text-sm font-medium mb-2">
            Min Age
          </label>
          <Input
            id="age-min"
            type="number"
            min="18"
            max="99"
            placeholder="Min"
            value={filters.age_min || ""}
            onChange={(e) => handleAgeMinChange(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="age-max" className="block text-sm font-medium mb-2">
            Max Age
          </label>
          <Input
            id="age-max"
            type="number"
            min="18"
            max="99"
            placeholder="Max"
            value={filters.age_max || ""}
            onChange={(e) => handleAgeMaxChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
