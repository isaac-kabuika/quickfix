import ProtectedRoute from '../components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default ProtectedRoute(Profile)

function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!user) {
      setMessage('User not found')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id)

      if (error) throw error
      setMessage('Profile updated successfully')
    } catch (error) {
      setMessage('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="text-center text-red-500">Please sign in to view your profile.</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  )
}