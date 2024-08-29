import { supabase } from '../lib/supabaseApiClient'
import { createGithubClient } from '../lib/githubApiClient'
import { store } from '../store'

export const getProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)

  if (error) throw error
  return data
}

export const createProject = async (projectData: any) => {
  console.log('Creating project:', projectData)

  const { data: session } = await supabase.auth.getSession()
  console.log('Current session:', session)

  if (!session || !session.session) {
    throw new Error('No active session')
  }

  const { user, provider_token } = session.session

  if (!user) {
    throw new Error('User not found')
  }

  console.log('User:', user)
  console.log('Provider token:', provider_token)

  if (!provider_token) {
    throw new Error('GitHub access token not found')
  }

  // Use the GitHub token to create the repository
  // ... (implement GitHub repository creation logic here)
  // You can use the `provider_token` as the GitHub access token

  // Prepare the project data, ensuring we don't include an ID
  const newProjectData = {
    name: projectData.name,
    github_repo: projectData.github_repo,
    owner_id: user.id,
    // Add any other fields that are part of your project schema
  }

  // Then create the project in your database
  const { data, error } = await supabase
    .from('projects')
    .insert([newProjectData])
    .select()
    .single() // This ensures we only get one result

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  console.log('Project created successfully:', data)
  return data
}

export const getProject = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

export const getProjectFiles = async (projectId: string, userId: string) => {
  const project = await getProject(projectId)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('github_access_token')
    .eq('id', userId)
    .single()

  if (userError) throw userError

  const githubClient = createGithubClient(userData.github_access_token)
  const [owner, repo] = project.github_repo.split('/').slice(-2)
  const files = await githubClient.getRepoContents(owner, repo)
  
  // Convert GitHub API response to StackBlitz file format
  return files.reduce((acc: { [key: string]: { content: string } }, file) => {
    if (file.type === 'file' && file.content) {
      acc[file.path] = { content: file.content }
    }
    return acc
  }, {})
}

export const inviteTeamMember = async (projectId: string, email: string) => {
  const { data, error } = await supabase
    .from('project_invitations')
    .insert({ project_id: projectId, invited_email: email, status: 'pending' })

  if (error) throw error
  return data
}

export const getProjectInvitations = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('project_id', projectId)

  if (error) throw error
  return data
}

export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    throw new Error('Failed to delete project')
  }
}

export const updateProject = async (projectId: string, updatedData: Partial<Project>) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updatedData)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data
}