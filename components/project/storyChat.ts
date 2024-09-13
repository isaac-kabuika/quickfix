import { useState, useCallback } from 'react';
import axios from 'axios';
import JSZip from 'jszip';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface CodeFile {
  path: string;
  content: string;
}

export function useStoryChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [mermaidGraph, setMermaidGraph] = useState<string | null>(null);

  const uploadZip = useCallback(async (file: File) => {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const files: CodeFile[] = [];

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async('string');
        files.push({ path, content });
      }
    }

    setCodeFiles(files);
  }, []);

  const selectFiles = useCallback((selectedPaths: string[]) => {
    setCodeFiles(prevFiles => prevFiles.filter(file => selectedPaths.includes(file.path)));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const fileStructure = codeFiles.map(file => file.path).join('\n');
      const codeContent = codeFiles.map(file => `--- ${file.path} ---\n${file.content}`).join('\n\n');

      const prompt = `You are a tool that performs root cause analysis. You help understand the issue by creating a comprehensive Mermaid diagram that follows the issue trail and relates it to the app architecture, and by providing a detailed root-cause story.

Issue Description:
${content}

File Structure:
${fileStructure}

Potentially important Files:
${codeContent}

Your response should include two parts:
1. A comprehensive Mermaid diagram that shows the root cause analysis in the form of a story that follows the issue trail and relates it to the app architecture.
2. A detailed, well-structured root-cause story that explains the issue, its origin, and how it manifests in the application, in a quick-read format. Format this story in Markdown, using the following guidelines:
   - Use headers (##, ###) to separate main sections
   - Use bullet points or numbered lists for step-by-step explanations
   - Use code blocks (\`\`\`) for any code snippets or file paths
   - Use bold and italic text for emphasis
   - Use blockquotes (>) for important notes or summaries
   - Use horizontal rules (---) to separate major sections if needed

For the Mermaid diagram, please follow these guidelines:
1. Use single quotes (') instead of double quotes (") for text containing spaces or special characters.
2. For node IDs, use alphanumeric characters without spaces. For node text, enclose in square brackets [].
3. Avoid using special characters in node IDs or edge labels.
4. Stick to basic Mermaid syntax and avoid complex features that might not be universally supported.
5. Use subgraphs for grouping related nodes if necessary, but keep the syntax simple.
6. Limit the use of styling to basic fill and stroke colors.
7. Sanitize the names in the mermaid diagram to remove/replace special characters like parentheses, brackets, etc.

Please format your response as follows:

<MERMAID>
graph TD
%% Mermaid diagram details go here
</MERMAID>

<ROOT_CAUSE_STORY>
Detailed root-cause story in rich Markdown format goes here...
</ROOT_CAUSE_STORY>`;

      const response = await axios.post('/api/llm', { type: 'STORY_ANALYSIS', content: prompt });
      const result = response.data.result;

      const mermaidMatch = result.match(/<MERMAID>([\s\S]*?)<\/MERMAID>/);
      const storyMatch = result.match(/<ROOT_CAUSE_STORY>([\s\S]*?)<\/ROOT_CAUSE_STORY>/);

      if (mermaidMatch) {
        setMermaidGraph(mermaidMatch[1].trim());
      }

      if (storyMatch) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: storyMatch[1].trim(),
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message to LLM:', error);
    } finally {
      setIsLoading(false);
    }
  }, [codeFiles]);

  return { messages, sendMessage, isLoading, uploadZip, selectFiles, mermaidGraph };
}