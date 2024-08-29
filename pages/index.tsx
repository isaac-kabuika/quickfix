import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../store/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <Head>
        <title>QuickFix AI - Empower Non-Technical Teams to Fix Bugs</title>
        <meta name="description" content="Empower non-technical product owners to fix small bugs themselves. No more waiting for an engineer." />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex justify-center items-center mb-8">
          <Image src="/images/app-icon.svg" alt="QuickFix AI" width={64} height={64} className="mr-4" />
          <h1 className="text-5xl font-bold text-primary-600 dark:text-primary-400">Fix Bugs Without Code</h1>
        </div>
        <p className="text-2xl mb-12 text-center text-gray-700 dark:text-gray-300">
          Empower your non-technical owners to fix small bugs instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-subtle dark:shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/ai-analysis.svg" alt="AI-powered Bug Analysis" width={100} height={100} className="text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-600 dark:text-secondary-400 text-center">AI-powered Bug Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">Our AI troubleshoots the issue you're facing.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-subtle dark:shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/guided-fix.svg" alt="Guided Fix Suggestions" width={100} height={100} className="text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-600 dark:text-secondary-400 text-center">No-Code Fixes</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">Receive suggestions tailored for non-technical users.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-subtle dark:shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/git-branch.svg" alt="Automatic Deployment" width={100} height={100} className="text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-600 dark:text-secondary-400 text-center">Easy Deployment</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">Apply fixes to your live app with a single click.</p>
          </div>
        </div>

        <div className="text-center mb-16">
          {!user ? (
            <div className="space-x-4">
              <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full transition-colors inline-flex items-center">
                Start Fixing Bugs
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
          <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-8">Our Team's Background</h2>
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
          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
            Our team brings expertise from leading tech companies to help you move faster.
          </p>
        </div>
      </main>
    </>
  )
}