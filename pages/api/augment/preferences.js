// Vercel Serverless Function for /api/augment/preferences
const BACKEND_URL = 'http://119.67.194.202:31332';

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
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/augment/preferences`);
    console.log('Request body:', req.body);

    const response = await fetch(`${BACKEND_URL}/api/augment/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
      body: JSON.stringify(req.body),
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
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

    // Fallback mock response
    const profileContext = req.body?.profile_context || {};
    const mockResponse = {
      preferences: {
        music_genres: ["Pop", "Rock", "Jazz", "Classical"].slice(0, 2),
        movie_genres: ["Action", "Comedy", "Drama", "Horror"].slice(0, 2),
        activities: ["Sports", "Reading", "Gaming", "Cooking"].slice(0, 3),
        social_media: ["Instagram", "Twitter", "Facebook"].slice(0, 2),
        food_preferences: ["Italian", "Chinese", "Japanese", "Mexican"].slice(0, 2)
      },
      generated_for: profileContext,
      generated_at: new Date().toISOString()
    };

    console.log('Returning fallback mock response due to error:', error.message);
    res.status(200).json(mockResponse);
  }
}