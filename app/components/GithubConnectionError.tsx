import { useState, useEffect } from 'react';
import { GithubConnect } from './GithubConnect';

export function GithubConnectionError({ error }: { error: string }) {
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowError(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!showError) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">GitHub Connection Error: </strong>
      <span className="block sm:inline">{error}</span>
      <GithubConnect />
    </div>
  );
}