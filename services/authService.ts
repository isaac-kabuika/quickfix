import { supabase } from '../lib/supabaseApiClient'

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  // We don't need to handle the redirect here, as we'll do it where this function is called
}

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo', // Request repo scope to create repositories
      redirectTo: `${window.location.origin}/dashboard` // Redirect to dashboard after successful sign-in
    }
  })

  if (error) {
    console.error('Error signing in with GitHub:', error)
    throw error
  }

  console.log('GitHub OAuth sign-in initiated')

  return data
}