exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  console.log('Received event:', event.body);
  const newListing = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN;
  const owner = 'srahalh';
  const repo = 'astro-satoshi-directory';
  const filePath = 'src/data/listings.json';

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