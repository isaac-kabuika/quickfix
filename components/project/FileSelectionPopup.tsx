import React, { useState } from 'react';

interface FileSelectionPopupProps {
  files: string[];
  onConfirm: (selectedFiles: string[]) => void;
  onCancel: () => void;
}

const FileSelectionPopup: React.FC<FileSelectionPopupProps> = ({ files, onConfirm, onCancel }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleSubmit = () => {
    onConfirm(selectedFiles);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Select Files for Analysis</h2>
        <div className="mb-4">
          {files.map((file) => (
            <div key={file} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={file}
                checked={selectedFiles.includes(file)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFiles([...selectedFiles, file]);
                  } else {
                    setSelectedFiles(selectedFiles.filter((f) => f !== file));
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={file} className="text-gray-700 dark:text-gray-300">{file}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileSelectionPopup;