import ProtectedRoute from '../../components/ProtectedRoute'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getProject, getProjectInvitations } from '../../services/projectService'
import BugReportForm from '../../components/BugReportForm'
import DependencyGraph from '../../components/DependencyGraph'
import StackBlitzTester from '../../components/StackBlitzTester'
import InviteTeamMember from '../../components/InviteTeamMember'
import { supabase } from '../../lib/supabaseApiClient'
import { useAuth } from '../../hooks/useAuth'

export function ProjectPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [bugLocations, setBugLocations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [invitations, setInvitations] = useState<any[]>([])
  const [suggestedFix, setSuggestedFix] = useState('')

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadProject(id)
      loadInvitations(id)
      subscribeToProjectUpdates(id)
    }
    return () => {
      supabase.removeAllChannels()
    }
  }, [id])

  const loadProject = async (projectId: string) => {
    setIsLoading(true)
    try {
      const projectData = await getProject(projectId)
      setProject(projectData)
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const loadInvitations = async (projectId: string) => {
    try {
      const invitationsData = await getProjectInvitations(projectId)
      setInvitations(invitationsData)
    } catch (err) {
      console.error('Failed to load invitations', err)
    }
  }

  const subscribeToProjectUpdates = (projectId: string) => {
    supabase
      .channel(`public:projects:id=eq.${projectId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, payload => {
        setProject(payload.new)
      })
      .subscribe()

    supabase
      .channel(`public:project_invitations:project_id=eq.${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_invitations', filter: `project_id=eq.${projectId}` }, payload => {
        setInvitations(current => [...current, payload.new])
      })
      .subscribe()
  }

  const handleBugReportCreated = async (bugReportId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, bugReportId }),
      })
      const data = await response.json()
      setBugLocations(data.bugLocations)
      setSuggestedFix(data.suggestedFix)
    } catch (err) {
      setError('Failed to locate bug')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!project) return <div>Project not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>
      <BugReportForm projectId={project.id} onBugReportCreated={handleBugReportCreated} />
      <DependencyGraph projectId={project.id} />
      {user && <StackBlitzTester projectId={project.id} userId={user.id} bugLocations={bugLocations} />}
      {bugLocations.length > 0 && (
        <div>
          <h2>Potential Bug Locations:</h2>
          <ul>
            {bugLocations.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        </div>
      )}
      {suggestedFix && (
        <div>
          <h2>Suggested Fix:</h2>
          <pre>{suggestedFix}</pre>
        </div>
      )}
      <h2>Invite Team Members</h2>
      <InviteTeamMember projectId={project.id} />
      <h3>Pending Invitations</h3>
      <ul>
        {invitations.map(invitation => (
          <li key={invitation.id}>{invitation.invited_email} - {invitation.status}</li>
        ))}
      </ul>
    </div>
  )
}

export default ProtectedRoute(ProjectPage)