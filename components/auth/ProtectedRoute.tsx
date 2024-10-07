import { useRouter } from 'next/router'
import { useAuth } from '../../store/hooks/useAuth'
import { ComponentType, useEffect } from 'react'

const ProtectedRoute = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ProtectedComponent = (props: P) => {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/')
      }
    }, [user, loading, router])

    if (typeof window === 'undefined') {
      return null
    }

    if (loading) {
      return <div>Loading...</div>
    }

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }

  return ProtectedComponent
}

export default ProtectedRoute