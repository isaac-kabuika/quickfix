import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProjects } from '../services/projectService'
import ProjectList from '../components/ProjectList'
import { supabase } from '../lib/supabaseApiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import CreateProjectPopup from '../components/CreateProjectPopup'

const PROJECTS_PER_PAGE = 10

function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
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
          setProjects(currentProjects => [...currentProjects, payload.new])
        }
      })
      .subscribe()
  }

  const handleProjectCreated = (newProject: any) => {
    setProjects([...projects, newProject])
  }

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  )

  if (authLoading || isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!user) return <div className="text-center text-red-500">Please sign in to view your dashboard.</div>

  return (
    <div className="relative container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 lg:mb-0 text-primary-400">Dashboard</h1>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full lg:w-64 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={() => setShowCreatePopup(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
          >
            Create New Project
          </button>
        </div>
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
          <ProjectList projects={paginatedProjects} />
          
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-primary-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * PROJECTS_PER_PAGE >= filteredProjects.length}
              className="bg-primary-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
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