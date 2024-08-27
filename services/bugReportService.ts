import { supabase } from '../lib/supabaseApiClient'

interface BugReport {
  id: string;
  project_id: string;
  description: string;
  status: string;
}

export const createBugReport = async (projectId: string, description: string): Promise<BugReport> => {
  const { data, error } = await supabase
    .from('bug_reports')
    .insert({ project_id: projectId, description, status: 'open' })
    .single()

  if (error) throw error
  if (!data) throw new Error('No data returned from bug report creation')
  return data as BugReport
}

export const getBugReports = async (projectId: string): Promise<BugReport[]> => {
  const { data, error } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('project_id', projectId)

  if (error) throw error
  return data as BugReport[]
}