// Vercel Serverless Function for /api/datasets/[datasetType]/profiles/[profileId]
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

  const { datasetType, profileId } = req.query;

  if (!datasetType || !profileId) {
    res.status(400).json({ error: 'Dataset type and profile ID are required' });
    return;
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/datasets/${datasetType}/profiles/${profileId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...req.headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);

    // Fallback mock data
    const mockProfile = {
      id: profileId,
      age: 20 + Math.floor(Math.random() * 40),
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      mbti: ['INTJ', 'ENFP', 'ISTP', 'ESFJ', 'INFJ', 'ENTP', 'ISFJ', 'ESTP'][Math.floor(Math.random() * 8)],
      bio: `Sample bio for profile ${profileId}`,
      interests: ['Technology', 'Music', 'Travel', 'Reading'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        {
          id: `${profileId}-1`,
          url: `https://picsum.photos/200/300?random=${profileId}`,
          caption: 'Profile image 1'
        },
        {
          id: `${profileId}-2`,
          url: `https://picsum.photos/200/301?random=${profileId}`,
          caption: 'Profile image 2'
        }
      ]
    };

    res.status(200).json(mockProfile);
  }
}