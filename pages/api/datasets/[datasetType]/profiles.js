// MINIMAL DEBUG VERSION - Remove all complex logic to isolate 502 error
export default async function handler(req, res) {
  try {
    // Log basic request info
    console.log('=== DEBUG: Function started ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);
    console.log('Headers:', Object.keys(req.headers));

    // Basic CORS setup
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      console.log('DEBUG: Handling OPTIONS request');
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      console.log('DEBUG: Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('DEBUG: Processing GET request');

    // Extract parameters without any complex logic
    const { datasetType, page, page_size } = req.query;

    console.log('DEBUG: Extracted params:', { datasetType, page, page_size });

    if (!datasetType) {
      console.log('DEBUG: Missing datasetType');
      return res.status(400).json({
        error: 'Dataset type is required',
        debug: { datasetType, page, page_size }
      });
    }

    console.log('DEBUG: All validations passed');

    // Return simple response - no backend calls, no mock data
    const response = {
      debug: {
        timestamp: new Date().toISOString(),
        datasetType,
        page: page || 1,
        page_size: page_size || 50,
        method: req.method,
        url: req.url,
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL
      },
      message: 'Edge function is working - no backend calls made'
    };

    console.log('DEBUG: Sending response');
    return res.status(200).json(response);

  } catch (error) {
    console.error('=== DEBUG: CATCH BLOCK ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      error: 'Internal server error',
      debug: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    });
  }
}