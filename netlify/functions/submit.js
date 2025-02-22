const { Octokit } = require('@octokit/rest');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const newListing = JSON.parse(event.body);

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'srahalh';
  const repo = 'astro-satoshi-directory';
  const filePath = 'data/listings.json';

  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
    const currentData = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    currentData.listings.push(newListing);

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Add new listing: ${newListing.url}`,
      content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
      sha: data.sha,
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed' }) };
  }
};