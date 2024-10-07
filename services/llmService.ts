import axios from 'axios';
import { useRouter } from 'next/router';

export enum LLMRequestType {
  EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP = 'EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP',
  FIND_ENTRYPOINT_FILE = 'FIND_ENTRYPOINT_FILE',
  ANALYZE_BUG_WITH_CODE_AND_EVENTS = 'ANALYZE_BUG_WITH_CODE_AND_EVENTS',
  STORY_ANALYSIS = 'STORY_ANALYSIS',
  IDENTIFY_RELEVANT_FILES = 'IDENTIFY_RELEVANT_FILES', // Add this line
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
    trackEvent('error', { details: '' + args });
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
      const { bugDescription, codeFiles, sessionEvents, fileStructure } = JSON.parse(content);
      // return `You are a tool that performs root cause analysis. You never give solutions, fixes, or suggestions on how to resolve the issue. You only help understand the issue by creating a comprehensive Mermaid diagram that follows the issue trail and relates it to the app architecture.
      return `You are a tool that performs analysis and provides solutions. You help understand the issue and solution by creating a comprehensive Mermaid diagram that follows the issue trail and solution and relates it to the app architecture.

Issue Description:
${bugDescription}

File Structure:
${fileStructure}

Potentially important Files:
${codeFiles.map((file: CodeFile) => `--- ${file.path} ---\n${file.content}\n`).join('\n')}

User Session Events:
${JSON.stringify(sessionEvents, null, 2)}

Your response should be a comprehensive Mermaid diagram that shows the root cause analysis in the form of a story that follows the issue trail and relates it to the app architecture.
Your response should also include an implementation section that shares the codes necessary to implement the solution. 
The diagram should be good enough to inform on when, where, why, and (in details) how the issue happened; in that order.
The diagram should use colors to highlight different parts.

When creating the Mermaid diagram, please follow these guidelines to ensure safe and error-free rendering:

1. Use single quotes (') instead of double quotes (") for text containing spaces or special characters.
2. For node IDs, use alphanumeric characters without spaces. For node text, enclose in square brackets [].
3. Avoid using special characters in node IDs or edge labels.
4. Stick to basic Mermaid syntax and avoid complex features that might not be universally supported.
5. Use subgraphs for grouping related nodes if necessary, but keep the syntax simple.
6. Limit the use of styling to basic fill and stroke colors.

Your response should only include the mermaid code and nothing else. Everything should be communicated through the diagram. Please format your response as follows:

<MERMAID>
graph TD
%% graph details go here
%% Use full sentences and plain English to name, detail, and explain the components/nodes/parts of the diagram
%% Remember to follow the safety guidelines mentioned above
</MERMAID>`;

    case LLMRequestType.STORY_ANALYSIS:
      return content; // The content is already formatted as a prompt in the storyChat.ts file

    case LLMRequestType.IDENTIFY_RELEVANT_FILES:
      return `
You are a tool that identifies relevant files for a root cause analysis.
Your task is to analyze the issue description and the file structure to determine which files are likely part of the issue trail.

<Issue Description>
${content}
</Issue Description>

<File Structure>
${content}
</File Structure>

Based on the issue description and the file structure, identify the files that are most likely relevant to the issue.
Output your response in the following JSON format:

{
  "relevantFiles": [
    {
      "path": "path/to/file1",
      "reason": "Brief explanation of why this file is relevant"
    },
    {
      "path": "path/to/file2",
      "reason": "Brief explanation of why this file is relevant"
    }
  ]
}

Limit your selection to the most relevant files (usually 3-5 files).
`;

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
