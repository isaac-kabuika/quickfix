import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <Head>
        <title>QuickFix AI - Empower Non-Technical Teams to Fix Bugs</title>
        <meta name="description" content="Empower non-technical product owners to fix small bugs themselves. No more waiting for an engineer." />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center mb-8">
          <Image src="/images/app-icon.svg" alt="QuickFix AI" width={64} height={64} className="mr-4" />
          <h1 className="text-5xl font-bold text-primary-400">Welcome to QuickFix AI</h1>
        </div>
        <p className="text-2xl mb-12 text-center text-gray-300">
          Empower your non-technical team to fix small bugs instantly. No more waiting for engineers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-background-light p-6 rounded-lg shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/ai-analysis.svg" alt="AI-powered Bug Analysis" width={100} height={100} />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-400 text-center">AI-powered Bug Analysis</h2>
            <p className="text-gray-400 text-center">Our AI quickly identifies and explains bugs in simple, non-technical language.</p>
          </div>
          <div className="bg-background-light p-6 rounded-lg shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/guided-fix.svg" alt="Guided Fix Suggestions" width={100} height={100} />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-400 text-center">No-Code Fixes</h2>
            <p className="text-gray-400 text-center">Receive bug-fix suggestions, tailored for non-technical users.</p>
          </div>
          <div className="bg-background-light p-6 rounded-lg shadow-neon">
            <div className="mb-4 flex justify-center">
              <Image src="/images/no-code.svg" alt="Automatic Deployment" width={100} height={100} />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-secondary-400 text-center">Automatic Deployment</h2>
            <p className="text-gray-400 text-center">We deploy the fix to your live app automatically, no technical knowledge necessary.</p>
          </div>
        </div>

        <div className="text-center mb-16">
          {!user ? (
            <div className="space-x-4">
              <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
                Start Fixing Bugs
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

        {/* New section for team background */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-primary-400 mb-8">Our Team's Background</h2>
          <div className="flex justify-center items-center space-x-12">
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
          <p className="text-center text-gray-300 mt-4">
            Our team brings expertise from leading tech companies to revolutionize bug fixing.
          </p>
        </div>
      </main>
    </>
  )
}