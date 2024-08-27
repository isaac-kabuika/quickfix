import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { useTheme } from '../contexts/ThemeContext'
import { useRouter } from 'next/router'
import { signOut } from '../services/authService'

export default function Navbar() {
  const { user, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to home page after successful sign-out
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      // Optionally, show an error message to the user
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderAvatar = () => {
    if (!user) return null

    if (user.user_metadata?.avatar_url) {
      return (
        <Image
          src={user.user_metadata.avatar_url}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        />
      )
    } else {
      return renderInitials()
    }
  }

  const renderInitials = () => {
    const initials = getInitials(user?.email || 'User')
    return (
      <div 
        className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {initials}
      </div>
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {!user && (
          <Link href="/" className="flex items-center">
            <Image src="/images/app-icon.svg" alt="QuickFix AI" width={32} height={32} className="mr-2" />
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">QuickFix AI</span>
          </Link>
        )}
        <div className="flex items-center ml-auto space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              {renderAvatar()}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition-colors">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}