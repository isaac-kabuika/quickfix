import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import { useProject } from '../../../store/hooks/useProject'
import { useStoryChat, Message } from '../../../components/project/storyChat'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useDropzone } from 'react-dropzone'
import FileSelectionPopup from '../../../components/project/FileSelectionPopup'
import JSZip from 'jszip'
import dynamic from 'next/dynamic'
import mermaid from 'mermaid'
import LightningAnimation from '../../../components/LightningAnimation'

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        nodeSpacing: 50,
        rankSpacing: 100,
        curve: 'basis',
        htmlLabels: true,
      },
      fontSize: 16,
    });

    const renderChart = async () => {
      if (ref.current && typeof window !== 'undefined') {
        try {
          console.log(chart);
          const modifiedChart = chart.replace(/graph LR/, 'graph TD');
          const { svg } = await mermaid.render('mermaid-svg', modifiedChart);
          
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;
          
          const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number);
          if (viewBox) {
            const scale = 1.5;
            const newWidth = viewBox[2] * scale;
            const newHeight = viewBox[3] * scale;
            svgElement.setAttribute('width', `${newWidth}`);
            svgElement.setAttribute('height', `${newHeight}`);
            svgElement.setAttribute('style', `max-width: 100%; height: auto;`);
          }
          
          setSvg(svgElement.outerHTML);
        } catch (error) {
          console.error('Error rendering Mermaid chart:', error);
          setSvg('<p>Error rendering chart</p>');
        }
      }
    };
    renderChart();
  }, [chart]);

  return (
    <div 
      ref={ref} 
      dangerouslySetInnerHTML={{ __html: svg }} 
      className="mermaid-diagram"
    />
  );
};

function StoryPage() {
    const router = useRouter()
    const { projectId } = router.query
    const { user } = useAuth()
    const { project, loading: projectLoading, error: projectError } = useProject(projectId as string)
    const [error, setError] = useState('')
    const [collectedData, setCollectedData] = useState({
        codebase: false,
        logs: false,
    })
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { messages, sendMessage, isLoading, uploadZip, selectFiles, mermaidGraph } = useStoryChat()
    const [inputMessage, setInputMessage] = useState('')
    const [showFileSelectionPopup, setShowFileSelectionPopup] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [inputMessage])

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            await sendMessage(inputMessage.trim())
            setInputMessage('')
        }
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                await uploadZip(file)
                setCollectedData(prev => ({ ...prev, codebase: true }))
                const fileList = await getFileList(file)
                setUploadedFiles(fileList)
                setShowFileSelectionPopup(true)
            } else {
                setError('Please upload a valid zip file')
            }
        }
    }, [uploadZip])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/zip': ['.zip'] } })

    const getFileList = async (file: File): Promise<string[]> => {
        const zip = new JSZip()
        const contents = await zip.loadAsync(file)
        return Object.keys(contents.files).filter(path => !contents.files[path].dir)
    }

    const handleFileSelection = (selectedFiles: string[]) => {
        selectFiles(selectedFiles)
        setShowFileSelectionPopup(false)
    }

    if (projectLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (projectError) return <div className="text-center text-red-500">{projectError}</div>
    if (!project) return <div className="text-center">Project not found</div>

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-md flex items-center justify-between p-2 px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <Link href={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{project?.name} - Story</h1>
                </div>
                <a
                    href={project?.github_repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                </a>
            </div>

            {error && <p className="text-red-500 p-2 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">{error}</p>}

            <div className="flex-grow overflow-auto">
                <div className="flex h-full">
                    {/* Left column: Chat area */}
                    <div className="w-[45%] border-r border-gray-200 dark:border-gray-700 flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Story</h2>
                            {messages.map((message) => (
                                <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block p-2 rounded-lg ${
                                        message.role === 'user' 
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                                            : 'text-gray-800 dark:text-gray-200'
                                    }`}>
                                        <ReactMarkdown
                                            components={{
                                                code({node, inline, className, children, ...props}) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={tomorrow}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                                                hr: ({node, ...props}) => <hr className="my-4 border-t border-gray-300" {...props} />,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-center">
                                    <LightningAnimation />
                                </div>
                            )}
                        </div>
                        {/* Chat input bar */}
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                            <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Describe the issue..."
                                    className="flex-grow bg-transparent px-4 py-2 focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 resize-none min-h-[40px] max-h-[200px] overflow-y-auto border-none my-auto"
                                />
                                <div className="flex items-center space-x-2 p-2">
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isLoading}
                                        className="bg-gray-800 dark:bg-gray-600 text-white p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors flex items-center justify-center w-8 h-8 disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle column: Knowledge Graph */}
                    <div className="w-[40%] border-r border-gray-200 dark:border-gray-700 p-4">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Knowledge Graph</h2>
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 h-[calc(100%-2rem)] flex items-center justify-center">
                            {mermaidGraph && isClient ? (
                                <Mermaid chart={mermaidGraph} />
                            ) : (
                                <div className="text-center">
                                    <img 
                                        src="/images/ai-analysis.svg" 
                                        alt="AI Analysis" 
                                        className="w-24 h-24 mx-auto mb-4 opacity-30 dark:opacity-20"
                                    />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Knowledge Graph Yet</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        The knowledge graph will be generated as you provide more information about the issue.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column: Collected Data */}
                    <div className="w-[15%] p-4">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Collected Data</h2>
                        <div className="space-y-2">
                            <div {...getRootProps()} className="cursor-pointer">
                                <input {...getInputProps()} />
                                <DataChip 
                                    label="Codebase" 
                                    isCollected={collectedData.codebase} 
                                />
                            </div>
                            <DataChip 
                                label="Logs" 
                                isCollected={collectedData.logs} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showFileSelectionPopup && (
                <FileSelectionPopup
                    files={uploadedFiles}
                    onConfirm={handleFileSelection}
                    onCancel={() => setShowFileSelectionPopup(false)}
                />
            )}
        </div>
    )
}

interface DataChipProps {
    label: string;
    isCollected: boolean;
}

const DataChip: React.FC<DataChipProps> = ({ label, isCollected }) => (
    <div className={`flex items-center space-x-2 rounded-full px-3 py-1 text-sm shadow-sm w-full ${
        isCollected 
            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }`}>
        <div className={`w-4 h-4 flex items-center justify-center ${isCollected ? 'text-green-500' : 'text-gray-400'}`}>
            {isCollected ? (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            )}
        </div>
        <span>{label}</span>
    </div>
);

export default ProtectedRoute(StoryPage)