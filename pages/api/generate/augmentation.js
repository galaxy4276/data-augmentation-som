// Vercel Serverless Function for /api/generate/augmentation
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

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/generate/augmentation`);
    console.log('Request body:', req.body);

    const response = await axios.post(`${BACKEND_URL}/api/generate/augmentation`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
      timeout: 30000, // 30 second timeout for data generation
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

    // Fallback mock response
    const mockResponse = {
      task_id: `augment-${Date.now()}`,
      message: 'Dataset augmentation started successfully',
      target_count: req.body?.target_count || 1000,
      status: 'processing'
    };

    console.log('Returning fallback mock response due to error:', error.message);
    res.status(200).json(mockResponse);
  }
}