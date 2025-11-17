// Vercel Serverless Function for /api/augment/preferences
const BACKEND_URL = 'http://119.67.194.202:31332';
const axios = require('axios');

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
    console.log(`Attempting to POST to: ${BACKEND_URL}/api/augment/preferences`);
    console.log('Request body:', req.body);

    const response = await axios.post(`${BACKEND_URL}/api/augment/preferences`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function',
      },
      timeout: 10000, // 10 second timeout for preference generation
    });

    console.log(`Backend response status: ${response.status}`);
    console.log('Backend response data:', response.data);
    res.status(200).json(response.data);
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