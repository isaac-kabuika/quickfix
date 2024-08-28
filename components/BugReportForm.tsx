import { useState } from 'react'
import { createBugReport } from '../services/bugReportService'

interface BugReportFormProps {
  projectId: string
  userId: string  // Add this line
  onBugReportCreated: (bugReportId: string) => void
}

export default function BugReportForm({ projectId, userId, onBugReportCreated }: BugReportFormProps) {
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const bugReport = await createBugReport(projectId, description, userId)
      setDescription('')
      onBugReportCreated(bugReport.id)
    } catch (error) {
      console.error('Failed to create bug report:', error)
      setError('Failed to create bug report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the bug..."
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}