import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProjects, createProject } from '../services/projectService'
import ProjectList from '../components/ProjectList'
import { supabase } from '../lib/supabaseApiClient'
import ProtectedRoute from '../components/ProtectedRoute'

const PROJECTS_PER_PAGE = 10

function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectRepo, setNewProjectRepo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    setError('')
    try {
      const newProject = await createProject({
        name: newProjectName,
        owner_id: user.id,
        github_repo: newProjectRepo,
      })
      setProjects([...projects, newProject])
      setNewProjectName('')
      setNewProjectRepo('')
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  )

  if (authLoading || isLoading) return <div>Loading...</div>
  if (!user) return <div>Please sign in to view your dashboard.</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search projects..."
      />
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <>
          <ProjectList projects={paginatedProjects} />
          <div>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * PROJECTS_PER_PAGE >= filteredProjects.length}
            >
              Next
            </button>
          </div>
          <h2>Create New Project</h2>
          <form onSubmit={handleCreateProject}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project Name"
              required
            />
            <input
              type="text"
              value={newProjectRepo}
              onChange={(e) => setNewProjectRepo(e.target.value)}
              placeholder="GitHub Repo URL"
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default ProtectedRoute(Dashboard)