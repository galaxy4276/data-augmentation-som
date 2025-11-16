'use client';

import type { DatasetInfo } from '@/types/api';

interface DatasetStatsCardProps {
  datasetType: 'validation' | 'learning' | 'test';
  stats: DatasetInfo | null;
  isLoading?: boolean;
}

export function DatasetStatsCard({
  datasetType,
  stats,
  isLoading,
}: DatasetStatsCardProps) {
  const title =
    datasetType === 'validation' ? 'Validation Dataset' :
    datasetType === 'test' ? 'Test Set' : 'Learning Dataset';
  const description =
    datasetType === 'validation'
      ? 'Real user data consisting of mutual like pairs from production database'
      : datasetType === 'test'
      ? 'Real user data for testing and validation purposes'
      : 'Synthetically generated data created through AI augmentation';
  const targetCount = datasetType === 'validation' ? 282 :
                      datasetType === 'test' ? 282 : '3,000-15,000';

  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg bg-card animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  const datasetStats = stats?.stats;
  const totalProfiles = datasetStats?.total_profiles || 0;
  const totalImages = datasetStats?.total_images || 0;
  const genderDist = datasetStats?.gender_distribution || {};
  const ageDist = datasetStats?.age_distribution || {};

  // Calculate gender percentages
  const maleCount = genderDist.MALE || 0;
  const femaleCount = genderDist.FEMALE || 0;
  const totalGender = maleCount + femaleCount;
  const malePercent = totalGender > 0 ? ((maleCount / totalGender) * 100).toFixed(1) : 0;
  const femalePercent = totalGender > 0 ? ((femaleCount / totalGender) * 100).toFixed(1) : 0;

  // Get age range - handle string age ranges like "20-24"
  const ageRanges = Object.keys(ageDist);
  const ageRange = ageRanges.length > 0 ? `${Math.min(...ageRanges.map(range => parseInt(range.split('-')[0]) || 0))}-${Math.max(...ageRanges.map(range => parseInt(range.split('-')[1]) || 0))}` : 'N/A';

  return (
    <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Target</div>
          <div className="text-lg font-semibold">{targetCount}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-sm font-medium">Total Profiles</span>
          <span className="text-2xl font-bold text-primary">{totalProfiles}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-sm font-medium">Total Images</span>
          <span className="text-xl font-semibold">{totalImages}</span>
        </div>

        <div className="py-2 border-t">
          <div className="text-sm font-medium mb-2">Gender Distribution</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Male</span>
                <span className="font-medium">{maleCount} ({malePercent}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${malePercent}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Female</span>
                <span className="font-medium">{femaleCount} ({femalePercent}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500"
                  style={{ width: `${femalePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-sm font-medium">Age Range</span>
          <span className="text-lg font-semibold">{ageRange}</span>
        </div>

        {datasetStats?.updated_at && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(datasetStats.updated_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
