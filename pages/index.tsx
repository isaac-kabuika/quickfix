import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../store/hooks/useAuth'
import { useState } from 'react'

export default function Home() {
  const { user } = useAuth()
  const [showVideo, setShowVideo] = useState(false)

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
          <h1 className="text-5xl font-bold text-gray-800">Fix Issues Faster</h1>
        </div>
        <p className="text-2xl mb-12 text-center text-gray-600">
          Find the root cause of complex prod issues.
        </p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Our Team's Background</h2>
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
              <Link href="/auth" className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full transition-colors inline-flex items-center">
                Start Fixing Issues
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <button
                onClick={() => setShowVideo(true)}
                className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-full transition-colors"
              >
                Watch Demo
              </button>
            </div>
          ) : (
            <Link href="/dashboard" className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full transition-colors">
              Go to Dashboard
            </Link>
          )}
        </div>

        <div className="mb-16">
          <div className="relative mx-auto max-w-4xl">
            <Image
              src="/images/docstrail-demo.png"
              alt="Docstrail Demo"
              width={1200}
              height={675}
            />
            <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none border border-white opacity-50"></div>
          </div>
        </div>
      </main>

      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/PCYphUozhY0" 
                title="Docstrail demo" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  )
}