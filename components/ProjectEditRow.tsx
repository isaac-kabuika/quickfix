import React, { useState } from 'react'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

interface ProjectEditRowProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  onCancel: () => void;
}

export function ProjectEditRow({ project, onSave, onCancel }: ProjectEditRowProps) {
  const [editedProject, setEditedProject] = useState(project);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedProject);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editedProject.name}
        onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
        className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
      />
      <input
        type="text"
        value={editedProject.github_repo}
        onChange={(e) => setEditedProject({ ...editedProject, github_repo: e.target.value })}
        className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
      />
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}