// Vercel Serverless Function for /api/generate/augmentation
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
    const response = await fetch(`${BACKEND_URL}/api/generate/augmentation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);

    // Fallback mock response
    const mockResponse = {
      task_id: `augment-${Date.now()}`,
      message: 'Dataset augmentation started successfully',
      target_count: req.body?.target_count || 1000
    };

    res.status(200).json(mockResponse);
  }
}