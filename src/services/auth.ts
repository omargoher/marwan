import axios from 'axios';
import { authApi } from './api';
import { UserDTO, UserCompanyDTO, ApiResponse } from '../types';

const API_URL = 'http://localhost:8080/api/';

const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authAxios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token; // API expects 'token' header, not 'Authorization'
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentUser');
      // Don't redirect immediately, let the component handle it
      return Promise.reject(new Error('Authentication failed. Please login again.'));
    }
    return Promise.reject(error);
  }
);

export const authenticate = async (email: string, password: string): Promise<ApiResponse<string>> => {
  try {
    const response = await authApi.login({ email, password });
    
    if (response.status) {
      // Store the token
      localStorage.setItem('token', response.data);
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return false;
    }
    
    // Try to get user details to validate token
    const response = await authApi.getUserDetails();
    return response.status;
  } catch (error) {
    console.error('Token validation error:', error);
    // Clear invalid token
    removeStoredToken();
    return false;
  }
};

export const getUserRole = async (): Promise<string> => {
  try {
    const token = getStoredToken();
    if (!token) throw new Error('No token found');
    
    const response = await authApi.getUserRole({ token });
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to get user role');
    }
  } catch (error) {
    console.error('Get user role error:', error);
    throw error;
  }
};

export const getUserDetails = async (): Promise<UserDTO> => {
  try {
    const response = await authApi.getUserDetails();
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to get user details');
    }
  } catch (error) {
    console.error('Get user details error:', error);
    throw error;
  }
};

export const updateUserDetails = async (userData: UserDTO, currentPassword: string): Promise<UserDTO> => {
  try {
    const response = await authApi.updateUserDetails(userData, currentPassword);
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to update user details');
    }
  } catch (error) {
    console.error('Update user details error:', error);
    throw error;
  }
};

export const checkPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await authApi.checkPassword(password);
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to check password');
    }
  } catch (error) {
    console.error('Check password error:', error);
    throw error;
  }
};

export const signUpClient = async (userData: UserDTO): Promise<UserDTO> => {
  try {
    const response = await authApi.signUpForClient(userData);
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to sign up client');
    }
  } catch (error) {
    console.error('Sign up client error:', error);
    throw error;
  }
};

export const signUpCompany = async (userData: UserCompanyDTO): Promise<UserCompanyDTO> => {
  try {
    const response = await authApi.signUpForCompany(userData);
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to sign up company');
    }
  } catch (error) {
    console.error('Sign up company error:', error);
    throw error;
  }
};

export const signUpCompanyEmployee = async (userData: UserDTO, branchId: number): Promise<UserDTO> => {
  try {
    const response = await authApi.signUpForCompanyEmployee(userData, branchId);
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to sign up company employee');
    }
  } catch (error) {
    console.error('Sign up company employee error:', error);
    throw error;
  }
};

export const signUpAdmin = async (userData: UserDTO, password: string): Promise<UserDTO> => {
  try {
    const response = await authApi.signUpForAdmin(userData, password);
    if (response.status) {
    return response.data;
    } else {
      throw new Error('Failed to sign up admin');
    }
  } catch (error) {
    console.error('Sign up admin error:', error);
    throw error;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeStoredToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const isAuth = localStorage.getItem('isAuthenticated');
  return !!(token && isAuth === 'true');
};

export const ensureAuthenticated = async (): Promise<boolean> => {
  if (!isAuthenticated()) {
    return false;
  }
  
  // Validate token with server
  const isValid = await validateToken();
  if (!isValid) {
    removeStoredToken();
    return false;
  }
  
  return true;
};

export default authAxios;