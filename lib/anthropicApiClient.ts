import axios from 'axios';
import { LLMRequestType } from '../services/llmService';

const anthropicAxios = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const anthropicClient = {
  sendRequest: async (type: LLMRequestType, content: string): Promise<string> => {
    try {
      console.log(`Sending request to Anthropic API for ${type}...`);
      const response = await anthropicAxios.post('/llm', { type, content });
      console.log(`Received response from Anthropic API for ${type}:`, response.data);
      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from Anthropic API');
      }
      return response.data.result;
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  },
};
