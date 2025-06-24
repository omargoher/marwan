import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeStoredToken } from '../services/auth';

interface AuthError {
  name?: string;
  message?: string;
}

export const useAuthError = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthError = useCallback((error: AuthError) => {
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication failed')) {
      setAuthError('Authentication failed. Please login again.');
      // Clear tokens and redirect after a short delay
      setTimeout(() => {
        removeStoredToken();
        navigate('/signin');
      }, 2000);
      return true;
    }
    return false;
  }, [navigate]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const AuthErrorDisplay = () => {
    if (!authError) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{authError}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={clearAuthError}
              className="inline-flex text-red-400 hover:text-red-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    authError,
    handleAuthError,
    clearAuthError,
    AuthErrorDisplay
  };
}; 