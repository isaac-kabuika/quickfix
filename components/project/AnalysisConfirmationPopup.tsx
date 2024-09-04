import React, { useState } from 'react';
import FileTree from './FileTree';
import { LightBulbIcon, ClipboardListIcon, CodeIcon } from '@heroicons/react/solid';

interface AnalysisConfirmationPopupProps {
  bugDescription: string;
  codeFiles: { path: string; content: string }[];
  sessionEvents: any[];
  onConfirm: (selectedFiles: string[]) => void;
  onCancel: () => void;
}

const AnalysisConfirmationPopup: React.FC<AnalysisConfirmationPopupProps> = ({
  bugDescription,
  codeFiles,
  sessionEvents,
  onConfirm,
  onCancel,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isCodeFilesExpanded, setIsCodeFilesExpanded] = useState(true);

  const handleFileSelect = (path: string) => {
    setSelectedFiles(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
            Confirm Analysis Data
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
              <ClipboardListIcon className="w-5 h-5 mr-2 text-blue-500" />
              Bug Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              {bugDescription}
            </p>
          </div>
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center cursor-pointer"
              onClick={() => setIsCodeFilesExpanded(!isCodeFilesExpanded)}
            >
              <CodeIcon className="w-5 h-5 mr-2 text-green-500" />
              Code Files ({codeFiles.length})
              <svg
                className={`w-5 h-5 ml-2 transform transition-transform ${isCodeFilesExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </h3>
            {isCodeFilesExpanded && (
              codeFiles.length > 0 ? (
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                  <FileTree
                    files={codeFiles}
                    selectedFiles={selectedFiles}
                    onFileSelect={handleFileSelect}
                  />
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No code files available.</p>
              )
            )}
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
              <ClipboardListIcon className="w-5 h-5 mr-2 text-purple-500" />
              Session Events
            </h3>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              {sessionEvents.length} events recorded
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedFiles)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            disabled={selectedFiles.length === 0}
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Confirm and Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConfirmationPopup;