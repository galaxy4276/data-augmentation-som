// Vercel Serverless Function for /api/export/custom
const BACKEND_URL = 'http://119.67.194.202:31332';

export default async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Exporting filtered dataset:', req.body);

    const backendUrl = `${BACKEND_URL}/api/export/custom`;
    console.log(`Requesting custom export from: ${backendUrl}`);

    // Attempt to fetch from backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for CSV export

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ML-Frontend-Vercel-Edge',
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Backend response status: ${response.status}`);

      if (response.ok) {
        // Handle CSV blob response
        const contentType = response.headers.get('content-type') || 'text/csv';
        const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename=custom_dataset.csv';

        // Get the response as array buffer for binary data
        const arrayBuffer = await response.arrayBuffer();

        console.log('Successfully processed custom CSV export response');
        return res.status(200)
          .setHeader('Content-Type', contentType)
          .setHeader('Content-Disposition', contentDisposition)
          .send(Buffer.from(arrayBuffer));
      } else {
        console.error(`Backend error: ${response.status} ${response.statusText}`);
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.log('Backend request timed out, using fallback data');
      } else {
        console.log('Backend unavailable, using fallback data:', fetchError.message);
      }

      // Return mock CSV data as fallback
      return fallbackToMockCSV(req, res);
    }

  } catch (error) {
    console.error('Unexpected error in custom export handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}

function fallbackToMockCSV(req, res) {
  console.log('Generating mock custom CSV data');

  const filters = req.body || {};
  const mockCSV = `id,age,gender,mbti,bio,interests,created_at
custom-1,${filters.age_min || 25},MALE,INTJ,"Sample bio matching filters: ${JSON.stringify(filters)}","Technology,Music,Gaming",${new Date().toISOString()}
custom-2,${filters.age_min ? parseInt(filters.age_min) + 2 : 28},FEMALE,ENFP,"Profile with applied filters","Art,Music,Travel",${new Date().toISOString()}
custom-3,${filters.age_min ? parseInt(filters.age_min) + 5 : 30},MALE,ISTP,"Filtered custom profile","Sports,Reading,Cooking",${new Date().toISOString()}
custom-4,${filters.age_min ? parseInt(filters.age_min) + 3 : 27},FEMALE,ISFJ,"Custom export sample","Music,Technology,Yoga",${new Date().toISOString()}
custom-5,${filters.age_min ? parseInt(filters.age_min) + 7 : 32},MALE,ENTP,"Export with filters applied","Business,Innovation,Photography",${new Date().toISOString()}`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=custom_dataset_mock_${new Date().toISOString().split('T')[0]}.csv`);
  res.status(200).send(mockCSV);
}