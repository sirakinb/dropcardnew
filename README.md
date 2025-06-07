# DropCard - AI-Powered Business Card App

## Setup Instructions

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

### OpenAI Vision API

This app uses OpenAI's GPT-4 Vision API for business card OCR. You'll need:

1. An OpenAI API account
2. A valid API key with Vision API access
3. The API key added to your `.env` file

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create your `.env` file with the API key
4. Start the development server: `npm start`

### Features

- **Business Card OCR**: AI-powered text extraction from business card images
- **QR Code Scanning**: Support for digital business card QR codes
- **Smart Field Mapping**: Automatically maps extracted fields to contact form
- **Intelligent Fallback**: Manual entry option if OCR fails
- **Comprehensive Data Extraction**: Name, title, company, email, phone, website, address, social links, and more
