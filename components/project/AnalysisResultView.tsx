import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface AnalysisResultViewProps {
  analysisResult: string;
  onAccept: () => void;
  onReject: () => void;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ analysisResult, onAccept, onReject }) => {
  return (
    <div>
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={github}
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
            },
          }}
        >
          {analysisResult}
        </ReactMarkdown>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={onReject} className="px-3 py-1 text-sm rounded-md border">
          Reject
        </button>
        <button onClick={onAccept} className="px-3 py-1 text-sm rounded-md border">
          Accept
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultView;