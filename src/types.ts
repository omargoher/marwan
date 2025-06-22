// API Response Types
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  status: boolean;
  data: T;
}

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
}

export interface ApiFieldError {
  code: string;
  message: string;
  property: string;
  rejectedValue: any;
  path: string;
}

// User Types
export interface UserDTO {
  id?: number;
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  gender?: 'MALE' | 'FEMALE';
  dateCreated?: string;
  lastLoginDate?: string;
  enabled?: boolean;
  userRoles?: 'ROLE_CLIENT' | 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_COMPANY';
  birthDate?: string;
  companyRegistrationCompleted?: boolean;
}

export interface UserCompanyDTO extends UserDTO {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  logoUrl?: string;
  branchList?: Branch[];
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenDTO {
  token: string;
}

// Drug Types
export interface Drugs {
  id?: string;
  activeIngredientId?: string;
  categoryId?: string;
  drugName: string;
  description?: string;
  logo?: string;
}

export interface InventoryDrug {
  id?: string;
  drugId: string;
  drugName: string;
  categoryId?: string;
  activeIngredientId?: string;
  price: number;
  stock: number;
  branchId: number;
}

export interface DrugResponseDto {
  drugId: string;
  drugName: string;
  description?: string;
  imageUrl?: string;
  price: number;
  available: boolean;
}

export interface DrugResponseDetailsDto extends DrugResponseDto {
  categoryName?: string;
  activeIngredients?: string;
}

// Category Types
export interface Category {
  id?: string;
  categoryName: string;
  logo?: string;
}

// Active Ingredient Types
export interface ActiveIngredient {
  id?: string;
  activeIngredient: string;
  ingredientArabicName?: string;
  description?: string;
}

// Company Types
export interface Company {
  companyId?: number;
  name: string;
  companyEmail: string;
  phone?: string;
  logoUrl?: string;
  branchList?: Branch[];
}

export interface CompanyDTO extends Company {
  branchList?: BranchDTO[];
}

// Branch Types
export interface Branch {
  branchId?: number;
  branchName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  branchState?: boolean;
  zip?: string;
  lat?: number;
  lng?: number;
  employees?: EmployeeDetails[];
}

export interface BranchDTO extends Branch {
  companyDto?: CompanyDTO;
  price?: number;
  companyLogoURl?: string;
}

export interface BranchWithEmployeesDTO extends BranchDTO {
  employees: UserDTO[];
}

export interface EmployeeDetails {
  id?: number;
  user?: UserDTO;
  branch?: Branch;
}

// Cart and Order Types
export interface Item {
  id?: string;
  orderId?: string;
  drugId: string;
  price?: number;
  quantity: number;
  userId?: number;
}

export interface ItemDTO {
  id?: string;
  orderId?: string;
  drugId: string;
  price?: number;
  quantity: number;
}

export interface Cart {
  id?: string;
  items: Item[];
  userId?: number;
}

export interface CustomerInfoDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface RequestDTO {
  id?: string;
  items: ItemDTO[];
  branchId: number;
  orderId?: string;
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'SHIPPED';
  customer?: CustomerInfoDTO;
}

export interface Order {
  id?: string;
  totalPrice: number;
  paymentMethod?: string;
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'SHIPPED';
  userId?: number;
  requestsIds?: string[];
}

// Wishlist Types
export interface Wishlist {
  id?: string;
  drugId: string;
  userId?: number;
}

// Log History Types
export interface LogHistory {
  id?: string;
  orderIds?: string[];
  userId?: number;
}

// Legacy Types (for backward compatibility)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'prescription' | 'otc' | 'personal-care' | 'vitamins';
  inStock: boolean;
  requiresPrescription: boolean;
  dosage?: string;
  manufacturer?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'branch' | 'company';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  companyName?: string;
  companyId?: string;
  branchId?: string;
}

export interface HealthInformation {
  allergies: string[];
  currentMedications: string[];
  conditions: string[];
  bloodType?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
} 