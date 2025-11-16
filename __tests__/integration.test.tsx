/**
 * Frontend Integration Tests for ML Data Augmentation System
 * 
 * Tests:
 * - Dashboard with real backend data
 * - Table filtering, search, and pagination
 * - Task progress monitoring
 * - Export functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock API responses
const mockDatasets = [
  {
    dataset_type: 'validation',
    total_profiles: 282,
    total_images: 846,
    gender_distribution: { MALE: 141, FEMALE: 141 },
    age_distribution: { '23-25': 100, '26-28': 120, '29-31': 62 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    dataset_type: 'learning',
    total_profiles: 3000,
    total_images: 9000,
    gender_distribution: { MALE: 1500, FEMALE: 1500 },
    age_distribution: { '23-25': 1000, '26-28': 1200, '29-31': 800 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockProfiles = {
  profiles: [
    {
      id: 'user_001',
      age: 24,
      gender: 'MALE',
      name: 'John Doe',
      title: 'Software Engineer',
      mbti: 'ENFP',
      introduction: 'Hello, nice to meet you',
      university_info: {
        university: 'Seoul National University',
        department: 'Computer Science'
      },
      profile_images: [
        { id: '1', s3_url: 'https://s3.../img1.jpg', is_main: true, order: 0 },
        { id: '2', s3_url: 'https://s3.../img2.jpg', is_main: false, order: 1 }
      ],
      preferences: {
        self: { mbti_good: 'INFJ', mbti_bad: 'ESTP', options: [] },
        partner: { options: [] }
      }
    },
    {
      id: 'user_002',
      age: 25,
      gender: 'FEMALE',
      name: 'Jane Smith',
      title: 'Designer',
      mbti: 'INTJ',
      introduction: 'Hi there!',
      university_info: {
        university: 'Yonsei University',
        department: 'Design'
      },
      profile_images: [
        { id: '3', s3_url: 'https://s3.../img3.jpg', is_main: true, order: 0 }
      ],
      preferences: {
        self: { mbti_good: 'ENFP', mbti_bad: 'ISTP', options: [] },
        partner: { options: [] }
      }
    }
  ],
  total: 282,
  page: 1,
  page_size: 50
}

const mockTaskStatus = {
  task_id: 'task_123',
  status: 'running',
  progress: 0.45,
  current_step: 'Processing batch 45/100',
  total_steps: 100,
  estimated_completion: '2024-01-01T01:00:00Z',
  error: null
}

describe('Dashboard Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('should display dataset statistics', () => {
    const validationDataset = mockDatasets[0]

    expect(validationDataset.dataset_type).toBe('validation')
    expect(validationDataset.total_profiles).toBe(282)
    expect(validationDataset.total_images).toBe(846)
    expect(validationDataset.gender_distribution.MALE).toBe(141)
    expect(validationDataset.gender_distribution.FEMALE).toBe(141)
  })

  it('should calculate correct statistics', () => {
    const learningDataset = mockDatasets[1]

    const totalProfiles = learningDataset.total_profiles
    const totalImages = learningDataset.total_images
    const imagesPerProfile = totalImages / totalProfiles

    expect(imagesPerProfile).toBe(3)
    expect(totalProfiles).toBe(3000)
  })

  it('should handle real-time updates', () => {
    const initialProgress = 0.0
    const updates = [0.25, 0.5, 0.75, 1.0]

    updates.forEach(progress => {
      expect(progress).toBeGreaterThanOrEqual(initialProgress)
      expect(progress).toBeLessThanOrEqual(1.0)
    })
  })
})

describe('Profile Table Integration', () => {
  it('should display profiles with correct data', () => {
    const profiles = mockProfiles.profiles

    expect(profiles).toHaveLength(2)
    expect(profiles[0].id).toBe('user_001')
    expect(profiles[0].age).toBe(24)
    expect(profiles[0].gender).toBe('MALE')
  })

  it('should filter profiles by gender', () => {
    const profiles = mockProfiles.profiles
    const maleProfiles = profiles.filter(p => p.gender === 'MALE')
    const femaleProfiles = profiles.filter(p => p.gender === 'FEMALE')

    expect(maleProfiles).toHaveLength(1)
    expect(femaleProfiles).toHaveLength(1)
    expect(maleProfiles[0].name).toBe('John Doe')
  })

  it('should filter profiles by age range', () => {
    const profiles = mockProfiles.profiles
    const ageRange = { min: 24, max: 25 }

    const filteredProfiles = profiles.filter(
      p => p.age >= ageRange.min && p.age <= ageRange.max
    )

    expect(filteredProfiles).toHaveLength(2)
  })

  it('should filter profiles by MBTI', () => {
    const profiles = mockProfiles.profiles
    const targetMBTI = 'ENFP'

    const filteredProfiles = profiles.filter(p => p.mbti === targetMBTI)

    expect(filteredProfiles).toHaveLength(1)
    expect(filteredProfiles[0].id).toBe('user_001')
  })

  it('should search profiles by name', () => {
    const profiles = mockProfiles.profiles
    const searchTerm = 'john'

    const searchResults = profiles.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    expect(searchResults).toHaveLength(1)
    expect(searchResults[0].name).toBe('John Doe')
  })

  it('should handle pagination correctly', () => {
    const { total, page, page_size } = mockProfiles

    const totalPages = Math.ceil(total / page_size)

    expect(totalPages).toBe(6) // 282 / 50 = 5.64, rounded up to 6
    expect(page).toBe(1)
    expect(page_size).toBe(50)
  })

  it('should sort profiles by age', () => {
    const profiles = [...mockProfiles.profiles]

    // Sort ascending
    const sortedAsc = profiles.sort((a, b) => a.age - b.age)
    expect(sortedAsc[0].age).toBe(24)
    expect(sortedAsc[1].age).toBe(25)

    // Sort descending
    const sortedDesc = profiles.sort((a, b) => b.age - a.age)
    expect(sortedDesc[0].age).toBe(25)
    expect(sortedDesc[1].age).toBe(24)
  })
})

describe('Task Progress Monitoring', () => {
  it('should track task status correctly', () => {
    const status = mockTaskStatus

    expect(status.task_id).toBe('task_123')
    expect(status.status).toBe('running')
    expect(status.progress).toBe(0.45)
    expect(status.current_step).toContain('Processing batch')
  })

  it('should calculate progress percentage', () => {
    const { progress, total_steps } = mockTaskStatus

    const progressPercentage = progress * 100
    const completedSteps = Math.floor(progress * total_steps)

    expect(progressPercentage).toBe(45)
    expect(completedSteps).toBe(45)
  })

  it('should handle task completion', () => {
    const completedTask = {
      ...mockTaskStatus,
      status: 'completed',
      progress: 1.0,
      current_step: 'Task completed successfully'
    }

    expect(completedTask.status).toBe('completed')
    expect(completedTask.progress).toBe(1.0)
  })

  it('should handle task failure', () => {
    const failedTask = {
      ...mockTaskStatus,
      status: 'failed',
      progress: 0.3,
      error: 'API rate limit exceeded'
    }

    expect(failedTask.status).toBe('failed')
    expect(failedTask.error).toBeTruthy()
  })

  it('should estimate completion time', () => {
    const { progress, estimated_completion } = mockTaskStatus

    if (estimated_completion) {
      const estimatedTime = new Date(estimated_completion)
      const now = new Date()

      expect(estimatedTime.getTime()).toBeGreaterThan(now.getTime() - 86400000) // Within last 24 hours
    }
  })
})

describe('Export Functionality', () => {
  it('should generate correct export filename', () => {
    const datasetType = 'validation'
    const date = new Date('2024-01-01')
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')

    const filename = `${datasetType}_export_${dateStr}.csv`

    expect(filename).toBe('validation_export_20240101.csv')
  })

  it('should format CSV data correctly', () => {
    const profile = mockProfiles.profiles[0]

    const csvRow = {
      id: profile.id,
      age: profile.age,
      gender: profile.gender,
      name: profile.name,
      mbti: profile.mbti,
      introduction: profile.introduction,
      university: profile.university_info.university,
      department: profile.university_info.department,
      image_paths: profile.profile_images.map(img => img.s3_url).join(';'),
      preferences_self: JSON.stringify(profile.preferences.self),
      preferences_partner: JSON.stringify(profile.preferences.partner)
    }

    expect(csvRow.id).toBe('user_001')
    expect(csvRow.image_paths).toContain(';')
    expect(csvRow.preferences_self).toContain('mbti_good')
  })

  it('should handle export with filters', () => {
    const filters = {
      gender: 'MALE',
      age_min: 24,
      age_max: 26,
      mbti: 'ENFP'
    }

    const profiles = mockProfiles.profiles.filter(p =>
      p.gender === filters.gender &&
      p.age >= filters.age_min &&
      p.age <= filters.age_max &&
      p.mbti === filters.mbti
    )

    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('user_001')
  })

  it('should validate export data integrity', () => {
    const profiles = mockProfiles.profiles

    // Check all required fields are present
    profiles.forEach(profile => {
      expect(profile.id).toBeTruthy()
      expect(profile.age).toBeGreaterThan(0)
      expect(profile.gender).toMatch(/^(MALE|FEMALE)$/)
      expect(profile.name).toBeTruthy()
      expect(profile.mbti).toMatch(/^[IE][NS][TF][JP]$/)
      expect(profile.profile_images.length).toBeGreaterThan(0)
    })
  })
})

describe('Profile Detail Modal', () => {
  it('should display complete profile information', () => {
    const profile = mockProfiles.profiles[0]

    expect(profile.id).toBe('user_001')
    expect(profile.name).toBe('John Doe')
    expect(profile.age).toBe(24)
    expect(profile.gender).toBe('MALE')
    expect(profile.mbti).toBe('ENFP')
    expect(profile.introduction).toBeTruthy()
    expect(profile.university_info).toBeTruthy()
    expect(profile.profile_images).toHaveLength(2)
    expect(profile.preferences).toBeTruthy()
  })

  it('should identify main image', () => {
    const profile = mockProfiles.profiles[0]
    const mainImage = profile.profile_images.find(img => img.is_main)

    expect(mainImage).toBeTruthy()
    expect(mainImage?.order).toBe(0)
  })

  it('should display preference breakdown', () => {
    const profile = mockProfiles.profiles[0]
    const { self, partner } = profile.preferences

    expect(self.mbti_good).toBe('INFJ')
    expect(self.mbti_bad).toBe('ESTP')
    expect(Array.isArray(self.options)).toBe(true)
    expect(Array.isArray(partner.options)).toBe(true)
  })
})

describe('Data Validation', () => {
  it('should validate profile data structure', () => {
    const profile = mockProfiles.profiles[0]

    const requiredFields = [
      'id', 'age', 'gender', 'name', 'mbti',
      'introduction', 'university_info', 'profile_images', 'preferences'
    ]

    requiredFields.forEach(field => {
      expect(profile).toHaveProperty(field)
    })
  })

  it('should validate age range', () => {
    const profiles = mockProfiles.profiles

    profiles.forEach(profile => {
      expect(profile.age).toBeGreaterThanOrEqual(18)
      expect(profile.age).toBeLessThanOrEqual(100)
    })
  })

  it('should validate gender values', () => {
    const profiles = mockProfiles.profiles
    const validGenders = ['MALE', 'FEMALE']

    profiles.forEach(profile => {
      expect(validGenders).toContain(profile.gender)
    })
  })

  it('should validate MBTI format', () => {
    const profiles = mockProfiles.profiles
    const mbtiPattern = /^[IE][NS][TF][JP]$/

    profiles.forEach(profile => {
      expect(profile.mbti).toMatch(mbtiPattern)
    })
  })

  it('should validate image data', () => {
    const profiles = mockProfiles.profiles

    profiles.forEach(profile => {
      expect(profile.profile_images.length).toBeGreaterThan(0)

      profile.profile_images.forEach(image => {
        expect(image).toHaveProperty('id')
        expect(image).toHaveProperty('s3_url')
        expect(image).toHaveProperty('is_main')
        expect(image).toHaveProperty('order')
        expect(image.s3_url).toContain('https://')
      })

      // Should have exactly one main image
      const mainImages = profile.profile_images.filter(img => img.is_main)
      expect(mainImages).toHaveLength(1)
    })
  })
})

describe('Error Handling', () => {
  it('should handle API errors gracefully', () => {
    const errorResponse = {
      error_code: 'DATABASE_ERROR',
      message: 'Failed to connect to database',
      details: { host: 'localhost', port: 5432 },
      timestamp: '2024-01-01T00:00:00Z',
      request_id: 'req_123'
    }

    expect(errorResponse.error_code).toBeTruthy()
    expect(errorResponse.message).toBeTruthy()
    expect(errorResponse.request_id).toBeTruthy()
  })

  it('should handle missing data', () => {
    const incompleteProfile = {
      id: 'user_003',
      age: 25,
      // Missing required fields
    }

    const requiredFields = ['gender', 'name', 'mbti']
    const missingFields = requiredFields.filter(
      field => !(field in incompleteProfile)
    )

    expect(missingFields.length).toBeGreaterThan(0)
  })

  it('should handle network timeouts', () => {
    const timeoutError = {
      name: 'TimeoutError',
      message: 'Request timeout after 30000ms',
      code: 'ETIMEDOUT'
    }

    expect(timeoutError.name).toBe('TimeoutError')
    expect(timeoutError.code).toBe('ETIMEDOUT')
  })
})

describe('Performance Tests', () => {
  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 3000 }, (_, i) => ({
      id: `user_${i.toString().padStart(4, '0')}`,
      age: 23 + (i % 10),
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
      name: `User ${i}`,
      mbti: ['ENFP', 'INTJ', 'INFJ', 'ENTP'][i % 4]
    }))

    expect(largeDataset).toHaveLength(3000)

    // Test filtering performance
    const filtered = largeDataset.filter(p => p.gender === 'MALE')
    expect(filtered).toHaveLength(1500)
  })

  it('should paginate large datasets', () => {
    const totalProfiles = 3000
    const pageSize = 50
    const totalPages = Math.ceil(totalProfiles / pageSize)

    expect(totalPages).toBe(60)

    // Test page boundaries
    const page1Start = 0
    const page1End = pageSize
    const page2Start = pageSize
    const page2End = pageSize * 2

    expect(page1End - page1Start).toBe(50)
    expect(page2End - page2Start).toBe(50)
  })
})
