import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

interface ProjectListProps {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onDeleteProject }) => {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMoreClick = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActivePopup(activePopup === projectId ? null : projectId);
  };

  const handleDeleteClick = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      onDeleteProject(projectId);
    }
    setActivePopup(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Link href={`/projects/${project.id}`}>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer">
              {project.name}
            </h3>
          </Link>
          <p className="text-gray-600 dark:text-gray-400">{project.github_repo}</p>
          <div className="flex justify-between items-center mt-4">
            <Link href={`/projects/${project.id}`} className="text-primary-500 hover:text-primary-600">
              View Project
            </Link>
            <button
              onClick={(e) => handleMoreClick(project.id, e)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              More
            </button>
          </div>
          {activePopup === project.id && (
            <div ref={popupRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
              <button
                onClick={() => handleDeleteClick(project.id)}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Delete Project
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProjectList