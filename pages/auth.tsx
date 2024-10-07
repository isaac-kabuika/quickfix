import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signUp, signInWithEmail, signInWithGitHub } from '../services/authService'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../store/hooks/useAuth'

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
      // The useEffect hook will handle redirection once the user state is updated
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
        <title>Docstrail - Sign In / Sign Up</title>
        <meta name="description" content="Sign in or create an account for Docstrail" />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex justify-center items-center mb-8">
          {/* <Image src="/images/app-icon.svg" alt="Docstrail" width={64} height={64} className="mr-4" /> */}
          <h1 className="text-5xl font-bold text-gray-800">Sign In</h1>
        </div>
        <p className="text-2xl mb-12 text-center text-gray-600">
          Start fixing issues faster.
        </p>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={(e) => handleEmailSubmit(e, true)} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-800 dark:text-gray-200"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={(e) => handleEmailSubmit(e, false)}
              disabled={isSubmitting}
              className="w-full mt-4 bg-white text-black p-3 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center border border-black"
            >
              {isSubmitting ? 'Loading...' : 'Sign In with Email'}
            </button>
            <button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={isSubmitting}
              className="w-full mt-4 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Image src="/images/github-mark-white.svg" alt="GitHub" width={20} height={20} className="mr-2" />
              {isSubmitting ? 'Loading...' : 'Sign In with GitHub'}
            </button>
            <div className='flex items-center justify-center'><span>or</span></div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white p-3 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isSubmitting ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}