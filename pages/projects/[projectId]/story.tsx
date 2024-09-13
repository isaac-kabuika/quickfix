import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import { useProject } from '../../../store/hooks/useProject'

function StoryPage() {
    const router = useRouter()
    const { projectId } = router.query
    const { user } = useAuth()
    const { project, loading: projectLoading, error: projectError } = useProject(projectId as string)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [collectedData, setCollectedData] = useState({
        codebase: false,
        logs: false,
    })
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [message])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    if (projectLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (projectError) return <div className="text-center text-red-500">{projectError}</div>
    if (!project) return <div className="text-center">Project not found</div>

    return (
        <div className="flex flex-col h-full">
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
                            {/* Updated placeholder text */}
                            <p className="text-gray-500 dark:text-gray-400">What's wrong with the user experience?</p>
                        </div>
                        {/* Chat input bar */}
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                            <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden">
                                <div className="flex items-center space-x-2 p-2">
                                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={message}
                                    onChange={handleInputChange}
                                    placeholder="Describe the issue..."
                                    className="flex-grow bg-transparent px-4 py-2 focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 resize-none min-h-[40px] max-h-[200px] overflow-y-auto border-none my-auto"
                                />
                                <div className="flex items-center space-x-2 p-2">
                                    <button className="bg-gray-800 dark:bg-gray-600 text-white p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors flex items-center justify-center w-8 h-8">
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
                        </div>
                    </div>

                    {/* Right column: Collected Data */}
                    <div className="w-[15%] p-4">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Collected Data</h2>
                        <div className="space-y-2">
                            <DataChip 
                                label="Codebase" 
                                isCollected={collectedData.codebase} 
                            />
                            <DataChip 
                                label="Logs" 
                                isCollected={collectedData.logs} 
                            />
                        </div>
                    </div>
                </div>
            </div>
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