import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { getBugReports, createBugReport, deleteBugReport, updateBugReport } from '../../services/bugReportService'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { WebContainerConsole } from '../../components/project/webContainerConsole'
import JSZip from 'jszip'
import { useProject } from '../../store/hooks/useProject'
import { useDropzone } from 'react-dropzone'
import { LightningBoltIcon } from '@heroicons/react/solid'
import { createLLMService, LLMService } from '../../services/llmService'

interface Project {
  id: string;
  name: string;
  github_repo: string;
  env: string;
}

interface Bug {
  id: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface RepoContent {
  name: string;
  path: string;
  type: string;
}

interface WebContainerStatus {
  status: string;
  isReady: boolean;
  isLoading: boolean;
  url?: string; // Add this line to store the WebContainer's URL
}

interface TerminalOutput {
  type: 'command' | 'output';
  content: string;
}

interface UIEvent {
  type: string;
  target: string;
  timestamp: number;
}

const LoadFilesAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full opacity-75"></div>
        <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full animate-ping" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}></div>
        <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s', animationIterationCount: 'infinite' }}></div>
        <div className="relative flex items-center justify-center w-full h-full">
          <svg 
            className="w-12 h-12 text-gray-600 dark:text-gray-300" 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Ready to Start
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
        Select your project ZIP file to begin the local process
      </p>
    </div>
  );
};

const CompilingAnimation = () => {
  const messages = [
    "Compiling your application...",
    "Optimizing code...",
    "Bundling modules...",
    "Almost there...",
    "Finalizing build..."
  ];
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full opacity-25 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="relative flex items-center justify-center w-full h-full">
          <svg 
            className="w-12 h-12 text-gray-600 dark:text-gray-300" 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M13 10V3L4 14H11V21L20 10H13Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <animate
                attributeName="stroke-dasharray"
                from="0 100"
                to="100 100"
                dur="1.5s"
                begin="0s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Compiling Application
      </p>
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs h-8 flex items-center justify-center">
        <div className="transition-opacity duration-500 max-w-xs h-8 flex items-center justify-center">
          <span className="transition-opacity duration-500">
            {messages[currentMessage]}
          </span>
        </div>
      </div>
    </div>
  );
};

interface UploadedFileDetailsProps {
  file: File;
  onStart: () => void;
}

const UploadedFileDetails: React.FC<UploadedFileDetailsProps> = ({ file, onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <div className="mb-6 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Start App Locally
      </button>
    </div>
  );
};

interface TaskChipProps {
  task: string;
  isDone: boolean;
  isAutomated?: boolean;
}

const TaskChip: React.FC<TaskChipProps> = ({ task, isDone, isAutomated = false }) => (
  <div className="flex items-center space-x-2 rounded-full px-3 py-1 text-sm shadow-sm w-fit bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
    {isAutomated ? (
      <LightningBoltIcon className={`w-4 h-4 ${isDone ? 'text-green-500' : 'text-gray-400'}`} />
    ) : (
      <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-500' : 'bg-gray-400'}`}></div>
    )}
    <span>{task}</span>
  </div>
);

interface BugDescriptionEditDropdownProps {
  bug: Bug;
  onSave: (description: string) => void;
  onClose: () => void;
}

const BugDescriptionEditDropdown: React.FC<BugDescriptionEditDropdownProps> = ({ bug, onSave, onClose }) => {
  const [description, setDescription] = useState(bug.description);

  return (
    <div className="absolute z-10 mt-2 w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Edit Bug Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 mb-2"
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(description)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

function ProjectPage() {
  const router = useRouter()
  const { projectId } = router.query
  const { user } = useAuth()
  const { project, loading: projectLoading, error: projectError, updateProject } = useProject(projectId as string)
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBugs, setFilteredBugs] = useState<Bug[]>([])
  const [isCreatingBug, setIsCreatingBug] = useState(false)
  const [showReportBugPopup, setShowReportBugPopup] = useState(false)
  const reportBugButtonRef = useRef<HTMLButtonElement>(null)
  const reportBugPopupRef = useRef<HTMLDivElement>(null)
  const [expandedBugId, setExpandedBugId] = useState<string | null>(null)
  const [editedBug, setEditedBug] = useState<Bug | null>(null)
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)
  const dataLoadedRef = useRef(false);
  const [repoContents, setRepoContents] = useState<RepoContent[]>([])
  const [loadingRepoContents, setLoadingRepoContents] = useState(false)
  const [webContainerStatus, setWebContainerStatus] = useState<WebContainerStatus>({ status: '', isReady: false, isLoading: false })
  const webContainerConsoleRef = useRef<WebContainerConsole | null>(null)
  const [uploadedZip, setUploadedZip] = useState<File | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([])
  const [activeTab, setActiveTab] = useState<'console' | 'ui' | 'events'>('ui')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const consoleRef = useRef<HTMLDivElement>(null)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [compilationStatus, setCompilationStatus] = useState<'not-started' | 'compiling' | 'ready'>('not-started');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullScreenContainerRef = useRef<HTMLDivElement>(null);
  const [editingBugId, setEditingBugId] = useState<string | null>(null);
  const [uiEvents, setUIEvents] = useState<UIEvent[]>([]);
  const [llmService, setLLMService] = useState<LLMService | null>(null);
  const [sessionEvents, setSessionEvents] = useState<UIEvent[]>([]);

  const loadProjectAndBugs = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string' || dataLoadedRef.current) return;
    setLoading(true);
    try {
      const bugsData = await getBugReports(projectId);
      setBugs(bugsData);
    } catch (err) {
      console.error('Failed to fetch bugs:', err);
      setError('Failed to load bug data');
    } finally {
      setLoading(false);
      dataLoadedRef.current = true;
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && typeof projectId === 'string' && user) {
      dataLoadedRef.current = false;
      loadProjectAndBugs();
    }
  }, [projectId, loadProjectAndBugs, user]);

  // Reset the dataLoadedRef when the component unmounts
  useEffect(() => {
    return () => {
      dataLoadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const filtered = bugs.filter((bug) => 
      bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredBugs(filtered)
  }, [searchTerm, bugs])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportBugPopupRef.current && !reportBugPopupRef.current.contains(event.target as Node) &&
          reportBugButtonRef.current && !reportBugButtonRef.current.contains(event.target as Node)) {
        setShowReportBugPopup(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleBugCreated = async (newBug: { description: string }) => {
    if (isCreatingBug || !user || !project) return
    setIsCreatingBug(true)

    try {
      const createdBug = await createBugReport(project.id, newBug.description, user.id)
      setBugs(currentBugs => [createdBug, ...currentBugs])
      setShowReportBugPopup(false)
    } catch (error) {
      console.error('Error creating bug:', error)
      setError('Failed to create bug: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsCreatingBug(false)
    }
  }

  const toggleBugSelection = (bugId: string, e?: React.MouseEvent) => {
    // If this was triggered by a radio button click, stop propagation
    if (e) {
      e.stopPropagation();
    }

    if (selectedBugId !== bugId) {
      if (selectedBugId) {
        // Prompt for confirmation before selecting a different bug
        if (confirm("Are you sure you want to select a different bug? Any unsaved changes will be lost.")) {
          setSelectedBugId(bugId);
          expandBugRow(bugId);
        }
      } else {
        setSelectedBugId(bugId);
        expandBugRow(bugId);
      }
    }
    // If clicking on the same bug, do nothing (don't unselect)
  }

  const expandBugRow = (bugId: string) => {
    setExpandedBugId(bugId)
    const selectedBug = bugs.find(bug => bug.id === bugId)
    setEditedBug(selectedBug || null)
    setSelectedBugId(bugId)
  }

  const handleSave = async () => {
    if (!editedBug) return
    try {
      const updatedBug = await updateBugReport(editedBug.id, editedBug)
      setBugs(currentBugs => currentBugs.map(bug => bug.id === updatedBug.id ? updatedBug : bug))
      setExpandedBugId(null)
      setEditedBug(null)
      setSelectedBugId(null)
    } catch (error) {
      console.error('Error updating bug:', error)
      setError('Failed to update bug')
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedBugId) return
    if (confirm('Are you sure you want to delete this bug?')) {
      try {
        await deleteBugReport(selectedBugId)
        setBugs(currentBugs => currentBugs.filter(bug => bug.id !== selectedBugId))
        setSelectedBugId(null)
        setExpandedBugId(null)
        setEditedBug(null)
      } catch (error) {
        console.error('Error deleting bug:', error)
        setError('Failed to delete bug')
      }
    }
  }

  const handleRowClick = (bugId: string) => {
    toggleBugSelection(bugId);
  }

  const handleCancel = () => {
    if (selectedBugId) {
      // Prompt for confirmation before unselecting
      if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
        setExpandedBugId(null);
        setEditedBug(null);
        setSelectedBugId(null);
        setUploadedZip(null);
        setWebContainerStatus({ status: '', isReady: false, isLoading: false });
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/zip') {
      setUploadedZip(file)
      setCompilationStatus('not-started');
      setWebContainerStatus({ status: '', isReady: false, isLoading: false });
    } else {
      setError('Please upload a valid zip file')
    }
  }

  const initWebContainer = useCallback(async (zipFile: File) => {
    resetWebContainerState();
    setWebContainerStatus(prev => ({ ...prev, status: 'starting', isLoading: true }));
    if (!webContainerConsoleRef.current && llmService) {
      webContainerConsoleRef.current = new WebContainerConsole((status) => {
        setWebContainerStatus(prev => ({ ...prev, status }))
        setTerminalOutput(prev => [...prev, { type: 'output', content: status }])
      }, llmService)
    }

    try {
      setTerminalOutput(prev => [...prev, { type: 'command', content: 'Initializing WebContainer...' }])
      await webContainerConsoleRef.current.init()
      
      setTerminalOutput(prev => [...prev, { type: 'command', content: 'Loading project files...' }])
      const zip = new JSZip()
      const contents = await zip.loadAsync(zipFile)
      const files: Record<string, any> = {}

      // Determine the root directory
      const rootDir = contents.files[Object.keys(contents.files)[0]].name.split('/')[0]

      for (const [path, file] of Object.entries(contents.files)) {
        if (!file.dir) {
          const content = await file.async('string')
          let relativePath = path.startsWith(rootDir) ? path.slice(rootDir.length + 1) : path
          
          // Ensure the path doesn't start with a slash
          relativePath = relativePath.replace(/^\//, '')

          // Skip files with empty names
          if (relativePath === '') continue

          // Create nested structure
          const pathParts = relativePath.split('/')
          let currentLevel = files
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!currentLevel[pathParts[i]]) {
              currentLevel[pathParts[i]] = { directory: {} }
            }
            currentLevel = currentLevel[pathParts[i]].directory
          }
          currentLevel[pathParts[pathParts.length - 1]] = { file: { contents: content } }
        }
      }

      console.log('Files to be loaded into WebContainer:', files)

      if (Object.keys(files).length === 0) {
        throw new Error('No valid files to load into WebContainer')
      }

      setTerminalOutput(prev => [...prev, { type: 'command', content: 'Initializing WebContainer with event tracker...' }])
      await webContainerConsoleRef.current.initializeWithEventTracker(files)

      // Add .env.local file if needed
      if (project && project.env) {
        setTerminalOutput(prev => [...prev, { type: 'command', content: 'Adding .env.local file...' }])
        await webContainerConsoleRef.current.webcontainer?.fs.writeFile('.env.local', project.env)
        setTerminalOutput(prev => [...prev, { type: 'output', content: '.env.local file added successfully' }])
      }

      webContainerConsoleRef.current.webcontainer?.on('server-ready', (port: number, url: string) => {
        console.log('Server is ready on:', url);
        setWebContainerStatus(prev => ({ ...prev, url, isReady: true, isLoading: false }));
        setTerminalOutput(prev => [...prev, { type: 'output', content: `Server is ready on: ${url}` }]);
        setCompilationStatus('compiling');
      });

      // Add a new event listener for terminal output
      webContainerConsoleRef.current.setOutputCallback((output: string) => {
        setTerminalOutput(prev => [...prev, { type: 'output', content: output }]);
        if (output.includes('Ready in') || output.includes('compiled successfully')) {
          setCompilationStatus('ready');
        }
      });

    } catch (error) {
      console.error('Error initializing WebContainer:', error)
      setWebContainerStatus(prev => ({ ...prev, status: `WebContainer initialization failed: ${error}`, isReady: false, isLoading: false }))
      setError(`WebContainer initialization failed: ${error}`)
      setTerminalOutput(prev => [...prev, { type: 'output', content: `Error: ${error}` }])
    }
  }, [project, llmService])

  const stopWebContainer = useCallback(async () => {
    if (webContainerConsoleRef.current) {
      setTerminalOutput(prev => [...prev, { type: 'command', content: 'Stopping server...' }]);
      await webContainerConsoleRef.current.stopServer();
      setTerminalOutput(prev => [...prev, { type: 'output', content: 'Server stopped' }]);
      resetWebContainerState();
    }
  }, []);

  const resetWebContainerState = () => {
    setWebContainerStatus({ status: '', isReady: false, isLoading: false });
    setUploadedZip(null);
    setTerminalOutput([]);
    setCompilationStatus('not-started');
    if (webContainerConsoleRef.current) {
      webContainerConsoleRef.current = null;
    }
  };

  // Add this new useEffect
  useEffect(() => {
    if (activeTab === 'console' && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [activeTab, terminalOutput])

  useEffect(() => {
    if (isFullScreen && fullScreenContainerRef.current) {
      fullScreenContainerRef.current.focus();
    }
  }, [isFullScreen]);

  const handleFullScreenExit = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsFullScreen(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setUploadedZip(file)
        setCompilationStatus('not-started')
        setWebContainerStatus({ status: '', isReady: false, isLoading: false })
      } else {
        setError('Please upload a valid zip file')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/zip': ['.zip'] } })

  const handleSaveBugDescription = async (newDescription: string) => {
    if (!editingBugId) return;
    try {
      const updatedBug = await updateBugReport(editingBugId, { ...editedBug, description: newDescription });
      setBugs(currentBugs => currentBugs.map(bug => bug.id === updatedBug.id ? updatedBug : bug));
      setEditingBugId(null);
    } catch (error) {
      console.error('Error updating bug:', error);
      setError('Failed to update bug');
    }
  };

  const handleFixBugClick = async () => {
    if (!user || !project) return;
    setIsCreatingBug(true);

    try {
      const newBug = await createBugReport(project.id, "Will be replaced", user.id);
      setBugs(currentBugs => [newBug, ...currentBugs]);
      setSelectedBugId(newBug.id);
      setExpandedBugId(newBug.id);
      setEditedBug(newBug);
    } catch (error) {
      console.error('Error creating bug:', error);
      setError('Failed to create bug: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsCreatingBug(false);
    }
  };

  const handleEventFromWebContainer = useCallback((event: MessageEvent) => {
    console.log('Received message from WebContainer:', event.data);
    if (event.data && event.data.type === 'UI_EVENT') {
      console.log('Received UI event:', event.data.event);
      setUIEvents(prevEvents => {
        const newEvents = [...prevEvents, event.data.event];
        console.log('Updated UI events:', newEvents);
        return newEvents;
      });
      setSessionEvents(prevEvents => {
        const newEvents = [...prevEvents, event.data.event];
        console.log('Updated session events:', newEvents);
        return newEvents;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleEventFromWebContainer);
    console.log('Added event listener for WebContainer messages');
    return () => {
      window.removeEventListener('message', handleEventFromWebContainer);
      console.log('Removed event listener for WebContainer messages');
    };
  }, [handleEventFromWebContainer]);

  useEffect(() => {
    setLLMService(createLLMService());
  }, []);

  const handleExitFullScreenAndShowEvents = useCallback(async () => {
    setIsFullScreen(false);
    await stopWebContainer();
    setActiveTab('events');
    // Transfer session events to UI events
    setUIEvents(prevEvents => [...prevEvents, ...sessionEvents]);
    // Clear session events
    setSessionEvents([]);
  }, [stopWebContainer, sessionEvents]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!project) return <div className="text-center">Project not found</div>

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 shadow-md flex items-center justify-between p-2 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{project?.name}</h1>
          <div className="relative w-56">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bugs..."
              className="w-full p-1 pl-8 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
            />
            <svg
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={handleFixBugClick}
                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                  disabled={isCreatingBug}
                >
                  {isCreatingBug ? (
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {isCreatingBug ? 'Creating...' : 'Fix Bug'}
                </button>
              </div>
              {selectedBugId && (
                <>
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div id="action-buttons" className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Selected
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <a 
          href={project?.github_repo} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>

      {error && <p className="text-red-500 p-2 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">{error}</p>}

      <div className="flex-grow overflow-auto relative">
        {isFullScreen && webContainerStatus.url && (
          <div 
            ref={fullScreenContainerRef}
            className="absolute inset-0 z-50 flex flex-col border border-green-500"
            onKeyDown={handleFullScreenExit}
            tabIndex={0}
          >
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">WebContainer App</h2>
              <button
                onClick={handleExitFullScreenAndShowEvents}
                className="bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors border border-gray-300 dark:border-gray-500 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Bug Session
              </button>
            </div>
            <div className="flex-grow">
              <iframe
                src={webContainerStatus.url}
                className="w-full h-full bg-white"
                title="WebContainer App Full Screen"
              />
            </div>
          </div>
        )}

        {filteredBugs.length === 0 ? (
          <div className="flex-grow flex items-center justify-center bg-white dark:bg-gray-800 h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">No Bugs Reported Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Start by reporting your first bug!</p>
              <button
                onClick={() => setShowReportBugPopup(true)}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Fix Your First Bug
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="w-16 px-2 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">
                    {/* Remove the checkbox here */}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-gray-200 dark:border-gray-600">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {filteredBugs.map((bug, index) => (
                  <React.Fragment key={bug.id}>
                    <tr 
                      className={`border-b border-gray-200 dark:border-gray-600 ${
                        selectedBugId === bug.id
                          ? 'bg-white dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <td className="w-16 px-2 py-2 border-r border-gray-200 dark:border-gray-600 align-top">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            checked={selectedBugId === bug.id}
                            onChange={() => handleRowClick(bug.id)}
                            className="rounded-full border-gray-300 text-black dark:text-white bg-white dark:bg-gray-700 checked:bg-black dark:checked:bg-white focus:ring-black dark:focus:ring-white"
                          />
                        </div>
                      </td>
                      <td 
                        className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 align-top cursor-pointer relative"
                        onClick={() => handleRowClick(bug.id)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{bug.description}</span>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBugId(editingBugId === bug.id ? null : bug.id);
                              }}
                              className="ml-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            {editingBugId === bug.id && (
                              <BugDescriptionEditDropdown
                                bug={bug}
                                onSave={(newDescription: string) => {
                                  handleSaveBugDescription(newDescription);
                                  setEditingBugId(null);
                                }}
                                onClose={() => setEditingBugId(null)}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td 
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 align-top cursor-pointer"
                        onClick={() => handleRowClick(bug.id)}
                      >
                        {bug.status}
                      </td>
                      <td 
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 align-top cursor-pointer"
                        onClick={() => handleRowClick(bug.id)}
                      >
                        {new Date(bug.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    {selectedBugId === bug.id && (
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td colSpan={4} className="px-4 py-4">
                          <div className="w-full">
                            <div className="flex space-x-4">
                              {/* Left side content */}
                              <div className="w-1/2 flex flex-col space-y-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                  <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => setActiveTab('ui')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                          activeTab === 'ui'
                                            ? 'bg-black text-white'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                      >
                                        App
                                      </button>
                                      <button
                                        onClick={() => setActiveTab('console')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                          activeTab === 'console'
                                            ? 'bg-black text-white'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                      >
                                        Logs
                                      </button>
                                      <button
                                        onClick={() => setActiveTab('events')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                          activeTab === 'events'
                                            ? 'bg-black text-white'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                      >
                                        Events
                                      </button>
                                    </div>
                                    {webContainerStatus.isReady && (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={stopWebContainer}
                                          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                                        >
                                          Stop Server
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-4">
                                    {activeTab === 'ui' ? (
                                      <div className="bg-white border border-gray-300 rounded overflow-hidden relative h-64">
                                        {webContainerStatus.url ? (
                                          compilationStatus === 'ready' ? (
                                            <>
                                              <iframe
                                                ref={iframeRef}
                                                src={webContainerStatus.url}
                                                className="w-full h-full"
                                                title="WebContainer App"
                                              />
                                              <div className="absolute top-2 right-2 flex space-x-2">
                                                <button
                                                  onClick={() => {
                                                    if (iframeRef.current && webContainerStatus.url) {
                                                      iframeRef.current.src = webContainerStatus.url;
                                                    }
                                                  }}
                                                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                  </svg>
                                                  Refresh
                                                </button>
                                                <button
                                                  onClick={() => setIsFullScreen(true)}
                                                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                  </svg>
                                                  Start Bug Session
                                                </button>
                                              </div>
                                            </>
                                          ) : compilationStatus === 'compiling' ? (
                                            <CompilingAnimation />
                                          ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                              Server is ready. Waiting for compilation to start...
                                            </div>
                                          )
                                        ) : (
                                          <div 
                                            {...getRootProps()} 
                                            className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 cursor-pointer"
                                            onClick={(e) => {
                                              if (!uploadedZip) {
                                                getRootProps().onClick?.(e);
                                              }
                                            }}
                                          >
                                            <input {...getInputProps()} />
                                            {webContainerStatus.isLoading ? (
                                              <CompilingAnimation />
                                            ) : uploadedZip ? (
                                              <UploadedFileDetails 
                                                file={uploadedZip} 
                                                onStart={() => initWebContainer(uploadedZip)}
                                              />
                                            ) : (
                                              <LoadFilesAnimation />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ) : activeTab === 'console' ? (
                                      <div 
                                        ref={consoleRef}
                                        className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm"
                                      >
                                        {terminalOutput.map((line, index) => (
                                          <div key={index} className={line.type === 'command' ? 'text-yellow-400' : ''}>
                                            {line.type === 'command' ? '$ ' : ''}
                                            {line.content}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="bg-white dark:bg-gray-800 p-4 rounded h-64 overflow-y-auto">
                                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">UI Events</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                          Total events: {uiEvents.length}
                                        </p>
                                        {uiEvents.length === 0 ? (
                                          <p className="text-gray-500 dark:text-gray-400">No events recorded yet.</p>
                                        ) : (
                                          <ul className="space-y-2">
                                            {uiEvents.map((event, index) => (
                                              <li key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                                  <span className="font-semibold">{event.type}</span> on {event.target}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                  {new Date(event.timestamp).toLocaleString()}
                                                </p>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Separator */}
                              <div className="w-px bg-gray-200 dark:bg-gray-600"></div>

                              {/* Right side content (Description and Task Chips) */}
                              <div className="w-1/2 pl-4">
                                <div className="flex flex-col">
                                  {expandedDescriptions.has(bug.id) && (
                                    <div className="mb-4">
                                      <label htmlFor={`bugDescription-${bug.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                      </label>
                                      <textarea
                                        id={`bugDescription-${bug.id}`}
                                        value={editedBug?.id === bug.id ? editedBug.description : bug.description}
                                        onChange={(e) => setEditedBug({...bug, description: e.target.value})}
                                        className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                      />
                                    </div>
                                  )}
                                  <div className="mt-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</h3>
                                      <div>
                                        <div className="flex flex-col space-y-2">
                                          <TaskChip task="Start app" isDone={true} />
                                          <TaskChip task="Record bug session" isDone={false} />
                                          <TaskChip task="Analyze" isDone={false} isAutomated={true} />
                                          <TaskChip task="Reproduce" isDone={false} isAutomated={true} />
                                          <TaskChip task="Draft" isDone={false} isAutomated={true} />
                                          <TaskChip task="Test" isDone={false} isAutomated={true} />
                                          <TaskChip task="Submit" isDone={false} isAutomated={true} />
                                        </div>
                                      </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {index < filteredBugs.length - 1 && (
                      <tr>
                        <td colSpan={4} className="border-t border-gray-200 dark:border-gray-600"></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProtectedRoute(ProjectPage)