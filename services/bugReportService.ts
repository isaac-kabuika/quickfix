import { supabase } from '../lib/supabaseApiClient'

interface BugReport {
  id: string;
  project_id: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
}

export const createBugReport = async (projectId: string, description: string, userId: string): Promise<BugReport> => {
  const { data, error } = await supabase
    .from('bug_reports')
    .insert({ project_id: projectId, description, status: 'open', user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as BugReport
}

export const getBugReports = async (projectId: string): Promise<BugReport[]> => {
  const { data, error } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as BugReport[]
}

export const updateBugReport = async (bugId: string, updates: Partial<BugReport>): Promise<BugReport> => {
  const { data, error } = await supabase
    .from('bug_reports')
    .update(updates)
    .eq('id', bugId)
    .select()
    .single()

  if (error) throw error
  return data as BugReport
}

export const deleteBugReport = async (bugId: string): Promise<void> => {
  const { error } = await supabase
    .from('bug_reports')
    .delete()
    .eq('id', bugId)

  if (error) throw error
}