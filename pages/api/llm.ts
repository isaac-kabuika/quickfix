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
            case(LLMRequestType.FIND_ENTRYPOINT_FILE):{
                const result = SIMULATED_LLM_RESPONSE_DATA[LLMRequestType.FIND_ENTRYPOINT_FILE]
                res.status(200).json({result})
                break
            }
            case(LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP):{
                const result = SIMULATED_LLM_RESPONSE_DATA[LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP]
                res.status(200).json({result})
                break
            }
            case(LLMRequestType.ANALYZE_BUG_WITH_CODE_AND_EVENTS):{
                const result = SIMULATED_LLM_RESPONSE_DATA[LLMRequestType.ANALYZE_BUG_WITH_CODE_AND_EVENTS]
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
    
    res.status(500).json({ message: 'Error calling Anthropic API', error: error.message })
  }
}

const SIMULATED_LLM_RESPONSE_DATA = {
    [LLMRequestType.FIND_ENTRYPOINT_FILE]:'<FILE_PATH>pages/_app.tsx</FILE_PATH>',
    [LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP]:`<FILE_PATH>pages/_app.js</FILE_PATH>
<UPDATED_CONTENT>
import { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/navigation/Navbar'
import Sidebar from '../components/navigation/Sidebar'
import { useAuth } from '../store/hooks/useAuth'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import { useRouter } from 'next/router';

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a loading state or nothing on the server
  if (!mounted || loading) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {user && <Sidebar />}
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow bg-white dark:bg-gray-900">
          {children}
        </main>
        <footer className="bg-background-light dark:bg-background-dark py-4 text-center text-gray-400">
          © 2024 QuickFix AI. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
      trackEvent('error', { details: '' + args[0] });
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

  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp
</UPDATED_CONTENT>`,
[LLMRequestType.ANALYZE_BUG_WITH_CODE_AND_EVENTS]:`<UPDATED_BUG_DESCRIPTION>
The "Page not found" error is occurring when clicking the "How It Works" link on the home page (\`/pages/index.tsx\`). The following code snippet is responsible for rendering the "How It Works" link:

\`\`\`jsx
<Link href="/how-it-works" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
  How It Works
</Link>
\`\`\`

However, there is no corresponding page for the \`/how-it-works\` route in the codebase, which is causing the 404 error.

To fix this issue, either:

1. Create a new page component at \`/pages/how-it-works.tsx\` to handle the "/how-it-works" route, or
2. Update the \`href\` prop in the \`Link\` component to point to an existing page.

Additionally, there seems to be an unhandled error being logged in the console, which could be related to this issue or another issue in the application. The error message is not very descriptive, so further investigation may be required to determine the root cause.
</UPDATED_BUG_DESCRIPTION>`,

}