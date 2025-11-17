// Vercel Serverless Function for /api/datasets/[datasetType]/profiles
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

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters
    const { datasetType } = req.query;
    const { page = 1, page_size = 50, gender, age_min, age_max, mbti, search } = req.query;

    // Validate required parameters
    if (!datasetType) {
      return res.status(400).json({
        error: 'Dataset type is required',
        code: 'MISSING_DATASET_TYPE'
      });
    }

    console.log(`Fetching profiles for dataset: ${datasetType}`);
    console.log(`Backend URL: ${BACKEND_URL}/api/datasets/${datasetType}/profiles`);

    // Build query parameters for backend
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', page_size.toString());

    if (gender) params.append('gender', gender);
    if (age_min) params.append('age_min', age_min.toString());
    if (age_max) params.append('age_max', age_max.toString());
    if (mbti) params.append('mbti', mbti);
    if (search) params.append('search', search);

    // Attempt to fetch from backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${BACKEND_URL}/api/datasets/${datasetType}/profiles?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ML-Frontend-Vercel-Edge',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Backend response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched profiles from backend');
        return res.status(200).json(data);
      } else {
        console.error(`Backend error: ${response.status} ${response.statusText}`);
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.log('Backend request timed out');
      } else {
        console.log('Backend unavailable:', fetchError.message);
      }

      // Return mock data as fallback when backend is unavailable
      const mockProfiles = Array.from({ length: parseInt(page_size) }, (_, index) => {
        const profileIndex = (parseInt(page) - 1) * parseInt(page_size) + index + 1;
        const profileAge = age_min ?
          parseInt(age_min) + Math.floor(Math.random() * ((age_max ? parseInt(age_max) : 35) - parseInt(age_min) + 1)) :
          20 + Math.floor(Math.random() * 16);

        return {
          id: `${datasetType}-${profileIndex}`,
          age: profileAge,
          gender: gender || (Math.random() > 0.5 ? 'MALE' : 'FEMALE'),
          mbti: mbti || ['INTJ', 'ENFP', 'ISTP', 'ESFJ', 'INFJ', 'ENTP', 'ISFJ', 'ESTP'][Math.floor(Math.random() * 8)],
          bio: search ?
            `Sample bio for profile ${profileIndex} matching search: ${search}` :
            `Sample bio for ${datasetType} profile ${profileIndex}`,
          interests: ['Technology', 'Music', 'Travel', 'Reading', 'Sports', 'Art', 'Photography', 'Cooking']
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 + Math.floor(Math.random() * 3)),
          created_at: new Date(Date.now() - (profileIndex * 60 * 60 * 1000)).toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      const mockResponse = {
        items: mockProfiles,
        total: 1000,
        page: parseInt(page),
        page_size: parseInt(page_size),
        total_pages: Math.ceil(1000 / parseInt(page_size)),
        _fallback: true,
        _message: 'Using mock data - backend unavailable',
        filters: {
          dataset_type: datasetType,
          gender: gender || null,
          age_min: age_min || null,
          age_max: age_max || null,
          mbti: mbti || null,
          search: search || null
        },
        timestamp: new Date().toISOString()
      };

      console.log(`Returning ${mockProfiles.length} mock profiles for page ${page}`);
      return res.status(200).json(mockResponse);
    }

  } catch (error) {
    console.error('Unexpected error in profiles handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}