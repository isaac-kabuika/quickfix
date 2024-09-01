import type { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosError } from 'axios'
import { LLMRequestType, generatePrompt } from '../../services/llmService'

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