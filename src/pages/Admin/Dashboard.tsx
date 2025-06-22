import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Package, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  Settings,
  UserCheck,
  UserX
} from 'lucide-react';
import { adminApi, companyApi,activeIngredientApi } from '../../services/api';
import { User, CompanyDTO, Category, ActiveIngredient } from '../../types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all users
      const usersResponse = await adminApi.getAllUsers();
      if (usersResponse.status) {
        setUsers(usersResponse.data);
      }

      // Fetch all companies
      const companiesResponse = await companyApi.getAllCompanies();
      if (companiesResponse.status) {
        setCompanies(companiesResponse.data);
      }

      // Fetch all categories
      const categoriesResponse = await categoryApi.getAllCategories();
      if (categoriesResponse.status) {
        setCategories(categoriesResponse.data);
      }

      // Fetch all active ingredients
      const ingredientsResponse = await activeIngredientApi.getAllActiveIngredients();
      if (ingredientsResponse.status) {
        setActiveIngredients(ingredientsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUserId || !newPassword) return;
    
    try {
      const response = await adminApi.changePassword(selectedUserId, newPassword);
      if (response.status) {
        alert('Password changed successfully');
        setSelectedUserId(null);
        setNewPassword('');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password.');
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const response = await userApi.deleteEmployee(employeeId);
      if (response.status) {
        setUsers(prev => prev.filter(user => user.id !== employeeId));
        alert('Employee deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-red-100 text-red-800';
      case 'ROLE_COMPANY': return 'bg-blue-100 text-blue-800';
      case 'ROLE_EMPLOYEE': return 'bg-green-100 text-green-800';
      case 'ROLE_CLIENT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return <Shield className="w-4 h-4" />;
      case 'ROLE_COMPANY': return <Building2 className="w-4 h-4" />;
      case 'ROLE_EMPLOYEE': return <Users className="w-4 h-4" />;
      case 'ROLE_CLIENT': return <UserCheck className="w-4 h-4" />;
      default: return <UserCheck className="w-4 h-4" />;
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
            onClick={fetchAdminData} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">System Administration & Management</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'companies', name: 'Companies', icon: Building2 },
              { id: 'categories', name: 'Categories', icon: Package },
              { id: 'ingredients', name: 'Ingredients', icon: Settings }
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
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Companies</p>
                      <p className="text-2xl font-bold text-green-900">{companies.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Categories</p>
                      <p className="text-2xl font-bold text-yellow-900">{categories.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Settings className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Ingredients</p>
                      <p className="text-2xl font-bold text-purple-900">{activeIngredients.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(
                      users.reduce((acc, user) => {
                        acc[user.userRoles] = (acc[user.userRoles] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role)}
                          <span className="font-medium text-gray-900">{role.replace('ROLE_', '')}</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Companies</h3>
                  <div className="space-y-3">
                    {companies.slice(0, 5).map((company) => (
                      <div key={company.companyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-sm text-gray-600">{company.companyEmail}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {company.branchList?.length || 0} branches
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.userRoles)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.userRoles)}`}>
                              {user.userRoles.replace('ROLE_', '')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.dateCreated ? new Date(user.dateCreated).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setSelectedUserId(user.id!)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Change Password
                            </button>
                            {user.userRoles === 'ROLE_EMPLOYEE' && (
                              <button 
                                onClick={() => handleDeleteEmployee(user.id!)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Password Change Modal */}
              {selectedUserId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                  <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mt-3">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => {
                            setSelectedUserId(null);
                            setNewPassword('');
                          }}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleChangePassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <div key={company.companyId} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-gray-600">{company.companyEmail}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {company.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{company.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {company.branchList?.length || 0} branches
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.categoryName}</h3>
                        <p className="text-gray-600">ID: {category.id}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {category.logo && (
                      <div className="mt-4">
                        <img 
                          src={category.logo} 
                          alt={category.categoryName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Active Ingredient Management</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingredient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arabic Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeIngredients.map((ingredient) => (
                      <tr key={ingredient.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ingredient.activeIngredient}</div>
                            <div className="text-sm text-gray-500">ID: {ingredient.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ingredient.ingredientArabicName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">
                            {ingredient.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
