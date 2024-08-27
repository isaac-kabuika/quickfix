import { useState } from 'react';
import { GithubConnectionError } from './GithubConnectionError';

// Define an interface for the project data
interface ProjectData {
  // Add appropriate properties here
  // For example: name: string; description: string; etc.
}

export function CreateProject() {
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = async (projectData: ProjectData) => {
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      // Handle successful project creation
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      {error && <GithubConnectionError error={error} />}
      {/* Your project creation form */}
    </div>
  );
}