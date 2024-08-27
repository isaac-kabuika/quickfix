import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-background-dark text-white">
      {user && <Sidebar />}
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow p-4">
          {children}
        </main>
        <footer className="bg-background-light py-4 text-center text-gray-400">
          © 2024 QuickFix AI. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>QuickFix AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}

export default MyApp