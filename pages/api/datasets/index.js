// Vercel Serverless Function for /api/datasets
const BACKEND_URL = 'http://119.67.194.202:31332';
const axios = require('axios');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

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
    console.log(`Attempting to fetch: ${BACKEND_URL}/api/datasets`);

    const response = await axios.get(`${BACKEND_URL}/api/datasets`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log(`Backend response status: ${response.status}`);
    console.log('Backend response data:', response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.status,
    });

    // Fallback mock data
    const mockData = [
      {
        id: "1",
        name: "Test Dataset",
        type: "validation",
        count: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "2",
        name: "Training Dataset",
        type: "training",
        count: 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('Returning fallback mock data due to error:', error.message);
    res.status(200).json(mockData);
  }
}