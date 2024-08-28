import { supabase } from '../lib/supabaseApiClient'

interface BugReport {
  id: string;
  project_id: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;  // Add this line
}

export const createBugReport = async (projectId: string, description: string, userId: string): Promise<BugReport> => {
  const { data, error } = await supabase
    .from('bug_reports')
    .insert({ project_id: projectId, description, status: 'open', user_id: userId })
    .select()
    .single()

  if (error) throw error
  if (!data) {
    // If no data is returned, fetch the last inserted row
    const { data: lastInserted, error: fetchError } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError) throw fetchError
    if (!lastInserted) throw new Error('Failed to create bug report')
    return lastInserted as BugReport
  }
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
  console.log('Updating bug report:', bugId, updates)

  // Ensure user_id is not being updated
  const { user_id, ...updateData } = updates

  const { error: updateError } = await supabase
    .from('bug_reports')
    .update(updateData)
    .eq('id', bugId)

  if (updateError) {
    console.error('Error updating bug report:', updateError)
    throw updateError
  }

  // Fetch the updated bug report
  const { data: fetchedData, error: fetchError } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('id', bugId)
    .single()

  if (fetchError) {
    console.error('Error fetching updated bug report:', fetchError)
    throw fetchError
  }

  if (!fetchedData) {
    console.error('No data returned from fetch operation')
    throw new Error('Failed to fetch updated bug report')
  }

  const updatedBug = fetchedData as BugReport
  console.log('Updated bug report:', updatedBug)

  return updatedBug
}

export const deleteBugReport = async (bugId: string): Promise<void> => {
  const { error } = await supabase
    .from('bug_reports')
    .delete()
    .eq('id', bugId)

  if (error) throw error
}