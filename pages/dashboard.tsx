import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchUserData } from '../store/userActions'
import { getProjects, deleteProject } from '../services/projectService'
import ProjectList from '../components/ProjectList'
import { supabase } from '../lib/supabaseApiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import CreateProjectPopup from '../components/CreateProjectPopup'
import { signInWithGitHub } from '../services/authService'
import { createProject } from '../services/projectService' // Make sure this import is present
import { useRouter } from 'next/router'

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

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  )

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE)

  if (authLoading || isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!user) return <div className="text-center text-red-500">Please sign in to view your dashboard.</div>

  return (
    <div className="relative container mx-auto px-4 py-8 max-w-7xl">
      {projects.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="relative w-full lg:w-64 mb-4 lg:mb-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full p-2 pl-10 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
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
          <button
            onClick={() => setShowCreatePopup(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
          >
            Create New Project
          </button>
        </div>
      )}
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {githubError && (
        <button
          onClick={handleConnectGitHub}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors mb-4"
        >
          Reconnect GitHub
        </button>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">No Projects Yet</h2>
          <p className="text-gray-400 mb-8">Get started by creating your first project!</p>
          <button
            onClick={() => setShowCreatePopup(true)}
            className="bg-primary-500 text-white px-6 py-3 rounded-full hover:bg-primary-600 transition-colors text-lg font-semibold"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <>
          <ProjectList 
            projects={paginatedProjects} 
            onDeleteProject={handleDeleteProject}
          />
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button 
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-500 hover:text-primary-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-gray-500 hover:text-primary-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {showCreatePopup && user && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md">
            <CreateProjectPopup
              onClose={() => setShowCreatePopup(false)}
              onProjectCreated={handleProjectCreated}
              userId={user.id}
              isCreating={isCreatingProject}
            />
          </div>
        </div>
      )}

      {!isGithubConnected && (
        <button
          onClick={handleConnectGitHub}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors mb-4"
        >
          Connect GitHub
        </button>
      )}
    </div>
  )
}

export default ProtectedRoute(Dashboard)