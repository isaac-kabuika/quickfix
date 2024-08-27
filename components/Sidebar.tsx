import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const router = useRouter()
  const { user } = useAuth()

  const isActive = (pathname: string) => router.pathname === pathname

  if (!user) return null

  return (
    <div className="bg-gray-100 dark:bg-gray-800 w-64 min-h-screen p-4 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="mb-8">
        <Link href="/" className="flex items-center">
          <Image src="/images/app-icon.svg" alt="QuickFix AI" width={32} height={32} className="mr-2" />
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">QuickFix AI</span>
        </Link>
      </div>
      <nav className="space-y-2">
        <Link href="/dashboard" 
              className={`flex items-center p-2 rounded transition-all duration-200 ${isActive('/dashboard') ? 'bg-primary-500 bg-opacity-70 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:bg-opacity-50 hover:text-white'}`}>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link href="/profile" 
              className={`flex items-center p-2 rounded transition-all duration-200 ${isActive('/profile') ? 'bg-primary-500 bg-opacity-70 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:bg-opacity-50 hover:text-white'}`}>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
      </nav>
    </div>
  )
}