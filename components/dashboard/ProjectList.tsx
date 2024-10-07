import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/solid'

interface Project {
  id: string;
  name: string;
  github_repo: string;
  env: string | null;
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
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const [expandedEnvFields, setExpandedEnvFields] = useState<Set<string>>(new Set());

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

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    Object.values(textareaRefs.current).forEach(textarea => {
      if (textarea) adjustTextareaHeight(textarea);
    });
  }, [selectedProjects, editedProjects]);

  const handleEnvChange = (projectId: string, value: string) => {
    onEditProject(projectId, { env: value });
    const textarea = textareaRefs.current[projectId];
    if (textarea) adjustTextareaHeight(textarea);
  };

  const toggleEnvField = (projectId: string) => {
    setExpandedEnvFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="w-12 px-2 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-black dark:text-white bg-white dark:bg-gray-700 checked:bg-black dark:checked:bg-white focus:ring-black dark:focus:ring-white"
                />
              </div>
            </th>
            <th className="w-1/3 px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-r border-gray-200 dark:border-gray-600">Project Name</th>
            <th className="w-2/3 px-4 py-2 text-left text-xs font-bold text-black dark:text-gray-300 tracking-wider border-b border-gray-200 dark:border-gray-600">GitHub Repo</th>
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
                <td className="w-12 px-2 py-2 border-r border-gray-200 dark:border-gray-600 align-top checkbox-column">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => toggleProjectSelection(project.id, true)}
                      className="rounded border-gray-300 text-black dark:text-white bg-white dark:bg-gray-700 checked:bg-black dark:checked:bg-white focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </td>
                <td className="w-1/3 px-4 py-2 border-r border-gray-200 dark:border-gray-600 align-top">
                  <div className="flex items-center justify-between">
                    <Link href={`/projects/${project.id}/story`} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                      {project.name}
                    </Link>
                    <Link
                      href={`/projects/${project.id}/story`}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </td>
                <td className="w-2/3 px-4 py-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 align-top">
                  {project.github_repo}
                </td>
              </tr>
              {selectedProjects.has(project.id) && (
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={3} className="px-4 py-4">
                    <div className="space-y-4 max-w-2xl">
                      <div>
                        <label htmlFor={`project-name-${project.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Name
                        </label>
                        <input
                          id={`project-name-${project.id}`}
                          type="text"
                          value={editedProjects[project.id]?.name || project.name}
                          onChange={(e) => onEditProject(project.id, { name: e.target.value })}
                          className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label htmlFor={`github-repo-${project.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          GitHub Repo
                        </label>
                        <input
                          id={`github-repo-${project.id}`}
                          type="text"
                          value={editedProjects[project.id]?.github_repo || project.github_repo}
                          onChange={(e) => onEditProject(project.id, { github_repo: e.target.value })}
                          className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor={`env-vars-${project.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Environment Variables
                          </label>
                          <button
                            onClick={() => toggleEnvField(project.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {expandedEnvFields.has(project.id) ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                        {expandedEnvFields.has(project.id) ? (
                          <textarea
                            id={`env-vars-${project.id}`}
                            ref={(el) => {
                              textareaRefs.current[project.id] = el;
                              if (el) adjustTextareaHeight(el);
                            }}
                            value={editedProjects[project.id]?.env || project.env || ''}
                            onChange={(e) => handleEnvChange(project.id, e.target.value)}
                            className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm"
                            style={{ 
                              minHeight: '100px',
                              resize: 'none',
                              overflow: 'hidden'
                            }}
                            placeholder="KEY1=value1&#10;KEY2=value2"
                            spellCheck="false"
                          />
                        ) : (
                          <div className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 font-mono text-sm">
                            {(editedProjects[project.id]?.env || project.env || '').split('\n').slice(0, 2).join('\n')}
                            {(editedProjects[project.id]?.env || project.env || '').split('\n').length > 2 && '...'}
                          </div>
                        )}
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Enter one environment variable per line in the format KEY=value
                        </p>
                      </div>
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