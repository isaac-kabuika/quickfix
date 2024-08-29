import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { getProject } from '../../services/projectService'
import { getBugReports, createBugReport, deleteBugReport, updateBugReport } from '../../services/bugReportService'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import ProtectedRoute from '../../components/ProtectedRoute'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

interface Bug {
  id: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
}

function ProjectPage() {
  const router = useRouter()
  const { projectId } = router.query
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBugs, setFilteredBugs] = useState<Bug[]>([])
  const [isCreatingBug, setIsCreatingBug] = useState(false)
  const [showReportBugPopup, setShowReportBugPopup] = useState(false)
  const reportBugButtonRef = useRef<HTMLButtonElement>(null)
  const reportBugPopupRef = useRef<HTMLDivElement>(null)
  const [expandedBugId, setExpandedBugId] = useState<string | null>(null)
  const [editedBug, setEditedBug] = useState<Bug | null>(null)
  const [selectedBugs, setSelectedBugs] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (projectId) {
      loadProjectAndBugs()
    }
  }, [projectId])

  useEffect(() => {
    const filtered = bugs.filter((bug) => 
      bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredBugs(filtered)
  }, [searchTerm, bugs])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportBugPopupRef.current && !reportBugPopupRef.current.contains(event.target as Node) &&
          reportBugButtonRef.current && !reportBugButtonRef.current.contains(event.target as Node)) {
        setShowReportBugPopup(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadProjectAndBugs = async () => {
    try {
      const projectData = await getProject(projectId as string)
      setProject(projectData)
      const bugsData = await getBugReports(projectId as string)
      setBugs(bugsData)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch project or bugs:', err)
      setError('Failed to load project data')
      setLoading(false)
    }
  }

  const handleBugCreated = async (newBug: { description: string }) => {
    if (isCreatingBug || !user || !project) return
    setIsCreatingBug(true)

    try {
      const createdBug = await createBugReport(project.id, newBug.description, user.id)
      setBugs(currentBugs => [createdBug, ...currentBugs])
      setShowReportBugPopup(false)
    } catch (error) {
      console.error('Error creating bug:', error)
      setError('Failed to create bug: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsCreatingBug(false)
    }
  }

  const handleBugDelete = async (bugId: string) => {
    if (confirm('Are you sure you want to delete this bug?')) {
      try {
        await deleteBugReport(bugId)
        setBugs(currentBugs => currentBugs.filter(bug => bug.id !== bugId))
      } catch (error) {
        console.error('Error deleting bug:', error)
        setError('Failed to delete bug')
      }
    }
  }

  const toggleBugSelection = (bugId: string, isCheckboxClick: boolean) => {
    setSelectedBugs(prev => {
      const newSet = new Set(prev)
      if (isCheckboxClick) {
        // For checkbox clicks, toggle the selection
        if (newSet.has(bugId)) {
          newSet.delete(bugId)
        } else {
          newSet.add(bugId)
        }
      } else {
        // For row clicks, select only this bug
        newSet.clear()
        newSet.add(bugId)
      }
      return newSet
    })
  }

  const expandBugRow = (bugId: string) => {
    if (expandedBugId === bugId) {
      setExpandedBugId(null)
      setEditedBug(null)
      setSelectedBugs(new Set())
    } else {
      setExpandedBugId(bugId)
      const selectedBug = bugs.find(bug => bug.id === bugId)
      setEditedBug(selectedBug || null)
      setSelectedBugs(new Set([bugId])) // Select only this bug
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBugs(new Set())
    } else {
      setSelectedBugs(new Set(filteredBugs.map(bug => bug.id)))
    }
    setSelectAll(!selectAll)
    setExpandedBugId(null)
    setEditedBug(null)
  }

  const handleSave = async () => {
    if (!editedBug) return
    try {
      const updatedBug = await updateBugReport(editedBug.id, editedBug)
      setBugs(currentBugs => currentBugs.map(bug => bug.id === updatedBug.id ? updatedBug : bug))
      setExpandedBugId(null)
      setEditedBug(null)
      setSelectedBugs(new Set())
    } catch (error) {
      console.error('Error updating bug:', error)
      setError('Failed to update bug')
    }
  }

  const handleBulkDelete = async () => {
    if (confirm('Are you sure you want to delete the selected bug(s)?')) {
      try {
        for (const bugId of Array.from(selectedBugs)) {
          await deleteBugReport(bugId)
        }
        setBugs(currentBugs => currentBugs.filter(bug => !selectedBugs.has(bug.id)))
        setSelectedBugs(new Set())
      } catch (error) {
        console.error('Error deleting bugs:', error)
        setError('Failed to delete bugs')
      }
    }
  }

  const handleRowClick = (bugId: string) => {
    expandBugRow(bugId)
  }

  const handleCancel = () => {
    setExpandedBugId(null)
    setEditedBug(null)
    setSelectedBugs(new Set())
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!project) return <div className="text-center">Project not found</div>

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 shadow-md flex items-center justify-between p-2 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{project?.name}</h1>
          <div className="relative w-56">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bugs..."
              className="w-full p-1 pl-8 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
            />
            <svg
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  ref={reportBugButtonRef}
                  onClick={() => setShowReportBugPopup(!showReportBugPopup)}
                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Fix Bug
                </button>
                {showReportBugPopup && (
                  <div 
                    ref={reportBugPopupRef}
                    className="absolute z-10 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="px-4 py-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Fix Bug</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const description = formData.get('description') as string;
                        handleBugCreated({ description });
                      }}>
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bug Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Describe the bug..."
                            className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                          disabled={isCreatingBug}
                        >
                          {isCreatingBug ? (
                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          )}
                          {isCreatingBug ? 'Reporting...' : 'Fix Bug'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              {selectedBugs.size > 0 && (
                <>
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div id="action-buttons" className="flex items-center space-x-2">
                    {selectedBugs.size === 1 && (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleBulkDelete}
                      className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Selected ({selectedBugs.size})
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <a 
          href={project?.github_repo} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>

      {error && <p className="text-red-500 p-2 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">{error}</p>}

      <div className="flex-grow overflow-auto">
        {filteredBugs.length === 0 ? (
          <div className="flex-grow flex items-center justify-center bg-white dark:bg-gray-800 h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">No Bugs Reported Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Start by reporting your first bug!</p>
              <button
                onClick={() => setShowReportBugPopup(true)}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Report Your First Bug
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="w-16 px-2 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-black dark:text-white bg-white dark:bg-gray-700 checked:bg-black dark:checked:bg-white focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-gray-200 dark:border-gray-600">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {filteredBugs.map((bug, index) => (
                  <React.Fragment key={bug.id}>
                    <tr 
                      className={`border-b border-gray-200 dark:border-gray-600 ${
                        selectedBugs.has(bug.id)
                          ? 'bg-white dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <td className="w-16 px-2 py-2 border-r border-gray-200 dark:border-gray-600 align-top">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedBugs.has(bug.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleBugSelection(bug.id, true);
                            }}
                            className="rounded border-gray-300 text-black dark:text-white bg-white dark:bg-gray-700 checked:bg-black dark:checked:bg-white focus:ring-black dark:focus:ring-white"
                          />
                        </div>
                      </td>
                      <td 
                        className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 align-top cursor-pointer"
                        onClick={() => handleRowClick(bug.id)}
                      >
                        {bug.description}
                      </td>
                      <td 
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 align-top cursor-pointer"
                        onClick={() => handleRowClick(bug.id)}
                      >
                        {bug.status}
                      </td>
                      <td 
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 align-top cursor-pointer"
                        onClick={() => handleRowClick(bug.id)}
                      >
                        {new Date(bug.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    {selectedBugs.has(bug.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td colSpan={4} className="px-4 py-2">
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-4">
                              <div className="flex-grow">
                                <label htmlFor={`bugDescription-${bug.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Description
                                </label>
                                <textarea
                                  id={`bugDescription-${bug.id}`}
                                  value={editedBug?.id === bug.id ? editedBug.description : bug.description}
                                  onChange={(e) => setEditedBug({...bug, description: e.target.value})}
                                  className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                  rows={3}
                                />
                              </div>
                              <div className="w-48">
                                <label htmlFor={`bugStatus-${bug.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Status
                                </label>
                                <select
                                  id={`bugStatus-${bug.id}`}
                                  value={editedBug?.id === bug.id ? editedBug.status : bug.status}
                                  onChange={(e) => setEditedBug({...bug, status: e.target.value})}
                                  className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                  <option value="open">Open</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {index < filteredBugs.length - 1 && (
                      <tr>
                        <td colSpan={4} className="border-t border-gray-200 dark:border-gray-600"></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProtectedRoute(ProjectPage)