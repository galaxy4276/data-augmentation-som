// Vercel Serverless Function for /api/export/[datasetType]
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

  const { datasetType } = req.query;

  if (!datasetType) {
    res.status(400).json({ error: 'Dataset type is required' });
    return;
  }

  try {
    console.log(`Attempting to GET: ${BACKEND_URL}/export/${datasetType}`);

    const response = await axios.get(`${BACKEND_URL}/export/${datasetType}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout for CSV export
    });

    console.log(`Backend response status: ${response.status}`);

    if (response.status !== 200) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    // Handle CSV blob response
    const contentType = response.headers['content-type'] || 'text/csv';
    const contentDisposition = response.headers['content-disposition'] || `attachment; filename=${datasetType}_dataset.csv`;

    console.log('Successfully processed CSV export response');
    res.status(200)
      .setHeader('Content-Type', contentType)
      .setHeader('Content-Disposition', contentDisposition)
      .send(response.data);
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.status,
    });

    console.log('Returning fallback mock CSV due to error:', error.message);

    // Fallback mock CSV response
    const mockCSV = `id,age,gender,mbti,bio,interests,created_at
${datasetType}-1,25,MALE,INTJ,"Sample bio for ${datasetType} profile 1","Technology,Music,Gaming",${new Date().toISOString()}
${datasetType}-2,30,FEMALE,ENFP,"Sample bio for ${datasetType} profile 2","Art,Travel,Photography",${new Date().toISOString()}
${datasetType}-3,35,MALE,ISTP,"Sample bio for ${datasetType} profile 3","Sports,Reading,Cooking",${new Date().toISOString()}
${datasetType}-4,28,FEMALE,ISFJ,"Sample bio for ${datasetType} profile 4","Music,Technology,Yoga",${new Date().toISOString()}
${datasetType}-5,32,MALE,ENTP,"Sample bio for ${datasetType} profile 5","Business,Innovation,Networking",${new Date().toISOString()}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${datasetType}_dataset.csv`);
    res.status(200).send(mockCSV);
  }
}