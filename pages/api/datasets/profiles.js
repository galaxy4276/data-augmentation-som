// SIMPLE VERSION - Use query parameters instead of dynamic routing
export default async function handler(req, res) {
  try {
    console.log('=== DEBUG: Profiles function started ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    // Basic CORS setup
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

    // Extract query parameters
    const { datasetType, page = 1, page_size = 50, gender, age_min, age_max, mbti, search } = req.query;

    console.log('DEBUG: Extracted params:', { datasetType, page, page_size, gender, age_min, age_max, mbti, search });

    if (!datasetType) {
      console.log('DEBUG: Missing datasetType parameter');
      return res.status(400).json({
        error: 'Dataset type is required as query parameter',
        example: '/api/datasets/profiles?datasetType=validation&page=1&page_size=50',
        debug: { datasetType, page, page_size }
      });
    }

    console.log('DEBUG: All validations passed');

    // Return simple response
    const response = {
      debug: {
        timestamp: new Date().toISOString(),
        datasetType,
        page: parseInt(page),
        page_size: parseInt(page_size),
        gender,
        age_min: age_min ? parseInt(age_min) : null,
        age_max: age_max ? parseInt(age_max) : null,
        mbti,
        search,
        method: req.method,
        url: req.url,
        message: 'Profiles endpoint working with query parameters'
      },
      filters: {
        dataset_type: datasetType,
        page: parseInt(page),
        page_size: parseInt(page_size),
        gender: gender || null,
        age_min: age_min ? parseInt(age_min) : null,
        age_max: age_max ? parseInt(age_max) : null,
        mbti: mbti || null,
        search: search || null
      }
    };

    console.log('DEBUG: Sending response');
    return res.status(200).json(response);

  } catch (error) {
    console.error('=== DEBUG: Profiles CATCH BLOCK ===');
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