import React, { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/solid';

interface FileTreeProps {
  files: { path: string; content: string }[];
  selectedFiles: string[];
  onFileSelect: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, selectedFiles, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderTree = (path: string = '', level: number = 0) => {
    const currentFiles = files.filter(file => file.path.startsWith(path) && file.path.split('/').length === level + 1);
    const currentFolders = Array.from(new Set(files
      .filter(file => file.path.startsWith(path) && file.path.split('/').length > level + 1)
      .map(file => file.path.split('/')[level])
    ));

    return (
      <ul className={`${level > 0 ? 'ml-4' : ''}`}>
        {currentFolders.map(folder => (
          <li key={folder} className="my-1">
            <div
              className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => toggleFolder(`${path}${folder}/`)}
            >
              <ChevronRightIcon 
                className={`w-4 h-4 mr-1 text-gray-500 transition-transform duration-200 ${
                  expandedFolders.has(`${path}${folder}/`) ? 'transform rotate-90' : ''
                }`}
              />
              <span className="text-sm font-medium">{folder}</span>
            </div>
            {expandedFolders.has(`${path}${folder}/`) && renderTree(`${path}${folder}/`, level + 1)}
          </li>
        ))}
        {currentFiles.map(file => (
          <li key={file.path} className="my-1 ml-5">
            <label className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.path)}
                onChange={() => onFileSelect(file.path)}
                className="mr-2 form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out"
              />
              <span className="text-sm">{file.path.split('/').pop()}</span>
            </label>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
      {renderTree()}
    </div>
  );
};

export default FileTree;