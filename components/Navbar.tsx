import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const { user, loading } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Redirect to home page or refresh the current page
  }

  return (
    <nav className="bg-background-light text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/app-icon.svg" alt="QuickFix AI" width={32} height={32} className="mr-2" />
          <span className="text-2xl font-bold text-primary-400 hover:text-primary-300 transition-colors">QuickFix AI</span>
        </Link>
        <div className="space-x-4">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hover:text-primary-300 transition-colors">Dashboard</Link>
              <Link href="/profile" className="hover:text-primary-300 transition-colors">Profile</Link>
              <span className="text-gray-400">{user.email}</span>
              <button 
                onClick={handleSignOut} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition-colors">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}