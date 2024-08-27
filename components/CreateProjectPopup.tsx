import React, { useState, useCallback } from 'react'
import { createProject } from '../services/projectService'
import { debounce } from 'lodash' // Make sure to install lodash if not already installed

interface CreateProjectPopupProps {
  onClose: () => void
  onProjectCreated: (project: any) => void
  userId: string
  isCreating: boolean
}

export default function CreateProjectPopup({ onClose, onProjectCreated, userId, isCreating }: CreateProjectPopupProps) {
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectRepo, setNewProjectRepo] = useState('')
  const [error, setError] = useState('')

  const debouncedCreateProject = useCallback(
    debounce(async (projectData) => {
      try {
        const newProject = await createProject(projectData)
        onProjectCreated(newProject)
        onClose()
      } catch (err: any) {
        console.error('Error creating project:', err)
        setError(err.message || 'Failed to create project. Please try again.')
      }
    }, 300),
    [onProjectCreated, onClose]
  )

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreating) return // Prevent multiple submissions

    setError('')
    debouncedCreateProject({
      name: newProjectName,
      owner_id: userId,
      github_repo: newProjectRepo,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-light-smooth dark:shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Create New Project</h2>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project Name"
            required
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          />
          <input
            type="text"
            value={newProjectRepo}
            onChange={(e) => setNewProjectRepo(e.target.value)}
            placeholder="GitHub Repo URL"
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
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>
    </div>
  )
}