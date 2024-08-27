import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'
import Head from 'next/head'
import Navbar from '../components/Navbar'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>QuickFix AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>
      <div className="flex flex-col min-h-screen bg-background-dark text-white">
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <footer className="bg-background-light py-8 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-400">
            © 2024 QuickFix AI. All rights reserved.
          </div>
        </footer>
      </div>
    </SessionProvider>
  )
}

export default MyApp