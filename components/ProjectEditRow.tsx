import React from 'react'

interface ProjectEditRowProps {
  // ... existing props
  onCancel: () => void  // Add this new prop
}

export function ProjectEditRow({ 
  // ... existing props
  onCancel  // Add this to the destructured props
}: ProjectEditRowProps) {
  // ... existing state and functions

  return (
    <tr>
      {/* ... existing form fields */}
      <td>
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
      </td>
    </tr>
  )
}