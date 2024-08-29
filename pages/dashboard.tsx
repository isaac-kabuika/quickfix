import { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchUserData } from '../store/userActions'
import { getProjects, deleteProject, createProject, updateProject } from '../services/projectService'
import ProjectList from '../components/ProjectList'
import { supabase } from '../lib/supabaseApiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import { signInWithGitHub } from '../services/authService'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

const PROJECTS_PER_PAGE = 10

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading: authLoading, error: authError } = useSelector((state: RootState) => state.user)
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreatePopup, setShowCreatePopup] = useState(false)
  const [githubError, setGithubError] = useState(false)
  const [isGithubConnected, setIsGithubConnected] = useState(false)
  const [creatingProjects, setCreatingProjects] = useState<Set<string>>(new Set())
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [showConnectPopup, setShowConnectPopup] = useState(false)
  const connectButtonRef = useRef<HTMLButtonElement>(null)
  const connectPopupRef = useRef<HTMLDivElement>(null)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editedProjects, setEditedProjects] = useState<{ [key: string]: Project }>({})

  useEffect(() => {
    dispatch(fetchUserData())
  }, [dispatch])

  useEffect(() => {
    if (user && !authLoading) {
      loadProjects()
      subscribeToProjects()
    }
    return () => {
      supabase.removeAllChannels()
    }
  }, [user, authLoading])

  useEffect(() => {
    const filtered = projects.filter((project: Project) => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProjects(filtered)
    setCurrentPage(1)
  }, [searchTerm, projects])

  useEffect(() => {
    const checkGithubConnection = async () => {
      if (user) {
        const { data: session } = await supabase.auth.getSession()
        setIsGithubConnected(!!session?.session?.provider_token)
      }
    }
    checkGithubConnection()
  }, [user])

  useEffect(() => {
    const { access_token, error } = router.query

    if (access_token) {
      // Successfully signed in and redirected
      console.log('Successfully signed in with GitHub')
      // You might want to fetch user data or projects here
      loadProjects()
    } else if (error) {
      console.error('Error signing in with GitHub:', error)
      setError('Failed to sign in with GitHub')
    }
  }, [router.query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (connectPopupRef.current && !connectPopupRef.current.contains(event.target as Node) &&
          connectButtonRef.current && !connectButtonRef.current.contains(event.target as Node)) {
        setShowConnectPopup(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadProjects = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const userProjects = await getProjects(user.id)
      setProjects(userProjects)
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToProjects = () => {
    if (!user) return
    supabase
      .channel('public:projects')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, payload => {
        if (payload.new.owner_id === user.id) {
          console.log('New project from subscription:', payload.new)
          setProjects((currentProjects: Project[]) => {
            if (!currentProjects.some(project => project.id === payload.new.id) && !creatingProjects.has(payload.new.id)) {
              return [...currentProjects, payload.new as Project]
            }
            return currentProjects
          })
        }
      })
      .subscribe()
  }

  const handleProjectCreated = useCallback(async (newProject: any) => {
    if (isCreatingProject) return // Prevent multiple submissions
    setIsCreatingProject(true)

    try {
      console.log('Project created successfully:', newProject)
      
      // Add the project ID to the creatingProjects set
      setCreatingProjects(prev => new Set(prev).add(newProject.id))
      
      // Manually update the projects state
      setProjects(currentProjects => {
        if (!currentProjects.some(project => project.id === newProject.id)) {
          return [...currentProjects, newProject]
        }
        return currentProjects
      })
      
      setShowCreatePopup(false)
      
      // Remove the project ID from creatingProjects after a short delay
      setTimeout(() => {
        setCreatingProjects(prev => {
          const newSet = new Set(prev)
          newSet.delete(newProject.id)
          return newSet
        })
      }, 5000) // 5 seconds delay
    } catch (error) {
      console.error('Error handling created project:', error)
      if (error instanceof Error && error.message.includes('GitHub access token not found')) {
        setGithubError(true)
        setError('GitHub access token not found. Please reconnect your GitHub account.')
      } else {
        setError('Failed to handle created project: ' + (error instanceof Error ? error.message : String(error)))
      }
    } finally {
      setIsCreatingProject(false)
    }
  }, [isCreatingProject])

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return
    try {
      await deleteProject(projectId)
      setProjects((currentProjects: Project[]) => currentProjects.filter((project: Project) => project.id !== projectId))
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  const handleConnectGitHub = async () => {
    try {
      await signInWithGitHub()
      // The page will reload after GitHub OAuth, so we don't need to do anything else here
    } catch (error) {
      console.error('Error connecting to GitHub:', error)
      setError('Failed to connect to GitHub: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleCreateProject = async (projectName: string, githubRepo: string) => {
    if (!user) return;
    setIsCreatingProject(true);
    try {
      const newProject = await createProject({
        userId: user.id,
        name: projectName,
        githubRepo: githubRepo
      });
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setShowConnectPopup(false);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSaveProject = async (projectId: string) => {
    const updatedProject = editedProjects[projectId];
    if (!updatedProject) return;

    try {
      const savedProject = await updateProject(projectId, updatedProject);
      setProjects(currentProjects => 
        currentProjects.map(project => 
          project.id === savedProject.id ? savedProject : project
        )
      );
      setEditingProjectId(null);
      setSelectedProjects(new Set());
      // Clear the edited project from the editedProjects state
      setEditedProjects(prev => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    }
  };

  const handleProjectEdit = (projectId: string, updatedFields: Partial<Project>) => {
    setEditedProjects(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], ...updatedFields },
    }));
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setSelectedProjects(new Set());
  }

  const handleBulkDelete = async () => {
    if (selectedProjects.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedProjects.size} project(s)?`)) {
      try {
        for (const projectId of Array.from(selectedProjects)) {
          await deleteProject(projectId);
        }
        setProjects(currentProjects => currentProjects.filter(project => !selectedProjects.has(project.id)));
        setSelectedProjects(new Set());
      } catch (error) {
        console.error('Error deleting projects:', error);
        setError('Failed to delete projects');
      }
    }
  };

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  )

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE)

  if (authLoading || isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!user) return <div className="text-center text-red-500">Please sign in to view your dashboard.</div>

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 shadow-md flex items-center p-2 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 flex-grow">
          <div className="relative w-56">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
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
            <button
              ref={connectButtonRef}
              onClick={() => setShowConnectPopup(!showConnectPopup)}
              className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Connect Project
            </button>
            {showConnectPopup && (
              <div 
                ref={connectPopupRef}
                className="absolute z-10 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="px-4 py-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Connect Project</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const projectName = formData.get('projectName') as string;
                    const githubRepo = formData.get('githubRepo') as string;
                    handleCreateProject(projectName, githubRepo);
                  }}>
                    <div className="mb-4">
                      <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        id="projectName"
                        name="projectName"
                        placeholder="Enter project name"
                        className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        GitHub Repo URL
                      </label>
                      <input
                        type="text"
                        id="githubRepo"
                        name="githubRepo"
                        placeholder="https://github.com/username/repo"
                        className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                      disabled={isCreatingProject}
                    >
                      {isCreatingProject ? (
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      {isCreatingProject ? 'Connecting...' : 'Connect Project'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          {selectedProjects.size > 0 && (
            <div className="flex items-center space-x-2">
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
              {selectedProjects.size === 1 && (
                <>
                  <button
                    onClick={() => {
                      const projectId = Array.from(selectedProjects)[0];
                      handleSaveProject(projectId);
                    }}
                    className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={handleBulkDelete}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedProjects.size})
              </button>
            </div>
          )}
        </div>
        {!isGithubConnected && (
          <button
            onClick={handleConnectGitHub}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
          >
            Connect GitHub
          </button>
        )}
      </div>

      {error && <p className="text-red-500 p-2 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">{error}</p>}

      <div className="flex-grow overflow-auto">
        {projects.length === 0 ? (
          <div className="flex-grow flex items-center justify-center bg-white dark:bg-gray-800 h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">No Projects Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Get started by creating your first project!</p>
              <button
                onClick={() => setShowConnectPopup(true)}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <ProjectList 
            projects={paginatedProjects}
            onDeleteProject={handleDeleteProject}
            onEditProject={handleProjectEdit}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            editingProjectId={editingProjectId}
            setEditingProjectId={setEditingProjectId}
            editedProjects={editedProjects}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(currentPage - 1) * PROJECTS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * PROJECTS_PER_PAGE, filteredProjects.length)}</span> of{' '}
                <span className="font-medium">{filteredProjects.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProtectedRoute(Dashboard)