export type DatasetType = 'validation' | 'learning';

export type Gender = 'MALE' | 'FEMALE';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface UniversityInfo {
  university_name: string;
  department_name: string;
  grade: string;
}

export interface ImageInfo {
  id: string;
  s3_url: string;
  static_url?: string;
  s3_key?: string;
  is_main: boolean;
  order: number;
  local_path?: string;
}

export interface PreferenceOption {
  category: string;
  value: string;
  display_name: string;
}

export interface PreferenceInfo {
  distance_max?: string;
  good_mbti?: string;
  bad_mbti?: string;
  self_preferences: PreferenceOption[];
  partner_preferences: PreferenceOption[];
}

export interface MatchInfo {
  connection_id: string;
  partner_user_id: string;
  partner_profile_id: string;
  score: number;
  match_date: string;
  mutual_like: boolean;
}

export interface ProfileSummary {
  id: string;
  user_id: string;
  dataset_type: DatasetType;
  age: number;
  gender: Gender;
  name: string;
  mbti?: string;
  image_count: number;
  has_match_data: boolean;
  created_at?: string;
}

export interface ProfileData {
  id: string;
  user_id: string;
  dataset_type: DatasetType;
  age: number;
  gender: Gender;
  name: string;
  title?: string;
  mbti?: string;
  introduction?: string;
  university_info?: UniversityInfo;
  profile_images: ImageInfo[];
  preferences: PreferenceInfo;
  match_data?: MatchInfo;
  created_at?: string;
}

export interface DatasetStats {
  dataset_type: DatasetType;
  total_profiles: number;
  total_images: number;
  gender_distribution: Record<string, number>;
  age_distribution: Record<string, number>;
  mbti_distribution: Record<string, number>;
  created_at?: string;
  updated_at?: string;
}

export interface DatasetInfo {
  dataset_type: DatasetType;
  stats: DatasetStats;
  storage_path: string;
  profiles_available: boolean;
}

export interface TaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  progress: number;
  current_step: string;
  total_steps: number;
  estimated_completion?: string;
  error?: string;
}

export interface ErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  request_id: string;
}

export interface ProfileFilters {
  dataset_type?: DatasetType;
  gender?: Gender;
  age_min?: number;
  age_max?: number;
  mbti?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface ProfileListResponse {
  items: ProfileSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProfilePage {
  profiles: ProfileData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface TaskLogEntry {
  id: string;
  task_id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  step?: string;
  details?: Record<string, any>;
  duration_ms?: number;
  progress?: number;
}

export interface TaskLogsResponse {
  task_id: string;
  logs: TaskLogEntry[];
  total_logs: number;
  page: number;
  page_size: number;
  total_pages: number;
}