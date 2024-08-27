import Link from 'next/link'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>
          <Link href={`/project/${project.id}`}>
            {project.name} - {project.github_repo}
          </Link>
        </li>
      ))}
    </ul>
  )
}