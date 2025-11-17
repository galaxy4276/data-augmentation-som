// Vercel Serverless Function for /api/datasets/[datasetType]/profiles/[profileId]
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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
    const { datasetType, profileId } = req.query;

    // Validate required parameters
    if (!datasetType || !profileId) {
      return res.status(400).json({
        error: 'Dataset type and profile ID are required',
        code: 'MISSING_PARAMETERS',
        missing: {
          dataset_type: !datasetType,
          profile_id: !profileId
        }
      });
    }

    const backendUrl = `${BACKEND_URL}/api/datasets/${datasetType}/profiles/${profileId}`;
    console.log(`Fetching profile ${profileId} from ${datasetType}: ${backendUrl}`);

    // Attempt to fetch from backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(backendUrl, {
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
        console.log('Successfully fetched profile from backend');
        return res.status(200).json(data);
      } else if (response.status === 404) {
        return res.status(404).json({
          error: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
          dataset_type: datasetType,
          profile_id: profileId
        });
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

      // Return mock data as fallback
      return fallbackToMockProfileData(req, res, datasetType, profileId);
    }

  } catch (error) {
    console.error('Unexpected error in profile handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}

function fallbackToMockProfileData(req, res, datasetType, profileId) {
  console.log(`Generating mock profile data for ${profileId} in ${datasetType}`);

  const id = parseInt(profileId) || 1;
  const mbtiTypes = ['INTJ', 'INFP', 'ENTJ', 'ENFP', 'ISTJ', 'ISFP', 'ESTJ', 'ESFP'];
  const interests = ['Technology', 'Music', 'Travel', 'Reading', 'Sports', 'Art', 'Photography', 'Cooking'];

  const selectedInterests = interests
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 4));

  const mockProfile = {
    id: profileId,
    age: 20 + (id % 16), // Age between 20-35
    gender: id % 2 === 0 ? 'MALE' : 'FEMALE',
    mbti: mbtiTypes[id % mbtiTypes.length],
    bio: `Sample bio for profile ${profileId} from ${datasetType} dataset. This is a university student profile with various interests and characteristics.`,
    interests: selectedInterests,
    images: [
      `https://picsum.photos/400/${profileId}1`,
      `https://picsum.photos/400/${profileId}2`,
      `https://picsum.photos/400/${profileId}3`
    ],
    preferences: {
      age_range: {
        min: 20 + (id % 5),
        max: 30 + (id % 6)
      },
      gender_preference: id % 3 === 0 ? 'ANY' : (id % 2 === 0 ? 'MALE' : 'FEMALE'),
      mbti_compatibility: mbtiTypes
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 + Math.floor(Math.random() * 3)),
      shared_interests: selectedInterests.slice(0, 2)
    },
    matches: [
      {
        id: `match-${profileId}-1`,
        score: 85 + (id % 10),
        compatibility_factors: ['MBTI Match', 'Shared Interests', 'Age Range']
      },
      {
        id: `match-${profileId}-2`,
        score: 75 + (id % 15),
        compatibility_factors: ['Shared Interests', 'Location']
      }
    ],
    created_at: new Date(Date.now() - (id * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date().toISOString(),
    dataset_type: datasetType,
    _fallback: true,
    _message: `Using mock data for profile ${profileId} - backend unavailable`,
    timestamp: new Date().toISOString()
  };

  console.log(`Returning mock profile for ${profileId}`);
  return res.status(200).json(mockProfile);
}