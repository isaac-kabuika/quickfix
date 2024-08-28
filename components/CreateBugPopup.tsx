import React, { useState } from 'react'

interface CreateBugPopupProps {
  onClose: () => void
  onBugCreated: (bug: { description: string }) => void
  isCreating: boolean
}

export default function CreateBugPopup({ onClose, onBugCreated, isCreating }: CreateBugPopupProps) {
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onBugCreated({ description })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-light-smooth dark:shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Create New Bug</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the bug..."
            required
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isCreating}
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}