import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    const renderChart = async () => {
      if (ref.current && typeof window !== 'undefined') {
        try {
          const { svg } = await mermaid.render('mermaid-svg', chart);
          setSvg(svg);
        } catch (error) {
          console.error('Error rendering Mermaid chart:', error);
          setSvg('<p>Error rendering chart</p>');
        }
      }
    };
    renderChart();
  }, [chart]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />;
};

interface AnalysisResultViewProps {
  mermaidDiagram: string;
  onAccept: () => void;
  onReject: () => void;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ mermaidDiagram, onAccept, onReject }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="w-full overflow-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <Mermaid chart={mermaidDiagram} />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button 
          onClick={onReject} 
          className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Reject
        </button>
        <button 
          onClick={onAccept} 
          className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultView;