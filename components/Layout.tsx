import React from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
        {children}
      </main>
    </div>
  )
}

export default Layout