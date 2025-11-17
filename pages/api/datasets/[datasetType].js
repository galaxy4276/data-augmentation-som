// Vercel Serverless Function for /api/datasets/[datasetType]
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const axios = require('axios');

// Mock dataset info for fallback
const mockDatasetInfo = {
  validation: {
    id: "validation",
    name: "Validation Dataset",
    type: "validation",
    count: 1000,
    description: "Student profile validation data for testing model accuracy",
    demographics: {
      gender: { male: 45, female: 55 },
      age_range: { min: 20, max: 35, avg: 27.5 },
      mbti_distribution: {
        "INTJ": 12, "INFP": 15, "ENTJ": 8, "ENFP": 18,
        "ISTJ": 10, "ISFP": 12, "ESTJ": 7, "ESFP": 18
      }
    },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  test: {
    id: "test",
    name: "Test Dataset",
    type: "test",
    count: 2000,
    description: "Student profile test data for final model evaluation",
    demographics: {
      gender: { male: 48, female: 52 },
      age_range: { min: 20, max: 35, avg: 27.8 },
      mbti_distribution: {
        "INTJ": 14, "INFP": 16, "ENTJ": 10, "ENFP": 20,
        "ISTJ": 12, "ISFP": 14, "ESTJ": 8, "ESFP": 16
      }
    },
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T14:15:00Z"
  },
  learning: {
    id: "learning",
    name: "Learning Dataset",
    type: "learning",
    count: 3000,
    description: "Student profile learning data for model training",
    demographics: {
      gender: { male: 46, female: 54 },
      age_range: { min: 20, max: 35, avg: 27.2 },
      mbti_distribution: {
        "INTJ": 13, "INFP": 14, "ENTJ": 9, "ENFP": 19,
        "ISTJ": 11, "ISFP": 13, "ESTJ": 7, "ESFP": 14
      }
    },
    created_at: "2024-01-05T08:00:00Z",
    updated_at: "2024-01-22T16:45:00Z"
  }
};

export default async function handler(req, res) {
  const { datasetType } = req.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!datasetType) {
    return res.status(400).json({ error: 'Dataset type is required' });
  }

  try {
    console.log(`Fetching dataset info for ${datasetType} from: ${BACKEND_URL}/api/datasets/${datasetType}`);

    const response = await axios.get(`${BACKEND_URL}/api/datasets/${datasetType}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
      timeout: 30000,
    });

    console.log(`Backend response status: ${response.status}`);

    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Backend connection failed for dataset ${datasetType}:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: `${BACKEND_URL}/api/datasets/${datasetType}`
    });

    // Return mock data for the requested dataset type
    const mockData = mockDatasetInfo[datasetType];
    if (!mockData) {
      return res.status(404).json({
        error: 'Dataset not found',
        dataset_type: datasetType,
        available_types: Object.keys(mockDatasetInfo)
      });
    }

    console.log(`Returning mock data for dataset type: ${datasetType}`);
    res.status(200).json({
      ...mockData,
      _fallback: true,
      _message: `Using mock data for ${datasetType} dataset - backend unavailable`,
      timestamp: new Date().toISOString()
    });
  }
}