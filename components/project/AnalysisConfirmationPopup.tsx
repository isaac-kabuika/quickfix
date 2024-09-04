import React, { useState } from 'react';
import FileTree from './FileTree';

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
  // Initialize selectedFiles as an empty array
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isCodeFilesExpanded, setIsCodeFilesExpanded] = useState(true);

  const handleFileSelect = (path: string) => {
    setSelectedFiles(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Confirm Analysis Data</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Bug Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{bugDescription}</p>
        </div>
        <div className="mb-4">
          <h3 
            className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300 cursor-pointer flex items-center"
            onClick={() => setIsCodeFilesExpanded(!isCodeFilesExpanded)}
          >
            <span className="mr-2">{isCodeFilesExpanded ? '▼' : '▶'}</span>
            Code Files ({codeFiles.length})
          </h3>
          {isCodeFilesExpanded && (
            codeFiles.length > 0 ? (
              <FileTree
                files={codeFiles}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No code files available.</p>
            )
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Session Events</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{sessionEvents.length} events recorded</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedFiles)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={selectedFiles.length === 0} // Disable if no files are selected
          >
            Confirm and Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConfirmationPopup;