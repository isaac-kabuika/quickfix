import React from 'react';

const LightningAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full opacity-25 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="relative flex items-center justify-center w-full h-full">
          <svg 
            className="w-12 h-12 text-gray-600 dark:text-gray-300" 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M13 10V3L4 14H11V21L20 10H13Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <animate
                attributeName="stroke-dasharray"
                from="0 100"
                to="100 100"
                dur="1.5s"
                begin="0s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Analyzing...
      </p>
    </div>
  );
};

export default LightningAnimation;