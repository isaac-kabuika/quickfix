import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '../../store/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'

export default function Sidebar() {
  const router = useRouter()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isActive = (pathname: string) => router.pathname === pathname

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(false)
    }, 100)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true)
    }, 100)
  }

  if (!user) return null

  return (
    <div 
      className={`bg-white dark:bg-gray-900 ${isCollapsed && !isHovered ? 'w-16' : 'w-64'} min-h-screen p-4 flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-150 relative`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mb-8 flex items-center overflow-hidden">
        <Link href="/" className="flex items-center">
          <Image src="/images/app-icon.svg" alt="QuickFix AI" width={32} height={32} className="flex-shrink-0" />
          <span className={`ml-2 text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors whitespace-nowrap ${isCollapsed && !isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150`}>
            QuickFix AI
          </span>
        </Link>
      </div>
      <nav className="space-y-1">
        <Link href="/dashboard" 
              className={`flex items-center rounded transition-all duration-200 ${isActive('/dashboard') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
          <div className="flex items-center w-full pl-1 pr-3 py-2">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a2 2 0 002 2h10a2 2 0 002-2V10M12 14v4" />
            </svg>
            <span className={`ml-3 ${isCollapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100 w-auto'} transition-all duration-150 overflow-hidden`}>Dashboard</span>
          </div>
        </Link>
        <Link href="/profile" 
              className={`flex items-center rounded transition-all duration-200 ${isActive('/profile') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
          <div className="flex items-center w-full pl-1 pr-3 py-2">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`ml-3 ${isCollapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100 w-auto'} transition-all duration-150 overflow-hidden`}>Profile</span>
          </div>
        </Link>
      </nav>
    </div>
  )
}