// Vercel Serverless Function for /api/datasets
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

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/datasets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);

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

    res.status(200).json(mockData);
  }
}