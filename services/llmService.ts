import axios from 'axios';

export enum LLMRequestType {
  EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP = 'EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP',
  FIND_ENTRYPOINT_FILE = 'FIND_ENTRYPOINT_FILE',
}

export function generatePrompt(type: LLMRequestType, content: string): string {
  switch (type) {
    case LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP:
      return `You will be modifying a next.js app to track app UI events with details that include the element with selectors, the event details, the current path, and a copy of the rendered html page as text. Note that your code should be safe to avoid errors. The app runs in an iframe and is responsible for posting the events back to the parent app using \`window.parent.postMessage\`. You can only update the provided entrypoint file's codes. 
      Here is the code to retrofit and inject:
      <code-to-retrofit>
      // Attach event listener for UI events
    const handleUIEvent = (event: Event) => {
      const target = event.target as HTMLElement
      const eventDetails = {
        type: event.type,
        target: {
          tagName: target.tagName.toLowerCase(),
          id: target.id,
          className: target.className,
        },
      }
      const currentPath = router.asPath
      const pageHTML = document.documentElement.innerHTML

      // Post the event details to the parent window
      window.parent.postMessage(
        {
          type: 'UI_EVENT',
          payload: {
            eventDetails,
            currentPath,
            pageHTML,
          },
        },
        '*'
      )
    }

    // Attach event listener to the document
    document.addEventListener('click', handleUIEvent)
    document.addEventListener('input', handleUIEvent)
    document.addEventListener('change', handleUIEvent)

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('click', handleUIEvent)
      document.removeEventListener('input', handleUIEvent)
      document.removeEventListener('change', handleUIEvent)
    }
      </code-to-retrofit>
      Here's the current content:

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
        const response = await boltLlmApiClient.sendRequest(type, content);
        console.log(`Received response from LLM for ${type}:`, response);
        return response;
      } catch (error) {
        console.error('Error in LLM service:', error);
        throw error;
      }
    }
  };
};

/** Bolt is our app's new name. */
const boltLlmApiAxios = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Bolt is our app's new name. */
export const boltLlmApiClient = {
  sendRequest: async (type: LLMRequestType, content: string): Promise<string> => {
    try {
      console.log(`Sending request to Anthropic API for ${type}...`);
      const response = await boltLlmApiAxios.post('/llm', { type, content });
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
