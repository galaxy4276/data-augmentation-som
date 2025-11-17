// Vercel Serverless Function for /api/export-test
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
    console.log('Exporting test dataset');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${BACKEND_URL}/export/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ML-Frontend-Vercel-Edge',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'text/csv';
        const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="test-dataset.csv"';

        const arrayBuffer = await response.arrayBuffer();

        console.log('Successfully processed test CSV export');
        return res.status(200)
          .setHeader('Content-Type', contentType)
          .setHeader('Content-Disposition', contentDisposition)
          .send(Buffer.from(arrayBuffer));
      } else {
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log('Backend unavailable for test export, using fallback');

      const mockCSV = `id,age,gender,mbti,bio,interests,created_at
test-1,26,MALE,INTJ,"Sample test bio 1","Technology,Programming,Gaming",${new Date().toISOString()}
test-2,29,FEMALE,ENFP,"Sample test bio 2","Design,Music,Travel",${new Date().toISOString()}
test-3,31,MALE,ISTP,"Sample test bio 3","Engineering,Sports,Reading",${new Date().toISOString()}
test-4,27,FEMALE,ISFJ,"Sample test bio 4","Teaching,Art,Yoga",${new Date().toISOString()}
test-5,30,MALE,ENTP,"Sample test bio 5","Startup,Innovation,Networking",${new Date().toISOString()}
test-6,28,FEMALE,INFJ,"Sample test bio 6","Writing,Photography,Travel",${new Date().toISOString()}
test-7,32,MALE,ESFP,"Sample test bio 7","Entertainment,Music,Social",${new Date().toISOString()}
test-8,25,FEMALE,ESTJ,"Sample test bio 8","Management,Organization,Planning",${new Date().toISOString()}
test-9,34,MALE,INTP,"Sample test bio 9","Research,Analysis,Gaming",${new Date().toISOString()}
test-10,26,FEMALE,ENFJ,"Sample test bio 10","Healthcare,Counseling,Mentoring",${new Date().toISOString()}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="test-dataset-mock.csv"');
      return res.status(200).send(mockCSV);
    }

  } catch (error) {
    console.error('Unexpected error in test export handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}