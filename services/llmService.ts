import { useAuth } from '../store/hooks/useAuth';
import { anthropicClient, LLMRequestType } from '../lib/anthropicApiClient';

export const useLLMService = () => {
  const { user } = useAuth();

  const sendRequest = async (type: LLMRequestType, content: string) => {
    if (!user) {
      throw new Error('User must be authenticated to use LLM service');
    }

    try {
      const response = await anthropicClient.sendRequest(type, content);
      return response;
    } catch (error) {
      console.error('Error sending request to LLM:', error);
      throw error;
    }
  };

  return { sendRequest };
};
