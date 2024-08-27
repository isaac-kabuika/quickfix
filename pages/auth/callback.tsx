import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { hash, searchParams } = new URL(window.location.href)
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error('Error setting session:', error)
          router.push('/auth')
        } else if (data.session) {
          router.push('/dashboard')
        }
      } else if (hash) {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          router.push('/auth')
        } else if (data.session) {
          router.push('/dashboard')
        } else {
          // If there's no session, try to exchange the auth code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(hash.substring(1))
          if (error) {
            console.error('Error exchanging code for session:', error)
            router.push('/auth')
          } else if (data.session) {
            router.push('/dashboard')
          }
        }
      } else {
        router.push('/auth')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Loading...</div>
}