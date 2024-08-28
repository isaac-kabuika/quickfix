import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Provider } from 'react-redux'
import { store } from '../store'

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
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
    <Provider store={store}>
      <ThemeProvider>
        <SessionProvider session={pageProps.session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp