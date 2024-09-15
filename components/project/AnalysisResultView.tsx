import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        nodeSpacing: 50,
        rankSpacing: 100,
        curve: 'basis',
        htmlLabels: true,
      },
      fontSize: 16,
    });

    const renderChart = async () => {
      if (ref.current && typeof window !== 'undefined') {
        try {
          const modifiedChart = chart.replace(/graph LR/, 'graph TD');
          // Escape double quotes in the chart string
          const escapedChart = modifiedChart//.replace(/"/g, '\\"');
          const { svg } = await mermaid.render('mermaid-svg', escapedChart);
          
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;
          
          const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number);
          if (viewBox) {
            const scale = 1.5;
            const newWidth = viewBox[2] * scale;
            const newHeight = viewBox[3] * scale;
            svgElement.setAttribute('width', `${newWidth}`);
            svgElement.setAttribute('height', `${newHeight}`);
            svgElement.setAttribute('style', `max-width: 100%; height: auto;`);
          }
          
          setSvg(svgElement.outerHTML);
        } catch (error) {
          console.error('Error rendering Mermaid chart:', error);
          setSvg('<p>Error rendering chart</p>');
        }
      }
    };
    renderChart();
  }, [chart]);

  return (
    <div 
      ref={ref} 
      dangerouslySetInnerHTML={{ __html: svg }} 
      className="mermaid-diagram"
    />
  );
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