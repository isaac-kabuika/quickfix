import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisResultPopupProps {
  analysisResult: string;
  onAccept: () => void;
  onReject: () => void;
}

const AnalysisResultPopup: React.FC<AnalysisResultPopupProps> = ({ analysisResult, onAccept, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Analysis Result</h2>
        <div className="prose dark:prose-invert max-w-none mb-6">
          <ReactMarkdown>{analysisResult}</ReactMarkdown>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onReject}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPopup;