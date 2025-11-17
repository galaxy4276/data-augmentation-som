// Vercel Serverless Function for /api/datasets
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const axios = require('axios');

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

  try {
    console.log(`Fetching datasets from: ${BACKEND_URL}/api/datasets`);

    const response = await axios.get(`${BACKEND_URL}/api/datasets`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log(`Backend response status: ${response.status}`);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Backend connection failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: `${BACKEND_URL}/api/datasets`
    });

    // Return enhanced mock data when backend is unavailable
    console.log('Returning mock data fallback');
    res.status(200).json({
      datasets: mockDatasets,
      total: mockDatasets.length,
      _fallback: true,
      _message: 'Using mock data - backend unavailable',
      timestamp: new Date().toISOString()
    });
  }
}