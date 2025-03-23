# Bitcoin & Lightning Directory for Spain

## 📁 Project Structure

```plaintext
/
├── src/                    # Main source code
│   ├── components/         # Reusable components
│   ├── layouts/           # Astro layouts
│   ├── pages/             # Application pages
│   └── styles/            # Global CSS files
├── public/                # Static files
│   ├── images/            # Images
│   └── icons/            # Icons
├── data/                  # JSON listing data
├── netlify/               # Netlify configuration
│   └── functions/        # Serverless functions
```

⚠️ **Security Warning**
Before publishing any information, please be aware:
- Do not share private keys or credentials
- Only publish publicly available business information
- Get consent before listing any contact details
- Use public business contact methods instead of personal ones
- Regularly review published information for privacy concerns

## Overview

Open-source directory showcasing Bitcoin and Lightning Network services/businesses in Spain.

## Data Privacy Guidelines

When submitting listings:
- Only include publicly available business information
- Use official business contact methods
- Avoid personal phone numbers or emails
- Get explicit permission before listing any business
- Do not include private financial information

## Environment Setup

Required environment variables for Netlify:

```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name 
GITHUB_FILE_PATH=path/to/data/file.json
```

### Getting Environment Variables

1. **GITHUB_TOKEN**: 
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens
   - Generate token with `repo` permissions
   - Keep token secure

2. **GITHUB_OWNER**:
   - Your GitHub username

3. **GITHUB_REPO**:
   - Repository name

4. **GITHUB_FILE_PATH**:
   - Path to data file (e.g., `data/listings.json`)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment Steps

1. Fork repository
2. Connect fork to Netlify
3. Configure environment variables
4. Deploy!

## Security Best Practices

- Rotate GitHub tokens regularly
- Use environment variables for sensitive data
- Never commit sensitive information
- Regular security audits of published data
- Implement rate limiting
- Monitor suspicious activity

## Dependencies

```json
{
  "dependencies": {
    "@astrojs/netlify": "^3.0.4",
    "@astrojs/react": "^3.0.7",
    "@astrojs/tailwind": "^5.0.3",
    "astro": "^4.0.7",
    "react": "^18.2.0",
    "tailwindcss": "^3.4.0"
  }
}
```

## License

This project is open source under the MIT license. Feel free to use it for your own community!
