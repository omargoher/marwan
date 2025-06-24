import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, removeStoredToken } from '../services/auth';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const [showAuthError, setShowAuthError] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    if (!isAuthenticated()) {
      setShowAuthError(true);
    }
  }, []);

  const handleLoginRedirect = () => {
    removeStoredToken();
    navigate('/signin');
  };

  if (showAuthError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your session has expired or you need to login to access this feature.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <button
              onClick={handleLoginRedirect}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthErrorHandler; 