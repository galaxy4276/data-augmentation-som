"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileDetailModal } from "@/components/profile-detail-modal";
import { ProfileFilters } from "@/components/profile-filters";
import { ProfileTable } from "@/components/profile-table";
import { Button } from "@/components/ui/button";
import { useProfile, useProfiles } from "@/hooks/use-profiles";
import { useDatasetStore } from "@/store/dataset-store";
import type {
  ProfileData,
  ProfileFilters as ProfileFiltersType,
  ProfileSummary,
} from "@/types/api";

export default function DatasetsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters } = useDatasetStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters: ProfileFiltersType = {
      dataset_type: (searchParams.get("dataset_type") as any) || undefined,
      gender: (searchParams.get("gender") as any) || undefined,
      age_min: searchParams.get("age_min")
        ? Number(searchParams.get("age_min"))
        : undefined,
      age_max: searchParams.get("age_max")
        ? Number(searchParams.get("age_max"))
        : undefined,
      mbti: searchParams.get("mbti") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Only update if there are URL params
    if (Object.values(urlFilters).some((v) => v !== undefined)) {
      setFilters(urlFilters);
    }

    const page = searchParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.dataset_type) params.set("dataset_type", filters.dataset_type);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.age_min) params.set("age_min", filters.age_min.toString());
    if (filters.age_max) params.set("age_max", filters.age_max.toString());
    if (filters.mbti) params.set("mbti", filters.mbti);
    if (filters.search) params.set("search", filters.search);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/datasets?${queryString}` : "/datasets";
    router.replace(newUrl, { scroll: false });
  }, [filters, currentPage, router]);

  const { data, isLoading } = useProfiles({
    datasetType: filters.dataset_type || "validation",
    page: currentPage,
    page_size: 50,
    ...filters,
  });

  // Get detailed profile data when a profile is selected
  const { data: selectedProfileData, isLoading: isLoadingProfile } = useProfile(
    filters.dataset_type || "validation",
    selectedProfileId || "",
  );

  const handleFiltersChange = (newFilters: ProfileFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleProfileClick = (profile: ProfileSummary) => {
    setSelectedProfileId(profile.id);
  };

  const handleCloseModal = () => {
    setSelectedProfileId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Dataset Browser</h1>
          <p className="text-lg text-muted-foreground">
            Browse and filter profile datasets
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ProfileFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Results Summary */}
        {data && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {data.items?.length} of {data.total} profiles
          </div>
        )}

        {/* Profile Table */}
        <ProfileTable
          profiles={data?.items || []}
          isLoading={isLoading}
          onProfileClick={handleProfileClick}
          currentPage={currentPage}
          totalPages={data?.total_pages || 1}
          totalProfiles={data?.total}
          onPageChange={handlePageChange}
          datasetType={filters.dataset_type || "validation"}
          filters={filters}
        />

        {/* Profile Detail Modal */}
        <ProfileDetailModal
          profile={selectedProfileData}
          isOpen={!!selectedProfileId}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
