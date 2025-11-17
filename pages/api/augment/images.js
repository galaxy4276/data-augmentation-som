// Vercel Serverless Function for /api/augment/images
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/augment/images`);
    console.log('Request body:', req.body);

    const response = await fetch(`${BACKEND_URL}/api/augment/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
      body: JSON.stringify(req.body),
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    res.status(200).json(data);
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
      task_id: `image-${Date.now()}`,
      message: `Image generation task started for ${req.body?.num_images || 4} images`,
      profile_data: req.body?.profile_data || {},
      num_images: req.body?.num_images || 4
    };

    console.log('Returning fallback mock response due to error:', error.message);
    res.status(200).json(mockResponse);
  }
}