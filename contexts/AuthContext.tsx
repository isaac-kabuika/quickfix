import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseApiClient'
import { User } from '../store/index'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  fetchUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (user) {
        setUser({
          ...user,
          email: user.email || '',
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      setError('Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    fetchUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}