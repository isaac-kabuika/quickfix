import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signUp, signInWithEmail, signInWithGitHub } from '../services/authService'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleEmailSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      router.push('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsSubmitting(true)
    try {
      await signInWithGitHub()
      // The user will be redirected to GitHub for authentication
    } catch (err) {
      setError('Failed to sign in with GitHub')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (user) return null

  return (
    <>
      <Head>
        <title>QuickFix AI - Sign In / Sign Up</title>
        <meta name="description" content="Sign in or create an account for QuickFix AI" />
      </Head>
      <main className="container mx-auto mt-16 p-4">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-neon p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400">Sign In / Sign Up to QuickFix AI</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={(e) => handleEmailSubmit(e, true)} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isSubmitting ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
          <button 
            onClick={(e) => handleEmailSubmit(e, false)} 
            disabled={isSubmitting}
            className="w-full mt-4 bg-secondary-500 text-white p-3 rounded-full hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {isSubmitting ? 'Loading...' : 'Sign In with Email'}
          </button>
          <button 
            onClick={handleGitHubSignIn} 
            disabled={isSubmitting}
            className="w-full mt-4 bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Image src="/images/github-mark-white.svg" alt="GitHub" width={20} height={20} className="mr-2" />
            {isSubmitting ? 'Loading...' : 'Sign In with GitHub'}
          </button>
        </div>
      </main>
    </>
  )
}