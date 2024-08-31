import axios from 'axios';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropicAxios = axios.create({
  baseURL: ANTHROPIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': ANTHROPIC_API_KEY,
  },
});

export enum LLMRequestType {
  EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP = 'EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP',
  // Add other request types here as needed
}

const generatePrompt = (type: LLMRequestType, content: string): string => {
  switch (type) {
    case LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP:
      return `You will be modifying a next.js app to track UI events. The app runs in an iframe and is responsible for posting the events back to the parent app using \`window.parent.postMessage\`. You can only update the provided index.tsx codes in the <index-code> tag. Here's the current content:

<index-code>
${content}
</index-code>

Please provide the updated index.tsx file content that includes the necessary modifications for event tracking.`;
    // Add cases for other request types here
    default:
      throw new Error(`Unsupported request type: ${type}`);
  }
};

export const anthropicClient = {
  sendRequest: async (type: LLMRequestType, content: string) => {
    try {
      const prompt = generatePrompt(type, content);
      const response = await anthropicAxios.post('', {
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      });
      
      // Extract the content between <index-code> tags
      const responseText = response.data.content[0].text;
      const match = responseText.match(/<index-code>([\s\S]*?)<\/index-code>/);
      return match ? match[1].trim() : responseText;
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  },
};
