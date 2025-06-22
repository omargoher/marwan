import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authenticate, getUserRole, getUserDetails } from '../../services/auth';
import { UserLogin, UserDTO } from '../../types';

interface SignInProps {
  onSignIn: (user: any) => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [formData, setFormData] = useState<UserLogin>({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Authenticate user
      const loginResponse = await authenticate(formData.email, formData.password);

      if (loginResponse.status) {
        setMessage('Login successful!');
        console.log('Token:', loginResponse.data);

        // Get user role
        const roleResponse = await getUserRole();
        const userRole = roleResponse;

        // Get user details
        const userDetailsResponse = await getUserDetails();
        const userDetails: UserDTO = userDetailsResponse;

        // Create user object for the app
        const user = {
          id: userDetails.id?.toString() || '',
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName || '',
          role: userRole === 'ROLE_ADMIN' ? 'admin' : 
                userRole === 'ROLE_COMPANY' ? 'company' : 
                userRole === 'ROLE_EMPLOYEE' ? 'branch' : 'user',
          phone: userDetails.phone,
          address: userDetails.address ? {
            street: userDetails.address,
            city: userDetails.city || '',
            state: '',
            zipCode: ''
          } : undefined
        };

        // Call onSignIn with user data
        onSignIn(user);

        // Navigate based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'company') {
          navigate('/company');
        } else if (user.role === 'branch') {
          navigate('/branch');
        } else {
          navigate('/');
        }
      } else {
        setMessage('Login failed: Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className={`mb-4 ${message.includes('successful') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border px-4 py-3 rounded-lg flex items-center`}>
              <AlertCircle className="h-5 w-5 mr-2" />
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <div className="absolute right-3 top-2.5 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
