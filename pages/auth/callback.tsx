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
          const { user } = data.session
          if (user) {
            // The GitHub access token is already stored in user.app_metadata
            // by Supabase when using OAuth, so we don't need to store it separately.
            // We can update other user data if needed:
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                email: user.email,
                // Add any other user data you want to store
              }
            })
            
            if (updateError) {
              console.error('Error updating user data:', updateError)
            }
          }
          router.push('/dashboard')
        }
      } else {
        // Handle other cases (e.g., error responses)
        console.error('No access token or refresh token found in the URL')
        router.push('/auth')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Loading...</div>
}