import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const { user, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
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
    <nav className="bg-background-light text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {!user && (
          <Link href="/" className="flex items-center">
            <Image src="/images/app-icon.svg" alt="QuickFix AI" width={32} height={32} className="mr-2" />
            <span className="text-2xl font-bold text-primary-400 hover:text-primary-300 transition-colors">QuickFix AI</span>
          </Link>
        )}
        <div className="flex items-center ml-auto">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              {renderAvatar()}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background-light rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-400">{user.email}</div>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-primary-500 transition-colors"
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