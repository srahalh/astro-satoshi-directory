exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  console.log('Received event:', event.body);
  const newListing = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN;
  const validateListing = (listing) => {
    const requiredFields = ['title', 'description', 'url'];
    for (const field of requiredFields) {
      if (!listing[field]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }
    
    try {
      new URL(listing.url);
    } catch {
      throw new Error('Invalid URL format');
    }
    
    if (listing.title.length > 100) throw new Error('Title too long');
    if (listing.description.length > 500) throw new Error('Description too long');
    
    return true;
  };
  
  const RATE_LIMIT_WINDOW = 3600000; // 1 hour
  const MAX_REQUESTS = 10;
  const requestLog = new Map();
  
  const checkRateLimit = (ip) => {
    const now = Date.now();
    const userRequests = requestLog.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      throw new Error('Limit of requests exceeded');
    }
    
    recentRequests.push(now);
    requestLog.set(ip, recentRequests);
  };
  
  exports.handler = async (event, context) => {
    try {
      if (event.httpMethod !== 'POST') {
        return {
          statusCode: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      }
  
      try {
        checkRateLimit(event.headers['client-ip']);
      } catch (error) {
        return {
          statusCode: 429,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'To much request' })
        };
      }
  
      let newListing;
      try {
        newListing = JSON.parse(event.body);
        validateListing(newListing);
      } catch (error) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: error.message })
        };
      }
  
      const token = process.env.GITHUB_TOKEN;
      const owner = process.env.GITHUB_OWNER;
      const repo = process.env.GITHUB_REPO;
      const filePath = process.env.GITHUB_FILE_PATH;
  
      if (!token || !owner || !repo || !filePath) {
        throw new Error('Configuration incomplete');
      }
  
      const githubHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };
  
      console.log('Recovering the most recent file...');
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          method: 'GET',
          headers: githubHeaders,
        }
      );
  
      let currentData = { listings: [] };
      let sha = null;
  
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
        sha = fileData.sha;
        console.log('File created successfully');
      } else if (getResponse.status === 404) {
        console.log('File not found, creating a new one...');
      } else {
        throw new Error(`Fail to get the file: ${getResponse.status}`);
      }
  
      currentData.listings.push({
        ...newListing,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
      });
  
      console.log('Actualizando archivo...');
      const updateResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: githubHeaders,
          body: JSON.stringify({
            message: `Add new listing: ${newListing.title}`,
            content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
            sha: sha,
          }),
        }
      );
  
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Fail to update the file: ${updateResponse.status} - ${errorText}`);
      }
  
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Listado creado exitosamente',
          id: newListing.id 
        })
      };
  
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Error del servidor',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      };
    }
  };

  try {
    console.log('Fetching current file...');
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    let currentData = { listings: [] };
    let sha = null;

    if (getResponse.ok) {
      const fileData = await getResponse.json();
      currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
      sha = fileData.sha;
      console.log('File fetched successfully:', currentData);
    } else if (getResponse.status === 404) {
      console.log('File not found, will create a new one...');
    } else {
      throw new Error(`Failed to fetch file: ${getResponse.status}`);
    }

    currentData.listings.push(newListing);
    console.log('Updated data:', currentData);

    console.log('Updating file in GitHub...');
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: `Add new listing: ${newListing.title}`,
          content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
          sha: sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update file: ${updateResponse.status} - ${errorText}`);
    }

    console.log('File updated successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update listing' }),
    };
  }
};