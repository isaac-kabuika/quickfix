import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

export default function WelcomePage() {
  return (
    <>
      <Head>
        <title>QuickFix AI - Empower Non-Technical Teams to Fix Bugs</title>
        <meta name="description" content="Empower non-technical product owners to fix small bugs themselves. No more waiting for an engineer." />
        <link rel="icon" href="/images/app-icon.svg" type="image/svg+xml" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        {/* ... (rest of the welcome page content) ... */}
      </main>
    </>
  )
}