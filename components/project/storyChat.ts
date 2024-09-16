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

const LLM_PIPELINE = [
  {
    type: 'IDENTIFY_RELEVANT_FILES',
    getPrompt: (content: string, fileStructure: string) => `
You are a tool that identifies relevant files for a root cause analysis.
Your task is to analyze the issue description and the file structure to determine which files are likely part of the issue trail.

<Issue Description>
${content}
</Issue Description>

<File Structure>
${fileStructure}
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
`,
    parseResponse: (result: string) => {
      try {
        const jsonResult = JSON.parse(result);
        return {
          relevantFiles: jsonResult.relevantFiles,
        };
      } catch (error) {
        console.error('Error parsing IDENTIFY_RELEVANT_FILES response:', error);
        return { relevantFiles: [] };
      }
    },
  },
  {
    type: 'STORY_ANALYSIS',
    getPrompt: (content: string, fileStructure: string, codeContent: Record<string, string>, relevantFiles: any[]) => `
You are a tool that performs root cause analysis.
Your first step is to understand how the codebase implements the product: use the file structure and the files to create a mental model of the product.
Your second step is to undestand the issue: (1) what happened, (2) where in the codebase, (3) what caused it. This should strictly be based on the issue description.
Your third step is to find potential issues in the codebase that could surface in the product as described in the Issue Description: be strict.
Your fourth step is to isolate the most likely of those issues based on details from the issue descsription, or communicate that none was found otherwise.
You never provide workarounds, solutions, or suggestions.
Your goal is to show when, where, how, and why the issue happens - in that order. You output a comprehensive Mermaid diagram and a short story to achieve that.
You never include html tags (e.g., <br/>) anywhere in your output, replace with a simple space.

<Issue Description>
${content}
</Issue Description>

<File Structure>
${fileStructure}
</File Structure>

<Relevant Files>
${relevantFiles.map(file => `--- ${file.path} ---\n${codeContent[file.path] || 'File content not available'}`).join('\n\n')}
</Relevant Files>

Your response should include two parts:
1. A comprehensive Mermaid diagram that highlights where the issue happens using colors.
2. A detailed, well-structured root-cause story in a quick-read format, with no more than 200 words. Format this story in Markdown, using the following guidelines:
   - Use headers (##, ###) to separate main sections
   - Use bullet points or numbered lists for step-by-step explanations
   - Use code blocks (\`\`\`) for any code snippets or file paths
   - Use bold and italic text for emphasis
   - Use blockquotes (>) for important notes or summaries
   - Use horizontal rules (---) to separate major sections if needed

For the Mermaid diagram, please follow these guidelines:
1. Use double quotes (") for all node names to protect from special characters. Make sure that there are no nested double quotes: e.g., A-->|"some "good" action"|B["my "node name" "] should become A-->|"some 'good' action"|["my 'node name'"].
2. For node IDs, use alphanumeric characters without spaces. For node text, enclose in square brackets [].
3. Avoid using special characters in node IDs or edge labels.
4. Stick to basic Mermaid syntax and avoid complex features that might not be universally supported.
5. The statements should look like: A["A name"] or A-->|"action"|B["B name"]
6. The syntax  A-->|"1. action"|B["B name"] should become A-->|"(1) action"|B["B name"] for any number.
7. Node names should be defined using only square brackets: e.g., A["Node name"]
8. Use subgraphs for grouping related nodes if necessary, but keep the syntax simple.
9. Never use 'end' at the end of the graph, ('end' is only for subgraph).
10. Make sure that Subgraph titles don't conflict with node titles.

Please format your response as follows:

<MERMAID>
graph TD
%% Mermaid diagram details go here
</MERMAID>

<ROOT_CAUSE_STORY>
Detailed root-cause story in rich Markdown format goes here...
</ROOT_CAUSE_STORY>
    `,
    parseResponse: (result: string) => {
      const mermaidMatch = result.match(/<MERMAID>([\s\S]*?)<\/MERMAID>/);
      const mermaidGraph = mermaidMatch ? mermaidMatch[1].trim() : null;
      const sanitizedMermaidGraph = mermaidGraph?.split('<br>').join(' ').split('<br/>').join(' ');
      const storyMatch = result.match(/<ROOT_CAUSE_STORY>([\s\S]*?)<\/ROOT_CAUSE_STORY>/);
      return {
        mermaidGraph: sanitizedMermaidGraph,
        story: storyMatch ? storyMatch[1].trim() : null,
      };
    },
  },
];

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
      const codeContent = Object.fromEntries(codeFiles.map(file => [file.path, file.content]));

      let pipelineResult = { content, fileStructure, codeContent, relevantFiles: [] };

      for (const step of LLM_PIPELINE) {
        const prompt = step.type === 'IDENTIFY_RELEVANT_FILES'
          ? step.getPrompt(pipelineResult.content, pipelineResult.fileStructure)
          : step.getPrompt(pipelineResult.content, pipelineResult.fileStructure, pipelineResult.codeContent, pipelineResult.relevantFiles);
        console.log("%%%%%:", prompt);
        const response = await axios.post('/api/llm', { type: step.type, content: prompt });
        const result = response.data.result;
        const parsedResult = step.parseResponse(result);
        pipelineResult = { ...pipelineResult, ...parsedResult };

        if (parsedResult.mermaidGraph) {
          setMermaidGraph(parsedResult.mermaidGraph);
        }

        if (parsedResult.story) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: parsedResult.story,
          };
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error in LLM pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, [codeFiles]);

  return { messages, sendMessage, isLoading, uploadZip, selectFiles, mermaidGraph };
}