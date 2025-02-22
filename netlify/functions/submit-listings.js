// netlify/functions/submit-listings.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const newListing = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN;
  const owner = 'srahalh';
  const repo = 'astro-satoshi-directory';
  const filePath = 'data/listings.json';

  try {
    // Paso 1: Obtener el contenido actual del archivo (GET)
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

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch file: ${getResponse.status}`);
    }

    const fileData = await getResponse.json();
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    const currentData = JSON.parse(currentContent);

    // Paso 2: Agregar el nuevo listing al array
    currentData.listings.push(newListing);

    // Paso 3: Actualizar el archivo en el repositorio (PUT)
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
          message: `Add new listing: ${newListing.url}`,
          content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
          sha: fileData.sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update file: ${updateResponse.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update listing' }),
    };
  }
};