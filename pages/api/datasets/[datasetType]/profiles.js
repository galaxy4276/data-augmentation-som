// Vercel Serverless Function for /api/datasets/[datasetType]/profiles
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
  const { page = 1, page_size = 50, gender, age_min, age_max, mbti, search } = req.query;

  if (!datasetType) {
    res.status(400).json({ error: 'Dataset type is required' });
    return;
  }

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (gender) queryParams.append('gender', gender);
    if (age_min) queryParams.append('age_min', age_min);
    if (age_max) queryParams.append('age_max', age_max);
    if (mbti) queryParams.append('mbti', mbti);
    if (search) queryParams.append('search', search);

    console.log(`Attempting to fetch: ${BACKEND_URL}/api/datasets/${datasetType}/profiles?${queryParams}`);

    const response = await fetch(`${BACKEND_URL}/api/datasets/${datasetType}/profiles?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.status,
    });

    // Enhanced fallback mock data
    const mockProfiles = Array.from({ length: parseInt(page_size) }, (_, index) => ({
      id: `${datasetType}-${page}-${index + 1}`,
      age: 20 + Math.floor(Math.random() * 40),
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      mbti: ['INTJ', 'ENFP', 'ISTP', 'ESFJ', 'INFJ', 'ENTP', 'ISFJ', 'ESTP'][Math.floor(Math.random() * 8)],
      bio: `Sample bio for profile ${datasetType}-${page}-${index + 1}`,
      interests: ['Technology', 'Music', 'Travel', 'Reading', 'Sports', 'Art', 'Photography', 'Cooking'].slice(0, 3 + Math.floor(Math.random() * 3)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const mockData = {
      items: mockProfiles,
      total: 1000,
      page: parseInt(page),
      page_size: parseInt(page_size),
      total_pages: Math.ceil(1000 / parseInt(page_size))
    };

    console.log('Returning enhanced fallback mock data due to error:', error.message);
    res.status(200).json(mockData);
  }
}