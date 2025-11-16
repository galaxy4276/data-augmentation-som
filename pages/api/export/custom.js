// Vercel Serverless Function for /api/export/custom
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
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/export/custom`);
    console.log('Request body:', req.body);

    const response = await fetch(`${BACKEND_URL}/api/export/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
      body: JSON.stringify(req.body),
        });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    // Handle CSV blob response
    const blob = await response.blob();
    const headers = {
      'Content-Type': 'text/csv',
      'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename=export.csv',
    };

    console.log('Successfully processed CSV export response');
    res.status(200).setHeader(headers).send(Buffer.from(await blob.arrayBuffer()));
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    // Fallback mock CSV response
    const mockCSV = `id,name,age,gender,mbti,created_at
1,John Doe,25,MALE,INTJ,${new Date().toISOString()}
2,Jane Smith,30,FEMALE,ENFP,${new Date().toISOString()}
3,Bob Johnson,35,MALE,ISTP,${new Date().toISOString()}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    res.status(200).send(mockCSV);
  }
}