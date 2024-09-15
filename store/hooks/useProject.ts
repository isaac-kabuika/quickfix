import { useState, useEffect } from 'react'
import { getProject, getProjectFiles, Project } from '../../services/projectService'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectFile {
  [key: string]: { content: string }
}

// Make sure the Project type includes the env field
// If it doesn't, update it in the projectService file

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<ProjectFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (projectId && user) {
      fetchProject()
    }
  }, [projectId, user])

  const fetchProject = async () => {
    setLoading(true)
    setError(null)
    try {
      const projectData = await getProject(projectId)
      setProject(projectData)
      
      if (user) {
        const projectFiles = await getProjectFiles(projectId, user.id)
        setFiles(projectFiles)
      }
    } catch (err) {
      setError('Failed to fetch project data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateProject = (updatedProject: Partial<Project>) => {
    if (project) {
      setProject({ ...project, ...updatedProject })
    }
  }

  const updateFiles = (updatedFiles: ProjectFile) => {
    setFiles(updatedFiles)
  }

  return {
    project,
    files,
    loading,
    error,
    updateProject,
    updateFiles,
    refetch: fetchProject
  }
}