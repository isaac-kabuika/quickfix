import { useEffect, useState } from 'react'
import { getDependencyGraph } from '../services/dependencyService'

interface DependencyGraphProps {
  projectId: string;
}

export default function DependencyGraph({ projectId }: DependencyGraphProps) {
  const [graph, setGraph] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDependencyGraph()
  }, [projectId])

  const loadDependencyGraph = async () => {
    try {
      const graphData = await getDependencyGraph(projectId)
      setGraph(graphData)
    } catch (err) {
      setError('Failed to load dependency graph')
      console.error(err)
    }
  }

  if (error) return <div>Error: {error}</div>
  if (!graph) return <div>Loading dependency graph...</div>

  // Implement visualization logic here (e.g., using a library like vis.js or d3.js)
  return <div>Dependency Graph Visualization</div>
}