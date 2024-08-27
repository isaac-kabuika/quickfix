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
    <ul className="space-y-4">
      {projects.map((project) => (
        <li key={project.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-light-smooth dark:shadow-md hover:shadow-light-sharp dark:hover:shadow-lg transition-shadow">
          <Link href={`/project/${project.id}`} className="block">
            <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-2">{project.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{project.github_repo}</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}