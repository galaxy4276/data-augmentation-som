// Vercel Serverless Function for /api/datasets
const BACKEND_URL = 'http://119.67.194.202:31332';

export default async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== SIMPLE DATASETS ENDPOINT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    const mockDatasets = [
      {
        id: "validation",
        name: "Validation Dataset",
        type: "validation",
        count: 1000,
        description: "Student profile validation data for model testing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "test",
        name: "Test Dataset",
        type: "test",
        count: 2000,
        description: "Student profile test data for final evaluation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "learning",
        name: "Learning Dataset",
        type: "learning",
        count: 3000,
        description: "Student profile learning data for model training",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const response = {
      datasets: mockDatasets,
      total: mockDatasets.length,
      timestamp: new Date().toISOString(),
      message: 'Simple datasets endpoint working'
    };

    console.log('Returning datasets response');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in datasets endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}