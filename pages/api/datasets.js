// Vercel Serverless Function for /api/datasets (UNIFIED API) - v2.0
const BACKEND_URL = 'http://119.67.194.202:31332';

export default async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('=== UNIFIED DATASETS API ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    const { show, datasetType, page = 1, page_size = 50, gender, age_min, age_max, mbti, search, profileId } = req.query;

    // Handle different API operations based on 'show' parameter
    if (show === 'profiles') {
      return handleProfiles(req, res, { datasetType, page, page_size, gender, age_min, age_max, mbti, search, profileId });
    } else if (show === 'export') {
      return handleExport(req, res, { datasetType });
    } else {
      return handleDatasets(req, res);
    }

  } catch (error) {
    console.error('Error in unified datasets API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Handle datasets listing
function handleDatasets(req, res) {
  console.log('Handling datasets listing');

  const mockDatasets = [
    {
      id: "validation",
      name: "Validation Dataset",
      type: "validation",
      count: 1250,
      description: "Student profile validation data for model testing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "test",
      name: "Test Dataset",
      type: "test",
      count: 890,
      description: "Student profile test data for final evaluation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "learning",
      name: "Learning Dataset",
      type: "learning",
      count: 3450,
      description: "Student profile learning data for model training",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const response = {
    datasets: mockDatasets,
    total: mockDatasets.length,
    endpoint: 'datasets',
    timestamp: new Date().toISOString(),
    usage_examples: {
      profiles: '/api/datasets?show=profiles&datasetType=validation',
      export: '/api/datasets?show=export&datasetType=validation'
    }
  };

  console.log('Returning datasets response');
  return res.status(200).json(response);
}

// Handle profiles listing
async function handleProfiles(req, res, { datasetType, page, page_size, gender, age_min, age_max, mbti, search, profileId }) {
  console.log('Handling profiles for:', { datasetType, page, page_size, profileId });

  if (!datasetType) {
    return res.status(400).json({
      error: 'Dataset type is required for profiles',
      example: '/api/datasets?show=profiles&datasetType=validation',
      received_query: req.query
    });
  }

  try {
    // Try to get data from backend server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    // Build query string for backend request
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (gender) queryParams.append('gender', gender);
    if (age_min) queryParams.append('age_min', age_min.toString());
    if (age_max) queryParams.append('age_max', age_max.toString());
    if (mbti) queryParams.append('mbti', mbti);
    if (search) queryParams.append('search', search);

    const response = await fetch(`${BACKEND_URL}/api/datasets/${datasetType}/profiles?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`Backend responded successfully for ${datasetType} profiles`);
      const data = await response.json();

      const responseData = {
        items: data.items || [],
        total: data.total || 0,
        page: parseInt(page),
        page_size: parseInt(page_size),
        total_pages: Math.ceil((data.total || 0) / parseInt(page_size)),
        dataset_type: datasetType,
        endpoint: 'profiles',
        timestamp: new Date().toISOString()
      };

      console.log(`Returning ${responseData.items.length} profiles from backend for ${datasetType}`);
      return res.status(200).json(responseData);
    } else {
      console.log(`Backend failed with status ${response.status}, using mock data`);
    }
  } catch (error) {
    console.log(`Backend request failed: ${error.message}, using mock data`);
  }

  // Fallback to mock profiles if backend fails
  const mockProfiles = Array.from({ length: parseInt(page_size) }, (_, index) => {
    const profileIndex = (parseInt(page) - 1) * parseInt(page_size) + index + 1;
    const baseAge = datasetType === 'validation' ? 22 : datasetType === 'test' ? 23 : 21;
    const profileAge = baseAge + Math.floor(Math.random() * 8);

    return {
      id: `${datasetType}-${profileIndex}`,
      age: profileAge,
      gender: gender || (Math.random() > 0.5 ? 'MALE' : 'FEMALE'),
      mbti: mbti || ['INTJ', 'ENFP', 'ISTP', 'ESFJ', 'INFJ', 'ENTP'][Math.floor(Math.random() * 6)],
      bio: search ?
        `${datasetType} profile ${profileIndex} - ${search}` :
        `Sample ${datasetType} profile ${profileIndex}`,
      interests: ['Technology', 'Music', 'Travel', 'Reading', 'Sports', 'Art']
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 + Math.floor(Math.random() * 2)),
      created_at: new Date(Date.now() - (profileIndex * 60 * 60 * 1000)).toISOString(),
      updated_at: new Date().toISOString(),
      dataset_type: datasetType
    };
  });

  const totalCount = datasetType === 'validation' ? 1250 : datasetType === 'test' ? 890 : 3450;

  const response = {
    items: mockProfiles,
    total: totalCount,
    page: parseInt(page),
    page_size: parseInt(page_size),
    total_pages: Math.ceil(totalCount / parseInt(page_size)),
    dataset_type: datasetType,
    endpoint: 'profiles',
    timestamp: new Date().toISOString()
  };

  console.log(`Returning ${mockProfiles.length} mock profiles for ${datasetType}`);
  return res.status(200).json(response);
}

// Handle export functionality
async function handleExport(req, res, { datasetType }) {
  console.log('Handling export for:', datasetType);

  if (!datasetType) {
    return res.status(400).json({
      error: 'Dataset type is required for export',
      example: '/api/datasets?show=export&datasetType=validation',
      received_query: req.query
    });
  }

  try {
    // Try to get data from backend server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch(`${BACKEND_URL}/api/datasets/${datasetType}/export`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`Backend responded successfully for ${datasetType} export`);

      // Set appropriate headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${datasetType}-dataset.csv"`);

      // Stream the response from backend
      return response.body.pipe(res);
    } else {
      console.log(`Backend failed with status ${response.status}, using mock data`);
    }
  } catch (error) {
    console.log(`Backend request failed: ${error.message}, using mock data`);
  }

  // Fallback to mock CSV if backend fails
  const csvHeaders = 'id,age,gender,mbti,bio,interests,created_at,dataset_type\n';

  const mockRows = Array.from({ length: 5 }, (_, index) => {
    const profileIndex = index + 1;
    const baseAge = datasetType === 'validation' ? 25 : datasetType === 'test' ? 27 : 24;
    const age = baseAge + Math.floor(Math.random() * 5);
    const gender = profileIndex % 2 === 0 ? 'MALE' : 'FEMALE';
    const mbti = ['INTJ', 'ENFP', 'ISTP', 'ESFJ'][profileIndex % 4];

    return `${datasetType}-${profileIndex},${age},${gender},${mbti},"Sample ${datasetType} bio ${profileIndex}","Technology,Music,Travel",${new Date().toISOString()},${datasetType}\n`;
  }).join('');

  const mockCSV = csvHeaders + mockRows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${datasetType}-dataset.csv"`);

  console.log(`Returning mock CSV for ${datasetType}, size: ${mockCSV.length} bytes`);
  return res.status(200).send(mockCSV);
}