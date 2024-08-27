import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProjects, deleteProject } from '../services/projectService'
import ProjectList from '../components/ProjectList'
import { supabase } from '../lib/supabaseApiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import CreateProjectPopup from '../components/CreateProjectPopup'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

const PROJECTS_PER_PAGE = 10

function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreatePopup, setShowCreatePopup] = useState(false)

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
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProjects(filtered)
    setCurrentPage(1)
  }, [searchTerm, projects])

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
          setProjects(currentProjects => [...currentProjects, payload.new as Project])
        }
      })
      .subscribe()
  }

  const handleProjectCreated = (newProject: any) => {
    setProjects([...projects, newProject])
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return
    try {
      await deleteProject(projectId)
      setProjects(currentProjects => currentProjects.filter(project => project.id !== projectId))
    } catch (err) {
      setError('Failed to delete project')
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
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-500 hover:text-primary-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProtectedRoute(Dashboard)