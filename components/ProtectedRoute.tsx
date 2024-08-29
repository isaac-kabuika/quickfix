import { useRouter } from 'next/router'
import { useAuth } from '../store/hooks/useAuth'

const ProtectedRoute = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const router = useRouter()
    const { user, loading } = useAuth()

    if (typeof window !== 'undefined') {
      if (loading) {
        return <div>Loading...</div>
      }

      if (!user) {
        router.replace('/')
        return null
      }

      return <WrappedComponent {...props} />
    }

    // Return null if we're on server-side
    return null
  }
}

export default ProtectedRoute