// Vercel Serverless Function for /api/export-validation
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
    console.log('Exporting validation dataset');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${BACKEND_URL}/export/validation`, {
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
        const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="validation-dataset.csv"';

        const arrayBuffer = await response.arrayBuffer();

        console.log('Successfully processed validation CSV export');
        return res.status(200)
          .setHeader('Content-Type', contentType)
          .setHeader('Content-Disposition', contentDisposition)
          .send(Buffer.from(arrayBuffer));
      } else {
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log('Backend unavailable for validation export, using fallback');

      const mockCSV = `id,age,gender,mbti,bio,interests,created_at
validation-1,25,MALE,INTJ,"Sample validation bio 1","Technology,Music,Gaming",${new Date().toISOString()}
validation-2,28,FEMALE,ENFP,"Sample validation bio 2","Art,Music,Travel",${new Date().toISOString()}
validation-3,30,MALE,ISTP,"Sample validation bio 3","Sports,Reading,Cooking",${new Date().toISOString()}
validation-4,26,FEMALE,ISFJ,"Sample validation bio 4","Music,Technology,Yoga",${new Date().toISOString()}
validation-5,29,MALE,ENTP,"Sample validation bio 5","Business,Innovation,Networking",${new Date().toISOString()}
validation-6,27,FEMALE,INFJ,"Sample validation bio 6","Photography,Travel,Reading",${new Date().toISOString()}
validation-7,31,MALE,ESFP,"Sample validation bio 7","Cooking,Sports,Music",${new Date().toISOString()}
validation-8,24,FEMALE,ESTJ,"Sample validation bio 8","Technology,Business,Art",${new Date().toISOString()}
validation-9,33,MALE,INTP,"Sample validation bio 9","Gaming,Travel,Reading",${new Date().toISOString()}
validation-10,25,FEMALE,ENFJ,"Sample validation bio 10","Music,Yoga,Photography",${new Date().toISOString()}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="validation-dataset-mock.csv"');
      return res.status(200).send(mockCSV);
    }

  } catch (error) {
    console.error('Unexpected error in validation export handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}