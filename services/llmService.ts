import axios from 'axios';
import { useRouter } from 'next/router';

export enum LLMRequestType {
  EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP = 'EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP',
  FIND_ENTRYPOINT_FILE = 'FIND_ENTRYPOINT_FILE',
  ANALYZE_BUG_WITH_CODE_AND_EVENTS = 'ANALYZE_BUG_WITH_CODE_AND_EVENTS', // Add this line
}

export function generatePrompt(type: LLMRequestType, content: string): string {
  switch (type) {
    case LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP:
      return `You will be modifying a Next.js app to track app UI events, navigation events, and error logs. Your task is to inject event tracking code into the provided entry point file (likely _app.js or similar) without breaking the existing React component structure. 

Key requirements:
1. Preserve the existing React component structure.
2. Only add event tracking logic, don't modify or remove existing code unless absolutely necessary.
3. Ensure all added code is within the React component or custom hooks.
4. Use React hooks (useState, useEffect, useCallback) for managing state and side effects.
5. The event tracking code should only run on the client-side.
6. Use window.parent.postMessage to send events to the parent app.
7. Import and use the useRouter hook from Next.js to access the router object.
8. Do not make assumptions on what objects are defined outside of the file and the instruction provided.

Here is the code to inject for event tracking:

\`\`\`javascript
import { useRouter } from 'next/router';

// Inside your component or custom hook:
const router = useRouter();

// Event tracking logic
const trackEvent = useCallback((eventType, details) => {
  if (typeof window !== 'undefined') {
    window.parent.postMessage(
      {
        type: 'UI_EVENT',
        payload: {
          eventDetails: {
            type: eventType,
            ...details,
          },
          currentPath: router.asPath,
        },
      },
      '*'
    );
  }
}, [router.asPath]);

useEffect(() => {
  if (typeof window === 'undefined') return;

  const handleUIEvent = (event) => {
    const target = event.target;
    trackEvent(event.type, {
      target: {
        tagName: target.tagName.toLowerCase(),
        id: target.id,
        className: target.className,
      },
    });
  };

  const handleRouteChange = (url) => {
    trackEvent('navigation', { details: 'Navigated to: ' + url });
  };

  const handleError = (...args) => {
    const errorMessage = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    trackEvent('error', { details: 'Error: ' + errorMessage });
  };

  document.addEventListener('click', handleUIEvent);
  document.addEventListener('input', handleUIEvent);
  document.addEventListener('change', handleUIEvent);
  router.events.on('routeChangeComplete', handleRouteChange);

  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    handleError(...args);
  };

  return () => {
    document.removeEventListener('click', handleUIEvent);
    document.removeEventListener('input', handleUIEvent);
    document.removeEventListener('change', handleUIEvent);
    router.events.off('routeChangeComplete', handleRouteChange);
    console.error = originalConsoleError;
  };
}, [trackEvent, router.events]);
\`\`\`

Here's the current content of the entry point file:

${content}

Please provide the updated entry point file's content that includes the necessary modifications for event tracking, navigation events, and error logging. Ensure that the existing React component structure is preserved and that the added code doesn't break the component's rendering. Make sure to import and use the useRouter hook correctly. Your response should follow this exact format:

<FILE_PATH>path/to/entrypoint/file.js</FILE_PATH>
<UPDATED_CONTENT>
// Updated file content goes here
</UPDATED_CONTENT>`;

    case LLMRequestType.FIND_ENTRYPOINT_FILE:
      return `Given the following simplified file structure of a Next.js app, please identify the most likely entry point file. The structure only includes directories and potential entry point files (those containing "index", "app", or "main" in their names):

${content}

Please respond with only the file path of the most likely entry point, enclosed in <FILE_PATH> tags. For example:
<FILE_PATH>pages/_app.js</FILE_PATH>`;

    case LLMRequestType.ANALYZE_BUG_WITH_CODE_AND_EVENTS:
      const { bugDescription, codeFiles, sessionEvents } = JSON.parse(content);
      return `Analyze the following bug description, code files, and user session events to provide a summarized update to the bug description in the style of a Jira ticket. Keep the description short and precise. Focus on helping engineering with their investigation by telling them where to focus their effort.

Bug Description:
${bugDescription}

Code Files:
${codeFiles.map(file => `--- ${file.path} ---\n${file.content}\n`).join('\n')}

User Session Events:
${JSON.stringify(sessionEvents, null, 2)}

Please provide an update to the bug description based on the relevant code and session events. Include the path to relevant files and small snippets of relevant code. Your response should follow this format:

<UPDATED_BUG_DESCRIPTION>
[Your updated bug description here in markdown format]
</UPDATED_BUG_DESCRIPTION>`;

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
