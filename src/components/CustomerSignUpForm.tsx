import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';

interface CustomerSignUpFormProps {
  onSignIn: (user: UserType) => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function CustomerSignUpForm({ onSignIn }: CustomerSignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // For customer accounts, we'll simulate an API call for now.
      // In a real application, you'd call a backend API for user registration.
      /*
      const response = await authAxios.post('http://localhost:8080/api/user/create', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password
      });

      if (response.data.status) {
        const newUser: UserType = {
          id: response.data.data.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'user',
          phone: formData.phone
        };
        onSignIn(newUser);
        navigate('/');
      } else {
        setError(response.data.message || 'Failed to create customer account');
      }
      */

      // Simulate API call success (current behavior)
      const newUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'user',
        phone: formData.phone
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      onSignIn(newUser);
      navigate('/');

    } catch (error: unknown) {
      console.error('Customer registration error:', error);
      const apiError = error as ApiError;
      setError(apiError.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <div className="mt-1 relative">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <div className="mt-1 relative">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

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
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <div className="mt-1 relative">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
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
            required
            value={formData.password}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-20"
          />
          <div className="absolute right-3 top-2.5 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-20"
          />
          <div className="absolute right-3 top-2.5 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {loading ? 'Creating Customer Account...' : 'Create Customer Account'}
        </button>
      </div>
    </form>
  );
} 