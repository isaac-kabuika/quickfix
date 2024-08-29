import { AppProps } from 'next/app'
import '../styles/globals.css'
import Navbar from '../components/navigation/Navbar'
import Sidebar from '../components/navigation/Sidebar'
import { useAuth } from '../store/hooks/useAuth'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useEffect, useState } from 'react'
import { AuthProvider } from '../contexts/AuthContext'

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a loading state or nothing on the server
  if (!mounted || loading) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {user && <Sidebar />}
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow bg-white dark:bg-gray-900">
          {children}
        </main>
        <footer className="bg-background-light dark:bg-background-dark py-4 text-center text-gray-400">
          © 2024 QuickFix AI. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp