import type { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosError } from 'axios'
import { LLMRequestType, generatePrompt } from '../../services/llmService'

const SHOULD_SIMULATE_LLM_QUERIES = process.env.SHOULD_SIMULATE_LLM_QUERIES === 'true';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_VERSION = '2023-06-01' // Add this line

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { type, content } = req.body

  if (!type || !content) {
    return res.status(400).json({ message: 'Type and content are required' })
  }

  try {
    const prompt = generatePrompt(type as LLMRequestType, content);
    
    // Log the request to the LLM
    console.log('LLM Request:', {
      type,
      prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : '') // Truncate long prompts
    });

    if(SHOULD_SIMULATE_LLM_QUERIES){
        switch(type){
            case(LLMRequestType.IDENTIFY_RELEVANT_FILES):{
                const result = SIMULATED_LLM_RESPONSE_DATA[LLMRequestType.IDENTIFY_RELEVANT_FILES]
                res.status(200).json({result})
                break
            }
            case(LLMRequestType.STORY_ANALYSIS):{
                const result = SIMULATED_LLM_RESPONSE_DATA[LLMRequestType.STORY_ANALYSIS]
                res.status(200).json({result})
                break
            }
            default:
                res.status(500).json({
                     message: 'Error calling Anthropic API',
                    error:'request type not recognized for simulated LLM response'
                })
        }
    } else {
        const response = await axios.post(
            ANTHROPIC_API_URL,
            {
                model: 'claude-3-sonnet-20240229',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
            },
            {
                headers: {
                'Content-Type': 'application/json',
                'X-API-Key': ANTHROPIC_API_KEY,
                'anthropic-version': ANTHROPIC_VERSION, // Add this line
                },
            }
        )

        const responseText = response.data.content[0].text
        
        // Log the response from the LLM
        console.log('LLM Response:', {
        responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '') // Truncate long responses
        });

        const match = responseText.match(/<index-code>([\s\S]*?)<\/index-code>/)
        const result = match ? match[1].trim() : responseText

        res.status(200).json({ result })
    }
  } catch (error) {
    console.error('Error calling Anthropic API:', error)
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
      })
      
      // Log the request details (be careful not to log sensitive information)
      console.error('Request details:', {
        url: ANTHROPIC_API_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'REDACTED',
          'anthropic-version': ANTHROPIC_VERSION,
        },
        data: {
          model: 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: 'REDACTED' }],
          max_tokens: 2000,
        },
      })
    }
    
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error calling Anthropic API', error: error.message })
    } else {
      res.status(500).json({ message: 'Error calling Anthropic API', error: 'An unknown error occurred' })
    }
  }
}

const SIMULATED_LLM_RESPONSE_DATA = {
[LLMRequestType.IDENTIFY_RELEVANT_FILES]: `{
  "relevantFiles": [
    {
      "path": "quickfix-main/pages/projects/[projectId]/story.tsx",
      "reason": "This file likely contains the code for rendering the 'story' page where the issue occurs."
    },
    {
      "path": "quickfix-main/services/projectService.ts",
      "reason": "This service is likely responsible for fetching project data, which is failing according to the error message."
    },
    {
      "path": "quickfix-main/services/authService.ts",
      "reason": "The issue is temporarily fixed by signing out and back in, which suggests the authentication service may be involved."
    },
    {
      "path": "quickfix-main/components/auth/ProtectedRoute.tsx",
      "reason": "This component may be responsible for handling authentication and preventing unauthorized access to certain routes or pages."
    }
  ]
}
`,

[LLMRequestType.STORY_ANALYSIS]: `<MERMAID>
graph TD
  Start["Start"]
  Open["User opens '/projects/[projectId]/story' page"]

  subgraph Client["Client-side"]
    UseAuthHook["useAuth hook fires"]
    CheckUser{"User authenticated?"}
    CheckUser-->|Yes|RenderApp["Render app with ProjectPage component"]
    UseProjectHook["useProject hook gets project data"]
    CheckProjectData{"Project data loaded?"}
    RenderApp-->UseProjectHook
    UseProjectHook-->CheckProjectData
    CheckProjectData-->|No, Data Failed to Load|ProjectLoadError["'Failed to fetch project data' message shown"]
    CheckProjectData-->|Yes|RenderProperPage
  end

  subgraph Server["Server-side"]
    AuthService["Services/authService.ts User data fetched from Supabase"]
    ProjectService["Services/projectService.ts Project data fetched from Supabase Uses GitHub API with user's token"]
    UseAuthHook-->AuthService
    UseProjectHook-->ProjectService
  end

  Start-->Open
  Open-->UseAuthHook
  AuthService-->CheckUser
  ProjectLoadError-->|"Workaround: User signs out and back in"|Open
</MERMAID>

<ROOT_CAUSE_STORY>
## Root Cause Analysis

When a user attempts to open the \`/projects/[projectId]/story\` page, the following happens:

1. The client-side \`useAuth\` hook fires to check if the user is authenticated.
2. If the user is authenticated, the \`ProjectPage\` component is rendered, which triggers the \`useProject\` hook.
3. The \`useProject\` hook calls the \`projectService.ts\` to fetch the project data from Supabase.
   - The \`projectService\` also fetches data from the GitHub API using the user's GitHub access token.
4. If the project data fails to load for any reason, a \`"Failed to fetch project data"\` message is shown instead of the actual page content.

### Temporary Workaround
> The issue can be temporarily resolved by signing out and back in, which likely refreshes the user's GitHub access token or authentication session.

To permanently fix this issue, the following potential causes should be investigated:

- **Expired/Invalid GitHub Access Token**: The user's GitHub access token may have expired or become invalid, causing the \`projectService\` to fail when fetching data from the GitHub API.
- **Firewall/Network Issues**: Network or firewall issues could be preventing the client from successfully communicating with the Supabase or GitHub APIs.
- **Supabase Data Inconsistencies**: If the project data stored in Supabase is incomplete or inconsistent, it could lead to errors when fetching or processing the data.
- **Authentication Session Issues**: Problems with the user's authentication session could prevent the client from correctly fetching user-specific data like the GitHub access token.

Addressing the root cause of the issue, whether it's related to authentication, networking, or data consistency, should resolve the problem and prevent the "Failed to fetch project data" message from appearing.
</ROOT_CAUSE_STORY>
`
}