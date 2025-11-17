// SIMPLE VERSION - Individual profile with query parameters
export default async function handler(req, res) {
  try {
    console.log('=== DEBUG: Profile function started ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    // Basic CORS setup
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract query parameters
    const { datasetType, profileId } = req.query;

    console.log('DEBUG: Extracted params:', { datasetType, profileId });

    if (!datasetType || !profileId) {
      return res.status(400).json({
        error: 'Dataset type and profile ID are required as query parameters',
        example: '/api/datasets/profile?datasetType=validation&profileId=123',
        debug: { datasetType, profileId }
      });
    }

    const response = {
      debug: {
        timestamp: new Date().toISOString(),
        datasetType,
        profileId,
        method: req.method,
        url: req.url,
        message: 'Individual profile endpoint working'
      }
    };

    console.log('DEBUG: Profile response sent');
    return res.status(200).json(response);

  } catch (error) {
    console.error('=== DEBUG: Profile CATCH BLOCK ===');
    console.error('Error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      debug: {
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}