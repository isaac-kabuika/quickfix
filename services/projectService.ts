import { supabase } from '../lib/supabaseApiClient'
import { createGithubClient } from '../lib/githubApiClient'
import { Tables, TablesInsert, TablesUpdate } from '../types/supabase'

export type Project = Tables<'projects'>
export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export const getProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)

  if (error) throw error
  return data
}

export const createProject = async (projectData: Omit<Project, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: projectData.name,
      github_repo: projectData.github_repo,
      env: projectData.env,
      owner_id: projectData.owner_id,
    })
    .single();

  if (error) throw error;
  return data;
};

export const getProject = async (projectId: string): Promise<Project> => {
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
  
  // Get the user's session to retrieve the GitHub access token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const githubAccessToken = session?.provider_token

  if (!githubAccessToken) {
    throw new Error('GitHub access token not found')
  }

  const githubClient = createGithubClient(githubAccessToken)
  const [owner, repo] = project.github_repo.split('/').slice(-2)
  const files = await githubClient.getRepoContents(owner, repo)
  
  // Convert GitHub API response to StackBlitz file format
  return files.reduce((acc: { [key: string]: { content: string } }, file: { type: string; path: string; content?: string }) => {
    if (file.type === 'file' && file.content) {
      acc[file.path] = { content: file.content }
    }
    return acc
  }, {})
}

export const inviteTeamMember = async (projectId: string, email: string): Promise<Tables<'project_invitations'>> => {
  const { data, error } = await supabase
    .from('project_invitations')
    .insert({ project_id: projectId, invited_email: email, status: 'pending' })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getProjectInvitations = async (projectId: string): Promise<Tables<'project_invitations'>[]> => {
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

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .update({
      name: projectData.name,
      github_repo: projectData.github_repo,
      env: projectData.env,
    })
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};