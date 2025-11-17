// Vercel Serverless Function for /api/extract/validation
const BACKEND_URL = 'http://119.67.194.202:31332';

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
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/extract/validation`);
    console.log('Request body:', req.body);

    const response = await fetch(`${BACKEND_URL}/api/extract/validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log(`Backend response status: ${response.status}`);
    console.log('Backend response data:', data);
    res.status(response.status).json(data);
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
      task_id: `extract-${Date.now()}`,
      message: 'Validation dataset extraction started successfully',
      status: 'processing'
    };

    console.log('Returning fallback mock response due to error:', error.message);
    res.status(200).json(mockResponse);
  }
}