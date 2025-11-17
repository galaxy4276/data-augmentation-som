// Vercel Serverless Function for /api/datasets/[datasetType]
const BACKEND_URL = 'http://119.67.194.202:31332';

export default async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract dataset type from query
    const { datasetType } = req.query;

    // Validate required parameters
    if (!datasetType) {
      return res.status(400).json({
        error: 'Dataset type is required',
        code: 'MISSING_DATASET_TYPE'
      });
    }

    console.log(`Fetching dataset info for: ${datasetType}`);
    console.log(`Backend URL: ${BACKEND_URL}/api/datasets/${datasetType}`);

    // Attempt to fetch from backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${BACKEND_URL}/api/datasets/${datasetType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ML-Frontend-Vercel-Edge',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Backend response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched dataset info from backend');
        return res.status(200).json(data);
      } else if (response.status === 404) {
        return res.status(404).json({
          error: 'Dataset not found',
          dataset_type: datasetType
        });
      } else {
        console.error(`Backend error: ${response.status} ${response.statusText}`);
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.log('Backend request timed out');
      } else {
        console.log('Backend unavailable:', fetchError.message);
      }

      // Return mock dataset info as fallback
      const mockDataset = {
        id: datasetType,
        name: `${datasetType.charAt(0).toUpperCase() + datasetType.slice(1)} Dataset`,
        type: datasetType,
        count: datasetType === 'validation' ? 1000 : datasetType === 'test' ? 2000 : 3000,
        description: `Student profile ${datasetType} dataset for ML model training and evaluation`,
        demographics: {
          gender: { male: 45, female: 55 },
          age_range: { min: 20, max: 35, avg: 27.5 },
          mbti_distribution: {
            "INTJ": 12, "INFP": 15, "ENTJ": 8, "ENFP": 18,
            "ISTJ": 10, "ISFP": 12, "ESTJ": 7, "ESFP": 18
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _fallback: true,
        _message: 'Using mock data - backend unavailable'
      };

      console.log(`Returning mock dataset info for ${datasetType}`);
      return res.status(200).json(mockDataset);
    }

  } catch (error) {
    console.error('Unexpected error in dataset handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}