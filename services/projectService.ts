import { supabase } from '../lib/supabaseApiClient'
import { createGithubClient } from '../lib/githubApiClient'

export const getProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)

  if (error) throw error
  return data
}

export const createProject = async (projectData: {
  name: string
  owner_id: string
  github_repo: string
}) => {
  try {
    console.log('Creating project for user:', projectData.owner_id)

    // Fetch user data from the API route
    const response = await fetch(`/api/getUserData?userId=${projectData.owner_id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    const userData = await response.json()

    const githubAccessToken = userData.user.app_metadata?.provider_token

    if (!githubAccessToken) {
      console.error('GitHub access token not found for user:', projectData.owner_id)
      throw new Error('GitHub access token not found. Please reconnect your GitHub account.')
    }

    const githubClient = createGithubClient(githubAccessToken)

    // Verify repository access
    const [owner, repo] = projectData.github_repo.split('/')
    try {
      await githubClient.getRepoContents(owner, repo)
    } catch (error) {
      console.error('Error accessing GitHub repository:', error)
      throw new Error('Unable to access the specified GitHub repository. Please check the URL and your permissions.')
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .single()

    if (error) {
      console.error('Error creating project in database:', error)
      throw new Error(`Failed to create project in database: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in createProject:', error)
    throw error
  }
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
  return files.reduce((acc, file) => {
    if (file.type === 'file') {
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