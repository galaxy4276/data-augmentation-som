// Vercel Serverless Function for /api/profiles
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
    console.log('=== SIMPLE PROFILES ENDPOINT ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    const { datasetType, page = 1, page_size = 10, gender, age_min, age_max, mbti, search } = req.query;

    if (!datasetType) {
      return res.status(400).json({
        error: 'Dataset type is required',
        example: '/api/profiles?datasetType=validation&page=1&page_size=10',
        received_query: req.query
      });
    }

    console.log('Processing profiles for:', { datasetType, page, page_size });

    // Simple mock data generation
    const mockProfiles = Array.from({ length: parseInt(page_size) }, (_, index) => {
      const profileIndex = (parseInt(page) - 1) * parseInt(page_size) + index + 1;
      const baseAge = datasetType === 'validation' ? 22 : datasetType === 'test' ? 23 : 21;
      const profileAge = baseAge + Math.floor(Math.random() * 8);

      return {
        id: `${datasetType}-${profileIndex}`,
        age: profileAge,
        gender: gender || (Math.random() > 0.5 ? 'MALE' : 'FEMALE'),
        mbti: mbti || ['INTJ', 'ENFP', 'ISTP', 'ESFJ'][Math.floor(Math.random() * 4)],
        bio: search ?
          `${datasetType} profile ${profileIndex} - ${search}` :
          `Sample ${datasetType} profile ${profileIndex}`,
        interests: ['Technology', 'Music', 'Travel', 'Reading', 'Sports', 'Art']
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 + Math.floor(Math.random() * 2)),
        created_at: new Date(Date.now() - (profileIndex * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date().toISOString(),
        dataset_type: datasetType
      };
    });

    const totalCount = datasetType === 'validation' ? 1000 : datasetType === 'test' ? 2000 : 3000;

    const response = {
      items: mockProfiles,
      total: totalCount,
      page: parseInt(page),
      page_size: parseInt(page_size),
      total_pages: Math.ceil(totalCount / parseInt(page_size)),
      dataset_type: datasetType,
      timestamp: new Date().toISOString(),
      message: 'Simple profiles endpoint working'
    };

    console.log(`Returning ${mockProfiles.length} profiles for ${datasetType}`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in profiles endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}