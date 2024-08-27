import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = "gpt-4"

export const analyzeCode = async (code: string, bugDescription: string, model: string = DEFAULT_MODEL) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes code and suggests bug locations." },
        { role: "user", content: `Analyze the following code and bug description, then suggest possible bug locations:\n\nCode:\n${code}\n\nBug Description: ${bugDescription}` }
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    if (!response.choices[0].message) {
      throw new Error('No response from OpenAI');
    }

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to analyze code with OpenAI');
  }
}

export const suggestFix = async (code: string, bugDescription: string, model: string = DEFAULT_MODEL) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful assistant that suggests fixes for code bugs." },
        { role: "user", content: `Given the following code and bug description, suggest a fix:\n\nCode:\n${code}\n\nBug Description: ${bugDescription}` }
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    if (!response.choices[0].message) {
      throw new Error('No response from OpenAI');
    }

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to suggest fix with OpenAI');
  }
}