import React, { useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string;
  name: string;
  github_repo: string;
}

interface ProjectListProps {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string, updatedFields: Partial<Project>) => void;
  selectedProjects: Set<string>;
  setSelectedProjects: React.Dispatch<React.SetStateAction<Set<string>>>;
  editingProjectId: string | null;
  setEditingProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  editedProjects: { [key: string]: Project };
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onDeleteProject, 
  onEditProject, 
  selectedProjects, 
  setSelectedProjects, 
  editingProjectId, 
  setEditingProjectId, 
  editedProjects 
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const toggleProjectSelection = (projectId: string, isCheckboxClick: boolean = false) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        if (!isCheckboxClick) {
          newSet.clear();
        }
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleRowClick = (projectId: string, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('td')?.classList.contains('checkbox-column')) {
      return;
    }
    toggleProjectSelection(projectId);
    setEditingProjectId(projectId);
  };

  return (
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
            <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">Project Name</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-gray-200 dark:border-gray-600">GitHub Repo</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800">
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <tr 
                className={`border-b border-gray-200 dark:border-gray-600 ${
                  selectedProjects.has(project.id)
                    ? 'bg-gray-50 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                } cursor-pointer`}
                onClick={(e) => handleRowClick(project.id, e)}
              >
                <td className="w-16 px-2 py-2 border-r border-gray-200 dark:border-gray-600 align-top checkbox-column">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => toggleProjectSelection(project.id, true)}
                      className="rounded border-gray-300 text-black dark:text-white bg-white dark:bg-gray-700 checked:bg-black dark:checked:bg-white focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </td>
                <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 align-top">
                  <Link href={`/projects/${project.id}`} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 align-top">
                  {project.github_repo}
                </td>
              </tr>
              {selectedProjects.has(project.id) && (
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={3} className="px-4 py-2">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editedProjects[project.id]?.name || project.name}
                        onChange={(e) => onEditProject(project.id, { name: e.target.value })}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      />
                      <input
                        type="text"
                        value={editedProjects[project.id]?.github_repo || project.github_repo}
                        onChange={(e) => onEditProject(project.id, { github_repo: e.target.value })}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectList