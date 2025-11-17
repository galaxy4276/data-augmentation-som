// ULTRA SIMPLE TEST - No complex logic
export default async function handler(req, res) {
  console.log('=== SIMPLE TEST START ===');

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return res.status(200).json({
      message: 'Simple test works',
      method: req.method,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SIMPLE TEST ERROR:', error);
    return res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}