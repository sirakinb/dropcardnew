/**
 * AI Service for OpenAI Integration
 * Handles business card OCR and follow-up message generation
 */

// ⚠️ SECURITY: API key should be stored in environment variables in production
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Extract business card information using OpenAI Vision API
 * @param {string} imageUri - Local file URI of the captured business card image
 * @returns {Promise<Object>} Extracted contact information
 */
export const extractBusinessCardInfo = async (imageUri) => {
  try {
    console.log('Starting OpenAI Vision OCR for business card...');
    
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);
    if (!base64Image) {
      throw new Error('Failed to convert image to base64');
    }

    const prompt = `
Please extract all contact information from this business card image and return it as a JSON object.

Include these fields if available (return empty string if not found):
- name: Full name of the person
- title: Job title/position
- company: Company/organization name
- email: Email address
- phone: Phone number (format as found)
- website: Website URL
- address: Physical address
- linkedin: LinkedIn profile URL
- twitter: Twitter handle or URL
- fax: Fax number
- mobile: Mobile phone if different from main phone
- department: Department or division
- notes: Any additional text or information

Return ONLY a valid JSON object, no other text or explanation.
`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for consistent extraction
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI Vision API Response:', data);

    const extractedText = data.choices[0]?.message?.content;
    if (!extractedText) {
      throw new Error('No content returned from OpenAI');
    }

    // Parse the JSON response
    let contactInfo;
    try {
      // Clean up the response in case there's extra text
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
      contactInfo = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', extractedText);
      // Fallback: create a basic structure with the raw text
      contactInfo = {
        name: 'Extracted Contact',
        notes: extractedText,
        raw: extractedText
      };
    }

    // Ensure required fields exist
    const processedInfo = {
      name: contactInfo.name || 'Unknown Contact',
      title: contactInfo.title || '',
      company: contactInfo.company || '',
      email: contactInfo.email || '',
      phone: contactInfo.phone || '',
      website: contactInfo.website || '',
      address: contactInfo.address || '',
      linkedin: contactInfo.linkedin || '',
      twitter: contactInfo.twitter || '',
      fax: contactInfo.fax || '',
      mobile: contactInfo.mobile || '',
      department: contactInfo.department || '',
      notes: contactInfo.notes || '',
      raw: extractedText
    };

    console.log('Successfully extracted business card info:', processedInfo);
    return processedInfo;

  } catch (error) {
    console.error('Error extracting business card info:', error);
    throw error;
  }
};

/**
 * Convert image URI to base64 string
 * @param {string} imageUri - Local file URI
 * @returns {Promise<string>} Base64 encoded image
 */
const convertImageToBase64 = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Generate AI follow-up message for a contact
 * @param {Object} contact - Contact information
 * @param {string} context - Additional context about the meeting
 * @param {string} tone - Desired tone (professional, casual, friendly)
 * @returns {Promise<string>} Generated follow-up message
 */
export const generateFollowUpMessage = async (contact, context = '', tone = 'professional') => {
  try {
    console.log('Generating follow-up message with OpenAI...');

    const toneInstructions = {
      professional: 'formal and business-appropriate',
      casual: 'relaxed and conversational',
      friendly: 'warm and approachable while maintaining professionalism'
    };

    const prompt = `
Generate a ${toneInstructions[tone]} follow-up message for this contact:

Contact Information:
- Name: ${contact.name}
- Title: ${contact.title || 'Not specified'}
- Company: ${contact.company || 'Not specified'}
- Context: ${context || 'Recently connected'}

Create a personalized follow-up message that:
1. References our recent meeting/connection
2. Mentions something specific about their role or company if available
3. Suggests a next step (meeting, call, or collaboration)
4. Keeps it concise (2-3 sentences max)
5. Sounds natural and human

Return only the message text, no quotes or additional formatting.
`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content?.trim();

    if (!message) {
      throw new Error('No message generated');
    }

    console.log('Successfully generated follow-up message');
    return message;

  } catch (error) {
    console.error('Error generating follow-up message:', error);
    throw error;
  }
};

export default {
  extractBusinessCardInfo,
  generateFollowUpMessage
}; 