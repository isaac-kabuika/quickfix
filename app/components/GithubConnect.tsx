import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function GithubConnect() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await signIn('github', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect GitHub'}
    </button>
  );
}