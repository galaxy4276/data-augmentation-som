// Vercel Serverless Function for /api/datasets/[datasetType]
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

  const { datasetType } = req.query;

  if (!datasetType) {
    res.status(400).json({ error: 'Dataset type is required' });
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/datasets/${datasetType}`, {
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
    const mockDataset = {
      id: datasetType,
      name: datasetType === 'validation' ? 'Test Dataset' : 'Training Dataset',
      type: datasetType,
      count: datasetType === 'validation' ? 100 : 200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: `Mock ${datasetType} dataset with sample data`
    };

    res.status(200).json(mockDataset);
  }
}