// Vercel Serverless Function for /api/export
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
    console.log('=== SIMPLE EXPORT ENDPOINT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    const { datasetType } = req.query;

    if (!datasetType) {
      return res.status(400).json({
        error: 'Dataset type is required',
        example: '/api/export?datasetType=validation',
        received_query: req.query
      });
    }

    console.log('Exporting dataset:', datasetType);

    // Simple mock CSV generation
    const csvHeaders = 'id,age,gender,mbti,bio,interests,created_at,dataset_type\n';

    const mockRows = Array.from({ length: 5 }, (_, index) => {
      const profileIndex = index + 1;
      const baseAge = datasetType === 'validation' ? 25 : datasetType === 'test' ? 27 : 24;
      const age = baseAge + Math.floor(Math.random() * 5);
      const gender = profileIndex % 2 === 0 ? 'MALE' : 'FEMALE';
      const mbti = ['INTJ', 'ENFP', 'ISTP', 'ESFJ'][profileIndex % 4];

      return `${datasetType}-${profileIndex},${age},${gender},${mbti},"Sample ${datasetType} bio ${profileIndex}","Technology,Music,Travel",${new Date().toISOString()},${datasetType}\n`;
    }).join('');

    const mockCSV = csvHeaders + mockRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${datasetType}-dataset.csv"`);

    console.log(`Returning CSV for ${datasetType}, size: ${mockCSV.length} bytes`);
    return res.status(200).send(mockCSV);

  } catch (error) {
    console.error('Error in export endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}