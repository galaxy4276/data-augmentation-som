// SIMPLE VERSION - Individual dataset with query parameters
export default async function handler(req, res) {
  try {
    console.log('=== DEBUG: Dataset function started ===');
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
    const { datasetType } = req.query;

    console.log('DEBUG: Extracted params:', { datasetType });

    if (!datasetType) {
      return res.status(400).json({
        error: 'Dataset type is required as query parameter',
        example: '/api/datasets/dataset?datasetType=validation',
        debug: { datasetType }
      });
    }

    const response = {
      debug: {
        timestamp: new Date().toISOString(),
        datasetType,
        method: req.method,
        url: req.url,
        message: 'Individual dataset endpoint working'
      }
    };

    console.log('DEBUG: Dataset response sent');
    return res.status(200).json(response);

  } catch (error) {
    console.error('=== DEBUG: Dataset CATCH BLOCK ===');
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