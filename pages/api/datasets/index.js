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

  // Temporarily return fallback data to test function stability
  console.log('Returning test fallback data - fetch temporarily disabled');

  const fallbackData = [
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

  console.log('Returning fallback data:', fallbackData);
  res.status(200).json(fallbackData);

  /*
  // Original fetch code (temporarily commented out)
  try {
    console.log(`Attempting to fetch: ${BACKEND_URL}/api/datasets`);

    const response = await fetch(`${BACKEND_URL}/api/datasets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
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
      cause: error.cause
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

    console.log('Returning fallback mock data');
    res.status(200).json(mockData);
  }
}