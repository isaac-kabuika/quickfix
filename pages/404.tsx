import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/navigation/Navbar'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | QuickFix AI</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center">
          <Image src="/images/app-icon.svg" alt="QuickFix AI" width={100} height={100} className="mb-8" />
          <h1 className="text-5xl font-bold mb-4 text-primary-400">404 - Page Not Found</h1>
          <p className="text-2xl mb-8 text-center text-gray-300">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link href="/" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
            Go Back Home
          </Link>
        </div>
      </main>
    </>
  )
}