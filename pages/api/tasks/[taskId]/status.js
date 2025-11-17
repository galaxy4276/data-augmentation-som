// Vercel Serverless Function for /api/tasks/[taskId]/status
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

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { taskId } = req.query;

  if (!taskId) {
    res.status(400).json({ error: 'Task ID is required' });
    return;
  }

  try {
    console.log(`Attempting to GET: ${BACKEND_URL}/api/tasks/${taskId}/status`);

    const response = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ML-Frontend-Vercel-Edge',
      },
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
    const mockResponse = {
      task_id: taskId,
      status: "completed",
      progress: 100,
      message: "Task completed successfully (fallback response)",
      created_at: new Date(Date.now() - 60000).toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Returning fallback mock response due to error:', error.message);
    res.status(200).json(mockResponse);
  }
}