import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';

interface AnalysisResultViewProps {
  analysisResult: string;
  onAccept: () => void;
  onReject: () => void;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ analysisResult, onAccept, onReject }) => {
  return (
    <div>
      <div className="mb-6 overflow-auto prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {analysisResult}
        </ReactMarkdown>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={onReject}
          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
        <button
          onClick={onAccept}
          className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Accept
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultView;