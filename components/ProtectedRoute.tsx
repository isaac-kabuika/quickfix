import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/') // Changed from '/login' to '/'
      }
    }, [user, loading])

    if (loading) {
      return <div>Loading...</div>
    }

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

export default ProtectedRoute