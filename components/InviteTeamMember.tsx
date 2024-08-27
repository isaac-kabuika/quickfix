import { useState } from 'react'
import { inviteTeamMember } from '../services/projectService'

interface InviteTeamMemberProps {
  projectId: string;
}

export default function InviteTeamMember({ projectId }: InviteTeamMemberProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await inviteTeamMember(projectId, email)
      setEmail('')
      setSuccess(true)
    } catch (err) {
      setError('Failed to invite team member')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleInvite}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Team member's email"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Inviting...' : 'Invite'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Invitation sent successfully!</p>}
    </form>
  )
}