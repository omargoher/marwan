import axios from 'axios';
import { getStoredToken, ensureAuthenticated } from './auth';
import {
  ApiResponse,
  UserDTO,
  UserCompanyDTO,
  UserLogin,
  TokenDTO,
  Drugs,
  InventoryDrug,
  Category,
  ActiveIngredient,
  Company,
  CompanyDTO,
  BranchDTO,
  BranchWithEmployeesDTO,
  Item,
  Cart,
  Order,
  RequestDTO,
  Wishlist,
  LogHistory,
  DrugResponseDto,
  DrugResponseDetailsDto,
  User
} from '../types';

const BASE_URL = 'http://localhost:8080/api/';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.token = token; // API expects 'token' header, not 'Authorization'
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('API Authentication failed - clearing tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentUser');
      
      // Create a more specific error message
      const authError = new Error('Authentication failed. Please login again.');
      authError.name = 'AuthenticationError';
      return Promise.reject(authError);
    }
    return Promise.reject(error);
  }
);

// Helper function for authenticated API calls
const authenticatedApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  const isAuth = await ensureAuthenticated();
  if (!isAuth) {
    throw new Error('Authentication failed. Please login again.');
  }
  return apiCall();
};

// Auth API
export const authApi = {
  login: async (credentials: UserLogin): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>('/login', credentials);
    return response.data;
  },

  getUserRole: async (token: TokenDTO): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>('/user/role', token);
    return response.data;
  },

  getUserDetails: async (): Promise<ApiResponse<UserDTO>> => {
    const response = await api.get<ApiResponse<UserDTO>>('/user/details');
    return response.data;
  },

  updateUserDetails: async (userData: UserDTO, currentPassword: string): Promise<ApiResponse<UserDTO>> => {
    const response = await api.put<ApiResponse<UserDTO>>(`/user/update-details?currentPassword=${currentPassword}`, userData);
    return response.data;
  },

  checkPassword: async (password: string): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>('/user/password-check', password);
    return response.data;
  },

  deleteEmployee: async (employeeId: number): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>(`/user/delete/employee/${employeeId}`);
    return response.data;
  }
};

// Signup API
export const signupApi = {
  signUpForClient: async (userData: UserDTO): Promise<ApiResponse<UserDTO>> => {
    const response = await api.post<ApiResponse<UserDTO>>('/signup/client', userData);
    return response.data;
  },

  signUpForCompany: async (userData: UserCompanyDTO): Promise<ApiResponse<UserCompanyDTO>> => {
    const response = await api.post<ApiResponse<UserCompanyDTO>>('/signup/company', userData);
    return response.data;
  },

  signUpForCompanyEmployee: async (userData: UserDTO, branchId: number): Promise<ApiResponse<UserDTO>> => {
    const response = await api.post<ApiResponse<UserDTO>>(`/signup/company/employee?branchId=${branchId}`, userData);
    return response.data;
  },

  signUpForAdmin: async (userData: UserDTO, password: string): Promise<ApiResponse<UserDTO>> => {
    const response = await api.post<ApiResponse<UserDTO>>(`/signup/create/admin?password=${password}`, userData);
    return response.data;
  }
};

// Drugs API
export const drugsApi = {
  getAllDrugs: async (): Promise<ApiResponse<Drugs[]>> => {
    const response = await api.get<ApiResponse<Drugs[]>>('/drugs');
    return response.data;
  },

  getDrugById: async (id: string): Promise<ApiResponse<Drugs>> => {
    const response = await api.get<ApiResponse<Drugs>>(`/drugs/${id}`);
    return response.data;
  },

  searchDrugsByName: async (name: string): Promise<ApiResponse<Drugs[]>> => {
    const response = await api.get<ApiResponse<Drugs[]>>(`/drugs/search?name=${name}`);
    return response.data;
  },

  addDrugToMain: async (drug: Drugs): Promise<ApiResponse<Drugs>> => {
    return authenticatedApiCall(async () => {
      const response = await api.post<ApiResponse<Drugs>>('/drugs/add', drug);
      return response.data;
    });
  },

  updateDrug: async (id: string, drug: Drugs): Promise<ApiResponse<Drugs>> => {
    return authenticatedApiCall(async () => {
      const response = await api.put<ApiResponse<Drugs>>(`/drugs/${id}`, drug);
      return response.data;
    });
  },

  deleteDrug: async (id: string): Promise<ApiResponse<void>> => {
    return authenticatedApiCall(async () => {
      const response = await api.delete<ApiResponse<void>>(`/drugs/${id}`);
      return response.data;
    });
  }
};

// Drug View API (for customers)
export const drugViewApi = {
  searchDrugsByName: async (name: string): Promise<ApiResponse<DrugResponseDto[]>> => {
    const response = await api.get<ApiResponse<DrugResponseDto[]>>(`/drugs-view/search?name=${name}`);
    return response.data;
  },

  getDrugDetails: async (drugId: string): Promise<ApiResponse<DrugResponseDetailsDto>> => {
    const response = await api.get<ApiResponse<DrugResponseDetailsDto>>(`/drugs-view/${drugId}/details`);
    return response.data;
  },

  getBranchesHaveDrug: async (drugId: string): Promise<ApiResponse<BranchDTO[]>> => {
    const response = await api.get<ApiResponse<BranchDTO[]>>(`/drugs-view/${drugId}/branches`);
    return response.data;
  },

  getDrugsWithCategory: async (categoryId: string): Promise<ApiResponse<DrugResponseDto[]>> => {
    const response = await api.get<ApiResponse<DrugResponseDto[]>>(`/drugs-view/category/${categoryId}`);
    return response.data;
  }
};

// Categories API
export const categoriesApi = {
  getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/category');
    return response.data;
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/category/${id}`);
    return response.data;
  },

  createCategory: async (category: Category): Promise<ApiResponse<Category>> => {
    return authenticatedApiCall(async () => {
      const response = await api.post<ApiResponse<Category>>('/category', category);
      return response.data;
    });
  },

  updateCategory: async (id: string, category: Category): Promise<ApiResponse<Category>> => {
    return authenticatedApiCall(async () => {
      const response = await api.put<ApiResponse<Category>>(`/category/${id}`, category);
      return response.data;
    });
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return authenticatedApiCall(async () => {
      const response = await api.delete<ApiResponse<void>>(`/category/${id}`);
      return response.data;
    });
  }
};

// Company Management API
export const companyApi = {
  getAllCompanies: async (): Promise<ApiResponse<CompanyDTO[]>> => {
    const response = await api.get<ApiResponse<CompanyDTO[]>>('/company/get/all');
    return response.data;
  },
  
  getCompanyById: async (id: number): Promise<ApiResponse<CompanyDTO>> => {
    const response = await api.get<ApiResponse<CompanyDTO>>(`/company/get/${id}`);
    return response.data;
  },
  
  getCompanyByToken: async (): Promise<ApiResponse<CompanyDTO>> => {
    const response = await api.get<ApiResponse<CompanyDTO>>('/company/get/id');
    return response.data;
  },
  
  createCompany: async (company: Company): Promise<ApiResponse<CompanyDTO>> => {
    const response = await api.post<ApiResponse<CompanyDTO>>('/company/create', company);
    return response.data;
  },
  
  updateCompany: async (id: number, company: Company): Promise<ApiResponse<CompanyDTO>> => {
    const response = await api.put<ApiResponse<CompanyDTO>>(`/company/update/${id}`, company);
    return response.data;
  },
  
  deleteCompany: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>(`/company/delete/${id}`);
    return response.data;
  },
  
  getCompanyByBranch: async (branchId: number): Promise<ApiResponse<CompanyDTO>> => {
    const response = await api.get<ApiResponse<CompanyDTO>>(`/company/get/by-branch/${branchId}`);
    return response.data;
  },
  
  getAllBranches: async (companyId: number): Promise<ApiResponse<BranchDTO[]>> => {
    const response = await api.get<ApiResponse<BranchDTO[]>>(`/company/get/${companyId}/branches`);
    return response.data;
  }
};

// Branch Management API
export const branchApi = {
  getAllBranches: async (): Promise<ApiResponse<BranchDTO[]>> => {
    const response = await api.get<ApiResponse<BranchDTO[]>>('/branches');
    return response.data;
  },
  
  getBranchById: async (id: number): Promise<ApiResponse<BranchDTO>> => {
    const response = await api.get<ApiResponse<BranchDTO>>(`/branches/${id}`);
    return response.data;
  },
  
  createBranch: async (branch: BranchDTO, companyId: number): Promise<ApiResponse<BranchDTO>> => {
    const response = await api.post<ApiResponse<BranchDTO>>(`/branches?companyId=${companyId}`, branch);
    return response.data;
  },
  
  updateBranch: async (branchId: number, branch: BranchDTO): Promise<ApiResponse<BranchDTO>> => {
    const response = await api.put<ApiResponse<BranchDTO>>(`/branches/${branchId}`, branch);
    return response.data;
  },
  
  deleteBranch: async (branchId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/branches/${branchId}`);
    return response.data;
  },
  
  getBranchesByPharmacyId: async (pharmacyId: number): Promise<ApiResponse<BranchDTO[]>> => {
    const response = await api.get<ApiResponse<BranchDTO[]>>(`/branches/branches/pharmacy/${pharmacyId}`);
    return response.data;
  },
  
  getBranchForEmployee: async (): Promise<ApiResponse<BranchDTO>> => {
    const response = await api.get<ApiResponse<BranchDTO>>('/branches/branch-for-employee');
    return response.data;
  },
  
  getBranchesWithEmployees: async (): Promise<ApiResponse<BranchWithEmployeesDTO[]>> => {
    const response = await api.get<ApiResponse<BranchWithEmployeesDTO[]>>('/branches/employees');
    return response.data;
  }
};

// Inventory Management (Company Product CRUD)
export const inventoryApi = {
  // Get all drugs (main drugs list)
  getAllDrugs: async (): Promise<Drugs[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drugs`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching drugs:', error);
      throw error;
    }
  },

  // Get all drugs for a specific branch (inventory)
  getAllDrugsForBranch: async (branchId: number): Promise<InventoryDrug[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-drugs/branch/${branchId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching branch inventory:', error);
      throw error;
    }
  },

  // Get inventory drug by ID
  getInventoryDrugById: async (id: string, token: string): Promise<InventoryDrug> => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-drugs/${id}`, {
        headers: {
          'token': token
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching inventory drug:', error);
      throw error;
    }
  },

  // Save new inventory drug
  saveInventoryDrug: async (inventoryDrug: InventoryDrug, token: string): Promise<InventoryDrug> => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-drugs/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(inventoryDrug)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error saving inventory drug:', error);
      throw error;
    }
  },

  // Update inventory drug
  updateInventoryDrug: async (id: string, inventoryDrug: InventoryDrug, token: string): Promise<InventoryDrug> => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-drugs/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(inventoryDrug)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating inventory drug:', error);
      throw error;
    }
  },

  // Delete inventory drug
  deleteInventoryDrug: async (id: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-drugs/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'token': token
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error('Error deleting inventory drug:', error);
      throw error;
    }
  },

  // Legacy methods for admin drug management
  createDrug: async (drug: Drugs, headers: Record<string, string>): Promise<Drugs> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drugs/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(drug)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating drug:', error);
      throw error;
    }
  },

  updateDrug: async (id: string, drug: Drugs, headers: Record<string, string>): Promise<Drugs> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drugs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(drug)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating drug:', error);
      throw error;
    }
  },

  deleteDrug: async (id: string, headers: Record<string, string>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drugs/${id}`, {
        method: 'DELETE',
        headers: {
          ...headers
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error('Error deleting drug:', error);
      throw error;
    }
  }
};

// Active Ingredients API
export const activeIngredientApi = {
  getAllActiveIngredients: async (): Promise<ApiResponse<ActiveIngredient[]>> => {
    const response = await api.get<ApiResponse<ActiveIngredient[]>>('/activeIngredient');
    return response.data;
  },
  
  getActiveIngredientById: async (id: string): Promise<ApiResponse<ActiveIngredient>> => {
    const response = await api.get<ApiResponse<ActiveIngredient>>(`/activeIngredient/${id}`);
    return response.data;
  },
  
  getActiveIngredientByName: async (name: string): Promise<ApiResponse<ActiveIngredient[]>> => {
    const response = await api.get<ApiResponse<ActiveIngredient[]>>(`/activeIngredient/name/${name}`);
    return response.data;
  },
  
  saveActiveIngredient: async (ingredient: ActiveIngredient): Promise<ApiResponse<ActiveIngredient>> => {
    const response = await api.post<ApiResponse<ActiveIngredient>>('/activeIngredient', ingredient);
    return response.data;
  },
  
  updateActiveIngredient: async (id: string, ingredient: ActiveIngredient): Promise<ApiResponse<ActiveIngredient>> => {
    const response = await api.put<ApiResponse<ActiveIngredient>>(`/activeIngredient/${id}`, ingredient);
    return response.data;
  },
  
  deleteActiveIngredient: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>(`/activeIngredient/${id}`);
    return response.data;
  }
};

// Request Management API
export const requestApi = {
  getAllRequests: async (): Promise<ApiResponse<RequestDTO[]>> => {
    const response = await api.get<ApiResponse<RequestDTO[]>>('/request/get-all');
    return response.data;
  },
  
  updateRequestStatus: async (request: RequestDTO): Promise<ApiResponse<RequestDTO>> => {
    const response = await api.post<ApiResponse<RequestDTO>>('/request/update-status', request);
    return response.data;
  }
};

// Log History API
export const logHistoryApi = {
  getUserLogHistory: async (): Promise<ApiResponse<LogHistory>> => {
    const response = await api.get<ApiResponse<LogHistory>>('/log-history/user');
    return response.data;
  },
  
  addOrderToLog: async (orderId: string): Promise<ApiResponse<LogHistory>> => {
    const response = await api.post<ApiResponse<LogHistory>>(`/log-history/add-order?orderId=${orderId}`);
    return response.data;
  }
};

// Admin Management API
export const adminApi = {
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>('/admin/users');
    return response.data;
  },
  
  changePassword: async (id: number, password: string): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>(`/admin/change-Password?id=${id}&password=${password}`);
    return response.data;
  }
};

// Image Upload API
export const imageApi = {
  uploadImage: async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    const response = await api.post<string>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Email API
export const emailApi = {
  sendEmail: async (to: string): Promise<string> => {
    const response = await api.get<string>(`/send-email?to=${to}`);
    return response.data;
  }
};

// Cart API
export const cartApi = {
  getItemsFromCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.get<ApiResponse<Cart>>('/cart/items');
    return response.data;
  },

  addToCart: async (item: Item): Promise<ApiResponse<Item>> => {
    const response = await api.post<ApiResponse<Item>>('/items/save', item);
    return response.data;
  },

  updateCartItem: async (id: string, item: Item): Promise<ApiResponse<Item>> => {
    const response = await api.put<ApiResponse<Item>>(`/items/update/${id}`, item);
    return response.data;
  },

  removeFromCart: async (item: Item): Promise<ApiResponse<Cart>> => {
    const response = await api.delete<ApiResponse<Cart>>('/cart/remove', { data: item });
    return response.data;
  }
};

// Orders API
export const ordersApi = {
  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders/user');
    return response.data;
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  placeOrder: async (order: Order): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/orders/place/order', order);
    return response.data;
  }
};

// Wishlist API
export const wishlistApi = {
  getWishlist: async (): Promise<ApiResponse<Wishlist[]>> => {
    const response = await api.get<ApiResponse<Wishlist[]>>('/wishlist');
    return response.data;
  },

  addWishlist: async (wishlist: Wishlist): Promise<ApiResponse<Wishlist>> => {
    const response = await api.post<ApiResponse<Wishlist>>('/wishlist', wishlist);
    return response.data;
  },

  deleteWishlist: async (wishlist: Wishlist): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>('/wishlist', { data: wishlist });
    return response.data;
  }
};

export default api;
