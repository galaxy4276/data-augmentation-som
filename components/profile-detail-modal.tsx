'use client';

import { useState } from 'react';
import { X, User, Heart, Calendar, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { ProfileData } from '@/types/api';

interface ProfileDetailModalProps {
  profile: ProfileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDetailModal({
  profile,
  isOpen,
  onClose,
}: ProfileDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!profile) return null;

  const { profile_images, preferences, match_data, dataset_type } = profile;

  // Sort images to show main image first
  const sortedImages = [...profile_images].sort((a, b) => {
    if (a.is_main) return -1;
    if (b.is_main) return 1;
    return a.order - b.order;
  });

  const selectedImage = sortedImages[selectedImageIndex];

  // Group preferences by category
  const selfPreferences = preferences.self_preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, typeof preferences.self_preferences>);

  const partnerPreferences = preferences.partner_preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, typeof preferences.partner_preferences>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Profile Details</span>
            <Badge variant={dataset_type === 'validation' ? 'default' : 'secondary'}>
              {dataset_type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images ({profile_images.length})</h3>

            {/* Main Image Display */}
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage.static_url || selectedImage.s3_url}
                    alt={`${profile.name}'s profile image`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to S3 URL if static URL fails
                      if (e.currentTarget.src !== selectedImage.s3_url) {
                        e.currentTarget.src = selectedImage.s3_url;
                      } else {
                        e.currentTarget.src = '/placeholder-image.png';
                      }
                    }}
                  />
                  {selectedImage.is_main && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="default">Main</Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${index === selectedImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground'
                      }`}
                  >
                    <img
                      src={image.static_url || image.s3_url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to S3 URL if static URL fails
                        if (e.currentTarget.src !== image.s3_url) {
                          e.currentTarget.src = image.s3_url;
                        } else {
                          e.currentTarget.src = '/placeholder-image.png';
                        }
                      }}
                    />
                    {image.is_main && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">Main</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Name</div>
                <div className="font-medium">{profile.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Age</div>
                <div className="font-medium">{profile.age}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Gender</div>
                <Badge variant={profile.gender === 'MALE' ? 'default' : 'secondary'}>
                  {profile.gender}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">MBTI</div>
                <Badge variant="outline">{profile.mbti}</Badge>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Title</div>
                <div className="font-medium">{profile.title || 'Not specified'}</div>
              </div>
              {profile.university_info && (
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">University</div>
                  <div className="font-medium">
                    {profile.university_info.university_name} - {profile.university_info.department_name}
                    {profile.university_info.grade && ` (${profile.university_info.grade})`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Introduction */}
          {profile.introduction && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Introduction</h3>
              <p className="text-sm leading-relaxed">{profile.introduction}</p>
            </div>
          )}

          {/* Self Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">My Preferences</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">MBTI Good Match:</span>{' '}
                  <span className="font-medium">{preferences.good_mbti || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">MBTI Bad Match:</span>{' '}
                  <span className="font-medium">{preferences.bad_mbti || 'Not specified'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Max Distance:</span>{' '}
                  <span className="font-medium">{preferences.distance_max || 'Not specified'}</span>
                </div>
              </div>

              {Object.entries(selfPreferences).map(([category, prefs]) => (
                <div key={category} className="border-t pt-3">
                  <div className="text-sm font-medium mb-2 capitalize">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {prefs.map((pref, idx) => (
                      <Badge key={idx} variant="secondary">
                        {pref.display_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Partner Preferences</h3>
            <div className="space-y-3">
              {Object.entries(partnerPreferences).map(([category, prefs]) => (
                <div key={category} className="border-t pt-3">
                  <div className="text-sm font-medium mb-2 capitalize">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {prefs.map((pref, idx) => (
                      <Badge key={idx} variant="outline">
                        {pref.display_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match Data (for validation dataset) */}
          {match_data && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Match Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Connection ID:</span>{' '}
                  <span className="font-mono text-xs">{match_data.connection_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Match Score:</span>{' '}
                  <span className="font-medium">{match_data.score}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mutual Like:</span>{' '}
                  <Badge variant={match_data.mutual_like ? 'default' : 'secondary'}>
                    {match_data.mutual_like ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Match Date:</span>{' '}
                  <span className="font-medium">
                    {new Date(match_data.match_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Partner Info</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Partner User ID:</span>{' '}
                    <span className="font-medium">{match_data.partner_user_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Partner Profile ID:</span>{' '}
                    <span className="font-medium">{match_data.partner_profile_id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}