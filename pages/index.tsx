import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../store/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <Head>
        <title>Docstrail - Automated Root Cause Analysis for Software Issues</title>
        <meta name="description" content="Automate root cause analysis for software production issues using AI-powered multi-source information correlation." />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex justify-center items-center mb-8">
          <Image src="/images/app-icon.svg" alt="Docstrail" width={64} height={64} className="mr-4" />
          <h1 className="text-5xl font-bold text-primary-600 dark:text-primary-400">Fix Issues Faster</h1>
        </div>
        <p className="text-2xl mb-12 text-center text-gray-700 dark:text-gray-300">
          Find the root cause of complex prod issues.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-primary-600 dark:text-primary-400 mb-8">Our Team's Background</h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-center">
              <Image src="/images/google-logo.png" alt="Google" width={100} height={33} />
            </div>
            <div className="text-center">
              <Image src="/images/vanguard-logo.png" alt="Vanguard" width={100} height={33} />
            </div>
            <div className="text-center">
              <Image src="/images/autodesk-logo.png" alt="Autodesk" width={100} height={33} />
            </div>
            <div className="text-center">
              <Image src="/images/wex-logo.png" alt="Wex" width={50} height={33} />
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          {!user ? (
            <div className="space-x-4">
              <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full transition-colors inline-flex items-center">
                Start Fixing Issues
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/how-it-works" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
                How It Works
              </Link>
            </div>
          ) : (
            <Link href="/dashboard" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
              Go to Dashboard
            </Link>
          )}
        </div>

        <div className="mb-16">
          {/* <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-8">See Docstrail in Action</h2> */}
          <div className="relative mx-auto max-w-4xl">
            <Image
              src="/images/docstrail-demo.png"
              alt="Docstrail Demo"
              width={1200}
              height={675}
              className="rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700"
            />
            <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none border border-white dark:border-gray-600 opacity-50"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
            Experience how Docstrail streamlines root cause analysis for your software issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-subtle dark:shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/ai-analysis.svg" alt="Multi-Source Data Collection" width={100} height={100} className="text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-600 dark:text-secondary-400 text-center">Multi-Source Data</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">Gather information from logs, codebase, and more.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-subtle dark:shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/guided-fix.svg" alt="AI-Powered Correlation" width={100} height={100} className="text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-600 dark:text-secondary-400 text-center">AI-Powered Correlation</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">Relate information using advanced LLMs for quick insights.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-subtle dark:shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/git-branch.svg" alt="Rapid Root Cause Identification" width={100} height={100} className="text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-600 dark:text-secondary-400 text-center">Root Cause Identification</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">Quickly pinpoint the source of production issues.</p>
          </div>
        </div>
      </main>
    </>
  )
}