import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Upload } from 'lucide-react';
import axios from 'axios';
import { getStoredToken } from '../../services/auth';
import { Trash2 as TrashIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  logo: string;
  productCount: number;
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Over the Counter',
    logo: 'Pill',
    productCount: 150
  },
  {
    id: '2',
    name: 'Prescription Medicines',
    logo: 'Heart',
    productCount: 300
  },
  {
    id: '3',
    name: 'Vitamins & Supplements',
    logo: 'Pill',
    productCount: 200
  },
  {
    id: '4',
    name: 'Personal Care',
    logo: 'ShoppingBag',
    productCount: 180
  }
];

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = getStoredToken();
    console.log('Retrieved Token:', token);
    const headers = { headers: { token } };
    console.log('Headers:', headers);
    return headers;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const headers = getAuthHeaders();
      console.log('Fetching categories...');
      const response = await axios.get('http://localhost:8080/api/category', headers);

      console.log('API Response:', response.data);

      let apiCategories: any[] = [];
      if (Array.isArray(response.data)) {
        apiCategories = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        apiCategories = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.id || response.data._id) {
          apiCategories = [response.data];
        } else {
          console.warn('Received single object that does not look like a category:', response.data);
          apiCategories = [];
        }
      }

      console.log('Processed categories:', apiCategories);

      const mappedApiCategories: Category[] = apiCategories
        .filter(cat => cat && (cat.id || cat._id))
        .map((cat) => ({
          id: cat.id || cat._id,
          name: cat.name || cat.categoryName || 'Unnamed Category',
          logo: cat.logo || '',
          productCount: cat.productCount || 0
        }));

      console.log('Mapped categories:', mappedApiCategories);
      setCategories(mappedApiCategories);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 404) {
        setError('Categories endpoint not found. Please check the API configuration.');
      } else {
        setError(`Failed to load categories: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append('imageFile', selectedImage);

    try {
      const headers = getAuthHeaders();
      const response = await axios.post('http://localhost:8080/api/images/upload', formData, {
        ...headers,
        headers: {
          ...headers.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const headers = getAuthHeaders();

      const imageURL = await handleUploadImage();
      if (imageURL) {
        const categoryData = {
          name: formData.name,
          logo: imageURL
        };

        console.log('Sending category data:', categoryData);

        if (editingCategory) {
          const response = await axios.put(
            `http://localhost:8080/api/category/${editingCategory.id}`,
            categoryData,
            headers
          );
          console.log('Update response:', response.data);
        } else {
          const response = await axios.post(
            'http://localhost:8080/api/category',
            categoryData,
            headers
          );
          console.log('Create response:', response.data);
        }

        await fetchCategories();
        handleCloseForm();
        setError(null);
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      console.error('Error saving category:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 400) {
        setError(`Invalid category data: ${err.response.data.message || 'Please check your input.'}`);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to manage categories.');
      } else {
        setError(`Failed to save category: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      logo: category.logo
    });
    setSelectedImage(null);
    setIsFormOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setCategoryToDeleteId(categoryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDeleteId) {
      try {
        const headers = getAuthHeaders();
        console.log('Attempting to delete category:', categoryToDeleteId);
        const response = await axios.delete(`http://localhost:8080/api/category/${categoryToDeleteId}`, headers);

        console.log('Delete successful response:', response.data);

        if (response.status === 200 || response.status === 204) {
          await fetchCategories();
          setError(null);
        } else {
          setError(response.data?.message || 'Failed to delete category. Server response did not indicate success.');
          console.error('Delete failed: Server response did not indicate success.', response.data);
        }
       
        handleCloseDeleteModal();
      } catch (err: any) {
        console.error('Error deleting category:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers
        });
        
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to delete categories.');
        } else if (err.response) {
          setError(`Failed to delete category: ${err.response.status} - ${err.response.data?.message || err.message}`);
        } else {
          setError(`Failed to delete category: ${err.message}`);
        }
        handleCloseDeleteModal();
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDeleteId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      logo: ''
    });
    setSelectedImage(null);
    setError(null);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {category.productCount} products
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseForm}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category Logo
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      {formData.logo && (
                        <img
                          src={formData.logo}
                          alt="Category logo"
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Upload className="h-5 w-5 mr-2" />
                          {selectedImage ? 'Change Image' : 'Upload Image'}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        {selectedImage && (
                          <p className="mt-1 text-sm text-gray-500">
                            Selected: {selectedImage.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseDeleteModal} />
            <div className="relative bg-white rounded-lg max-w-sm w-full p-6">
              <div className="text-center">
                <TrashIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Delete Category</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this category? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  onClick={handleCloseDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}