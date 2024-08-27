import { useEffect, useState } from 'react'
import { getProjectFiles } from '../services/projectService'
import sdk, { Project, VM } from '@stackblitz/sdk'

interface StackBlitzTesterProps {
  projectId: string
  userId: string
  bugLocations: string[]
}

interface ProjectFiles {
  [key: string]: { content: string }
}

export default function StackBlitzTester({ projectId, userId, bugLocations }: StackBlitzTesterProps) {
  const [files, setFiles] = useState<ProjectFiles | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjectFiles()
  }, [projectId, userId])

  const loadProjectFiles = async () => {
    try {
      const projectFiles = await getProjectFiles(projectId, userId)
      setFiles(projectFiles)
    } catch (err) {
      console.error('Failed to load project files:', err)
      setError('Failed to load project files. Please try again.')
    }
  }

  const launchStackBlitz = async () => {
    if (!files) return

    try {
      const project: Project = {
        files: Object.entries(files).reduce((acc, [key, value]) => {
          acc[key] = value.content
          return acc
        }, {} as Record<string, string>),
        title: 'Bug Locator Test',
        description: 'Testing environment for bug reproduction',
        template: 'node'
      }

      const vm = await sdk.embedProject('stackblitz-container', project, {
        openFile: bugLocations[0]?.split(':')[0] || 'index.js'
      })

      // Highlight potential bug locations
      bugLocations.forEach(location => {
        const [file, lineStr] = location.split(':')
        const line = parseInt(lineStr, 10)
        if (!isNaN(line) && file) {
          try {
            (vm.editor as any).setHighlights?.(file, [{ from: line, to: line }])
          } catch (err) {
            console.error(`Failed to set highlight for ${file}:${line}`, err)
          }
        }
      })
    } catch (err) {
      console.error('Failed to launch StackBlitz:', err)
      setError('Failed to launch StackBlitz. Please try again.')
    }
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>
  }

  return (
    <div>
      <button onClick={launchStackBlitz} disabled={!files}>
        {files ? 'Test in StackBlitz' : 'Loading files...'}
      </button>
      <div id="stackblitz-container" style={{ width: '100%', height: '500px' }}></div>
    </div>
  )
}