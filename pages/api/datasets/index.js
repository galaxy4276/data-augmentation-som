// Vercel Serverless Function for /api/datasets
const BACKEND_URL = 'http://119.67.194.202:31332';

// Mock data for fallback
const mockDatasets = [
  {
    id: "validation",
    name: "Validation Dataset",
    type: "validation",
    count: 1000,
    description: "Student profile validation data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "test",
    name: "Test Dataset",
    type: "test",
    count: 2000,
    description: "Student profile test data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "learning",
    name: "Learning Dataset",
    type: "learning",
    count: 3000,
    description: "Student profile learning data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
    console.log(`Fetching datasets from: ${BACKEND_URL}/api/datasets`);

    // Attempt to fetch from backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${BACKEND_URL}/api/datasets`, {
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
        console.log('Successfully fetched datasets from backend');
        return res.status(200).json(data);
      } else {
        console.error(`Backend error: ${response.status} ${response.statusText}`);
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.log('Backend request timed out, using fallback data');
      } else {
        console.log('Backend unavailable, using fallback data:', fetchError.message);
      }

      // Return mock data as fallback
      return fallbackToMockData(res);
    }

  } catch (error) {
    console.error('Unexpected error in datasets handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}

function fallbackToMockData(res) {
  console.log('Generating mock datasets data');

  const mockResponse = {
    datasets: mockDatasets,
    total: mockDatasets.length,
    _fallback: true,
    _message: 'Using mock data - backend unavailable',
    timestamp: new Date().toISOString()
  };

  console.log(`Returning ${mockDatasets.length} mock datasets`);
  return res.status(200).json(mockResponse);
}