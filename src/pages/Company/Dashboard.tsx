import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { companyApi, branchApi, inventoryApi, requestApi } from '../../services/api';
import { CompanyDTO, BranchDTO, InventoryDrug, RequestDTO } from '../../types';
import { getStoredToken, isAuthenticated } from '../../services/auth';

export default function CompanyDashboard() {
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [inventory, setInventory] = useState<InventoryDrug[]>([]);
  const [requests, setRequests] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDTO | null>(null);
  const [branchForm, setBranchForm] = useState<Partial<BranchDTO>>({});
  const [branchActionLoading, setBranchActionLoading] = useState(false);
  const [branchActionError, setBranchActionError] = useState('');

  // Product management state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryDrug | null>(null);
  const [productForm, setProductForm] = useState<Partial<InventoryDrug>>({});
  const [productActionLoading, setProductActionLoading] = useState(false);
  const [productActionError, setProductActionError] = useState('');

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      window.location.href = '/signin';
      return;
    }
    
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch company details
      const companyResponse = await companyApi.getCompanyByToken();
      if (companyResponse.status) {
        setCompany(companyResponse.data);
        
        // Fetch branches for this company
        const branchesResponse = await companyApi.getAllBranches(companyResponse.data.companyId!);
        if (branchesResponse.status) {
          setBranches(branchesResponse.data);
        }

        // Fetch inventory for all branches
        const inventoryPromises = branchesResponse.data.map(branch => 
          inventoryApi.getAllDrugsForBranch(branch.branchId!)
        );
        const inventoryResponses = await Promise.all(inventoryPromises);
        const allInventory = inventoryResponses
          .filter(response => response.status)
          .flatMap(response => response.data);
        setInventory(allInventory);

        // Fetch requests
        const requestsResponse = await requestApi.getAllRequests();
        if (requestsResponse.status) {
          setRequests(requestsResponse.data);
        }
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError('Failed to load company data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        const updatedRequest = { ...request, status: newStatus as any };
        const response = await requestApi.updateRequestStatus(updatedRequest);
        if (response.status) {
          setRequests(prev => prev.map(r => r.id === requestId ? response.data : r));
        }
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      setError('Failed to update request status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'PREPARING': return 'text-blue-600 bg-blue-100';
      case 'READY': return 'text-green-600 bg-green-100';
      case 'SHIPPED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'PREPARING': return <AlertCircle className="w-4 h-4" />;
      case 'READY': return <CheckCircle className="w-4 h-4" />;
      case 'SHIPPED': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({});
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (branch: BranchDTO) => {
    setEditingBranch(branch);
    setBranchForm(branch);
    setShowBranchModal(true);
  };

  const handleCloseBranchModal = () => {
    setShowBranchModal(false);
    setEditingBranch(null);
    setBranchForm({});
    setBranchActionError('');
  };

  const handleBranchFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranchForm({ ...branchForm, [e.target.name]: e.target.value });
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchActionLoading(true);
    setBranchActionError('');
    try {
      if (editingBranch) {
        // Edit branch
        await branchApi.updateBranch(editingBranch.branchId!, branchForm as BranchDTO);
      } else {
        // Add branch
        await branchApi.createBranch(branchForm as BranchDTO, company!.companyId!);
      }
      await fetchCompanyData();
      handleCloseBranchModal();
    } catch (err) {
      setBranchActionError('Failed to save branch.');
    } finally {
      setBranchActionLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    setBranchActionLoading(true);
    setBranchActionError('');
    try {
      await branchApi.deleteBranch(branchId);
      await fetchCompanyData();
    } catch (err) {
      setBranchActionError('Failed to delete branch.');
    } finally {
      setBranchActionLoading(false);
    }
  };

  // Product management functions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({});
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product: InventoryDrug) => {
    setEditingProduct(product);
    setProductForm(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({});
    setProductActionError('');
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProductForm({ 
      ...productForm, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (!isAuthenticated()) {
      setProductActionError('You are not authenticated. Please log in again.');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return;
    }
    
    setProductActionLoading(true);
    setProductActionError('');
    
    try {
      // Validate required fields
      if (!productForm.drugName || !productForm.drugId || !productForm.branchId || !productForm.price || productForm.stock === undefined) {
        setProductActionError('Please fill in all required fields.');
        return;
      }

      // Prepare the product data with all required fields
      const productData: InventoryDrug = {
        drugId: productForm.drugId!,
        drugName: productForm.drugName!,
        categoryId: productForm.categoryId || '', // Set default if not provided
        activeIngredientId: productForm.activeIngredientId || '', // Set default if not provided
        price: productForm.price!,
        stock: productForm.stock!,
        branchId: productForm.branchId!
      };

      console.log('Submitting product data:', productData);
      console.log('Current token:', localStorage.getItem('token'));

      if (editingProduct) {
        // Edit product
        const response = await inventoryApi.updateInventoryDrug(editingProduct.id!, productData);
        if (!response.status) {
          throw new Error(response.message || 'Failed to update product');
        }
      } else {
        // Add product
        const response = await inventoryApi.saveInventoryDrug(productData);
        if (!response.status) {
          throw new Error(response.message || 'Failed to add product');
        }
      }
      
      await fetchCompanyData();
      handleCloseProductModal();
    } catch (err: any) {
      console.error('Product operation error:', err);
      if (err.response?.status === 401) {
        setProductActionError('Authentication failed. Please log in again.');
        // Don't redirect automatically, let user see the error
      } else {
        setProductActionError(err.message || 'Failed to save product. Please try again.');
      }
    } finally {
      setProductActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setProductActionLoading(true);
    setProductActionError('');
    try {
      await inventoryApi.deleteInventoryDrug(productId.toString());
      await fetchCompanyData();
    } catch (err) {
      setProductActionError('Failed to delete product.');
    } finally {
      setProductActionLoading(false);
    }
  };

  // Load branch inventory
  const loadBranchInventory = async (branch: BranchDTO) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const inventoryResponse = await inventoryApi.getAllDrugsForBranch(branch.branchId!);
      setInventory(inventoryResponse);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Handle product save/update
  const handleProductSave = async (productData: InventoryDrug) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      let response: InventoryDrug;
      if (editingProduct) {
        // Update existing product
        response = await inventoryApi.updateInventoryDrug(editingProduct.id!, productData, token);
        setInventory(prev => prev.map(item => 
          item.id === editingProduct.id ? response : item
        ));
      } else {
        // Create new product
        response = await inventoryApi.saveInventoryDrug(productData, token);
        setInventory(prev => [...prev, response]);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        drugId: '',
        drugName: '',
        categoryId: '',
        activeIngredientId: '',
        price: 0,
        stock: 0,
        branchId: selectedBranch?.branchId || 0
      });
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Handle product delete
  const handleProductDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await inventoryApi.deleteInventoryDrug(productId.toString(), token);
      setInventory(prev => prev.filter(item => item.id !== productId.toString()));
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchCompanyData} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h2>
          <p className="text-gray-600">Unable to load company information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.companyEmail}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Company ID</p>
              <p className="text-lg font-semibold text-gray-900">#{company.companyId}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{company.companyEmail}</span>
            </div>
            {company.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{company.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{branches.length} Branches</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Building2 },
              { id: 'branches', name: 'Branches', icon: MapPin },
              { id: 'inventory', name: 'Inventory', icon: Package },
              { id: 'requests', name: 'Requests', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Company Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Branches</p>
                      <p className="text-2xl font-bold text-blue-900">{branches.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Total Products</p>
                      <p className="text-2xl font-bold text-green-900">{inventory.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {requests.filter(r => r.status === 'PENDING').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Completed Orders</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {requests.filter(r => r.status === 'SHIPPED').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
                  <div className="space-y-3">
                    {requests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Order #{request.orderId}</p>
                          <p className="text-sm text-gray-600">{request.items.length} items</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status || 'PENDING')}`}>
                          {request.status || 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Locations</h3>
                  <div className="space-y-3">
                    {branches.slice(0, 5).map((branch) => (
                      <div key={branch.branchId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{branch.branchName}</p>
                          <p className="text-sm text-gray-600">{branch.city}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          branch.branchState ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {branch.branchState ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Branches</h2>
                <button 
                  onClick={handleOpenAddBranch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Branch</span>
                </button>
              </div>
              
              {branchActionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {branchActionError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                  <div key={branch.branchId} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{branch.branchName}</h3>
                        <p className="text-gray-600">{branch.address}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditBranch(branch)}
                          className="p-1 text-gray-400 hover:text-green-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBranch(branch.branchId!)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{branch.city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{branch.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{branch.email}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        branch.branchState ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.branchState ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                <button 
                  onClick={handleOpenAddProduct}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
              
              {productActionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {productActionError}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.drugName}</div>
                            <div className="text-sm text-gray-500">ID: {item.drugId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {branches.find(b => b.branchId === item.branchId)?.branchName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (item.stock || 0) > 10 ? 'bg-green-100 text-green-800' : 
                            (item.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.stock || 0} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleOpenEditProduct(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(item.id!)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Requests</h2>
              
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{request.orderId}</h3>
                        <p className="text-gray-600">
                          {request.customer?.firstName} {request.customer?.lastName} - {request.customer?.phone}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status || 'PENDING')}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status || 'PENDING')}`}>
                          {request.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                        <div className="space-y-1">
                          {request.items?.map((item, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {item.drugId} - Qty: {item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Customer Info</h4>
                        <div className="text-sm text-gray-600">
                          <p>{request.customer?.address}</p>
                          <p>{request.customer?.city}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id!, 'PREPARING')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Start Preparing
                        </button>
                      )}
                      {request.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id!, 'READY')}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Mark Ready
                        </button>
                      )}
                      {request.status === 'READY' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id!, 'SHIPPED')}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                          Mark Shipped
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              
              <form onSubmit={handleBranchSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    value={branchForm.branchName || ''}
                    onChange={handleBranchFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={branchForm.address || ''}
                    onChange={handleBranchFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={branchForm.city || ''}
                    onChange={handleBranchFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={branchForm.phone || ''}
                    onChange={handleBranchFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={branchForm.email || ''}
                    onChange={handleBranchFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="branchState"
                    checked={branchForm.branchState || false}
                    onChange={(e) => setBranchForm({ ...branchForm, branchState: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Branch</label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseBranchModal}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={branchActionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {branchActionLoading ? 'Saving...' : (editingBranch ? 'Update Branch' : 'Add Branch')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Drug Name</label>
                  <input
                    type="text"
                    name="drugName"
                    value={productForm.drugName || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Drug ID</label>
                  <input
                    type="text"
                    name="drugId"
                    value={productForm.drugId || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category ID</label>
                  <input
                    type="text"
                    name="categoryId"
                    value={productForm.categoryId || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category ID (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Active Ingredient ID</label>
                  <input
                    type="text"
                    name="activeIngredientId"
                    value={productForm.activeIngredientId || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter active ingredient ID (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <select
                    name="branchId"
                    value={productForm.branchId || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName} - {branch.city}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={productForm.price || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={productForm.stock || ''}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseProductModal}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productActionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {productActionLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}