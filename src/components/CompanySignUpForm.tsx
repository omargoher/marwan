import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, AlertCircle, Eye, EyeOff, Building, MapPin } from 'lucide-react';
import { User as UserType } from '../types';
import authAxios from '../services/auth';

interface CompanySignUpFormProps {
  onSignIn: (user: UserType) => void;
}

export default function CompanySignUpForm({ onSignIn }: CompanySignUpFormProps) {
  const [formData, setFormData] = useState({
    branchName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    branchState: true,
    branchId: 0
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Log the request data
      console.log('Sending company signup request with data:', {
        branchName: formData.branchName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        branchState: formData.branchState,
        branchId: formData.branchId
      });

      const companyData = {
        branchName: formData.branchName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        branchState: formData.branchState,
        branchId: formData.branchId
      };

      const response = await authAxios.post('http://localhost:8080/api/company/create', companyData);
      console.log('Company account created:', response.data);
      onSignIn(response.data);
      navigate('/company/dashboard');
    } catch (err: any) {
      console.error('Error creating company account:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 400) {
        setError(`Invalid data: ${err.response.data?.message || 'Please check your input.'}`);
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please try again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create a company account.');
      } else {
        setError(err.response?.data?.message || 'Failed to create company account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          id="branchName"
          name="branchName"
          value={formData.branchName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
          ZIP Code
        </label>
        <input
          type="text"
          id="zip"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Company Account'}
        </button>
      </div>
    </form>
  );
} 