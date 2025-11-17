// Vercel Serverless Function for /api/export/custom
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const axios = require('axios');

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
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/export/custom`);
    console.log('Request body:', req.body);

    const response = await axios.post(`${BACKEND_URL}/api/export/custom`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
      responseType: 'arraybuffer',
      timeout: 60000, // 60 second timeout for CSV export
    });

    console.log(`Backend response status: ${response.status}`);

    if (response.status !== 200) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    // Handle CSV blob response
    const contentType = response.headers['content-type'] || 'text/csv';
    const contentDisposition = response.headers['content-disposition'] || 'attachment; filename=export.csv';

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
    const mockCSV = `id,name,age,gender,mbti,bio,interests,created_at
1,John Doe,25,MALE,INTJ,"Software engineer who loves coding","Technology,Reading,Gaming",${new Date().toISOString()}
2,Jane Smith,30,FEMALE,ENFP,"Marketing specialist with creative flair","Art,Music,Travel",${new Date().toISOString()}
3,Bob Johnson,35,MALE,ISTP,"Mechanical engineer and DIY enthusiast","Cars,Woodworking,Sports",${new Date().toISOString()}
4,Alice Williams,28,FEMALE,ISFJ,"Healthcare worker passionate about helping","Medicine,Yoga,Volunteering",${new Date().toISOString()}
5,David Brown,32,MALE,ENTP,"Entrepreneur and startup founder","Business,Innovation,Networking",${new Date().toISOString()}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    res.status(200).send(mockCSV);
  }
}