import { anthropicClient } from '../lib/anthropicApiClient';

export enum LLMRequestType {
  EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP = 'EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP',
  FIND_ENTRYPOINT_FILE = 'FIND_ENTRYPOINT_FILE',
}

export function generatePrompt(type: LLMRequestType, content: string): string {
  switch (type) {
    case LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP:
      return `You will be modifying a next.js app to track UI events. The app runs in an iframe and is responsible for posting the events back to the parent app using \`window.parent.postMessage\`. You can only update the provided entrypoint file's codes. Here's the current content:

${content}

Please provide the updated entrypoint file's content that includes the necessary modifications for event tracking. Your response should follow this exact format:

<FILE_PATH>path/to/entrypoint/file.js</FILE_PATH>
<UPDATED_CONTENT>
// Updated file content goes here
</UPDATED_CONTENT>`;

    case LLMRequestType.FIND_ENTRYPOINT_FILE:
      return `Given the following simplified file structure of a Next.js app, please identify the most likely entry point file. The structure only includes directories and potential entry point files (those containing "index", "app", or "main" in their names):

${content}

Please respond with only the file path of the most likely entry point, enclosed in <FILE_PATH> tags. For example:
<FILE_PATH>pages/_app.js</FILE_PATH>`;

    default:
      throw new Error(`Unsupported request type: ${type}`);
  }
}

export interface LLMService {
  sendRequest: (type: LLMRequestType, content: string) => Promise<string>;
}

export const createLLMService = (): LLMService => {
  return {
    sendRequest: async (type: LLMRequestType, content: string): Promise<string> => {
      try {
        console.log(`Sending ${type} request to LLM...`);
        const response = await anthropicClient.sendRequest(type, content);
        console.log(`Received response from LLM for ${type}:`, response);
        return response;
      } catch (error) {
        console.error('Error in LLM service:', error);
        throw error;
      }
    }
  };
};
