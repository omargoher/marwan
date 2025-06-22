import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Upload } from 'lucide-react';
import { inventoryApi, InventoryDrug } from '../../services/api';
import axios from 'axios';
import { getStoredToken } from '../../services/auth';

interface Category {
  id: string;
  name: string;
}

interface ActiveIngredient {
  id: string;
  name: string;
}

export default function ManageDrugs() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<InventoryDrug | null>(null);
  const [drugsList, setDrugsList] = useState<InventoryDrug[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [drugToDeleteId, setDrugToDeleteId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Omit<InventoryDrug, 'id'>>({
    activeIngredientId: '',
    categoryId: '',
    drugName: '',
    description: '',
    logo: ''
  });

  // State for managing Active Ingredient form
  const [isActiveIngredientFormOpen, setIsActiveIngredientFormOpen] = useState(false);
  const [newActiveIngredientData, setNewActiveIngredientData] = useState({ name: '', description: '', ingredientArabicName: '' });
  const [isAddingActiveIngredient, setIsAddingActiveIngredient] = useState(false);
  const [activeIngredientError, setActiveIngredientError] = useState<string | null>(null);

  // State for managing Active Ingredient delete modal
  const [showActiveIngredientDeleteModal, setShowActiveIngredientDeleteModal] = useState(false);
  const [activeIngredientToDeleteId, setActiveIngredientToDeleteId] = useState<string | null>(null);

  // State for search input
  const [activeIngredientSearchTerm, setActiveIngredientSearchTerm] = useState('');
  const [isSearchingActiveIngredient, setIsSearchingActiveIngredient] = useState(false);

  const getAuthHeaders = () => {
    const token = getStoredToken(); // Ensure token is fetched from local storage
    // Assuming backend expects Authorization: Bearer token
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Headers:', headers); // Log headers to verify the token
    return headers;
  };

  useEffect(() => {
    loadDrugs();
    loadCategories();
    loadActiveIngredients();
  }, []);

  const loadDrugs = async () => {
    try {
      const response = await inventoryApi.getAllDrugs();

      if (Array.isArray(response)) {
        setDrugsList(response);
      } else if (response && Array.isArray(response.data)) {
        setDrugsList(response.data);
      } else {
        console.error('API response is not an array:', response);
        setDrugsList([]); // Set to empty array to prevent errors
      }
      console.log('Drugs List after loading:', response.data);
    } catch (error) {
      console.error('Error loading drugs:', error);
      setDrugsList([]); // Set to empty array on error
    }
  };

  const loadCategories = async () => {
    try {
      const headers = getAuthHeaders(); // Get the custom headers
      const response = await axios.get('http://localhost:8080/api/category', { headers }); // Pass headers correctly
      let apiCategories: any[] = [];
      if (Array.isArray(response.data)) {
        apiCategories = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        apiCategories = response.data.data;
      }

      const mappedCategories: Category[] = apiCategories.map((cat) => ({
        id: cat.id || cat._id,
        name: cat.name || cat.categoryName || 'Unnamed Category',
      }));

      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadActiveIngredients = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:8080/api/activeIngredient', { headers });

      console.log('Raw Active Ingredients API Response:', response.data);

      let apiActiveIngredients: any[] = [];
      if (Array.isArray(response.data)) {
        apiActiveIngredients = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        apiActiveIngredients = response.data.data;
      }

      console.log('Array being mapped:', apiActiveIngredients);

      const mappedActiveIngredients: ActiveIngredient[] = apiActiveIngredients.map((ai) => ({
        id: ai.id || ai._id,
        name: ai.activeIngredient || ai.name || ai.ingredientName || ai.name_en || ai.englishName || 'Unnamed Active Ingredient',
      }));

      // Add more logging here to inspect the structure of apiActiveIngredients if needed
      console.log('Mapped Active Ingredients:', mappedActiveIngredients);

      setActiveIngredients(mappedActiveIngredients);
      console.log('Active Ingredients List after loading:', mappedActiveIngredients);
    } catch (error) {
      console.error('Error loading active ingredients:', error);
    }
  };

  // Function to perform search
  const searchActiveIngredients = async (term: string) => {
    if (!term) {
      loadActiveIngredients(); // Load full list if search term is empty
      return;
    }

    setIsSearchingActiveIngredient(true);
    setActiveIngredientError(null);

    try {
      const headers = getAuthHeaders();
      let response;
      const potentialId = term.trim();

      // Simple check if the term looks like a potential ID (24 hex characters)
      const isPotentialId = potentialId.length === 24 && /^[0-9a-fA-F]+$/.test(potentialId);

      if (isPotentialId) {
        // Search by ID
        try {
          response = await axios.get(`http://localhost:8080/api/activeIngredient/${potentialId}`, { headers });
          // API returns a single object for ID search, put it in an array for consistent state update
          // Map the single result using the same logic as loading the full list
          const mappedResult = [{
             id: response.data.id || response.data._id,
             name: response.data.activeIngredient || response.data.name || response.data.ingredientArabicName || response.data.name_en || response.data.englishName || 'Unnamed Active Ingredient',
             description: response.data.description, // Include other relevant fields if needed
             ingredientArabicName: response.data.ingredientArabicName,
           }];
          setActiveIngredients(mappedResult);
        } catch (idError: any) {
           console.error('Error searching active ingredient by ID:', idError);
           if (idError.response && idError.response.status === 404) {
             setActiveIngredients([]); // Clear list if not found by ID
           } else {
             setActiveIngredientError('Error searching by ID.');
             setActiveIngredients([]);
           }
        }
      } else {
        // Search by Name
        try {
           response = await axios.get(`http://localhost:8080/api/activeIngredient/name/${encodeURIComponent(term.trim())}`, { headers });
           // API returns an array for name search
           if (Array.isArray(response.data)) {
             // Map the results using the same logic as loading the full list
             const mappedResults = response.data.map((ai: any) => ({
                id: ai.id || ai._id,
                name: ai.activeIngredient || ai.name || ai.ingredientArabicName || ai.name_en || ai.englishName || 'Unnamed Active Ingredient',
                description: ai.description,
                ingredientArabicName: ai.ingredientArabicName,
              }));
             setActiveIngredients(mappedResults);
           } else if (response.data && Array.isArray(response.data.data)) {
              // Handle nested data array and map results
              const mappedResults = response.data.data.map((ai: any) => ({
                 id: ai.id || ai._id,
                 name: ai.activeIngredient || ai.name || ai.ingredientArabicName || ai.name_en || ai.englishName || 'Unnamed Active Ingredient',
                 description: ai.description,
                 ingredientArabicName: ai.ingredientArabicName,
               }));
               setActiveIngredients(mappedResults); // Handle nested data array
           } else {
               console.error('API response for name search is not an array or nested array:', response);
               setActiveIngredients([]);
           }
        } catch (nameError: any) {
            console.error('Error searching active ingredient by name:', nameError);
            if (nameError.response && nameError.response.status === 404) {
              setActiveIngredients([]); // Clear list if not found by name
            } else {
               setActiveIngredientError('Error searching by name.');
               setActiveIngredients([]);
            }
        }
      }

    } catch (error) {
      console.error('Error during active ingredient search:', error);
      setActiveIngredientError('An error occurred during search.');
      setActiveIngredients([]);
    } finally {
      setIsSearchingActiveIngredient(false);
    }
  };

  // Handle search input change
  const handleActiveIngredientSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setActiveIngredientSearchTerm(term);
    // Trigger search immediately for simplicity, debounce could be added here
    searchActiveIngredients(term);
  };

  const handleAddActiveIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActiveIngredientData.name) {
      setActiveIngredientError('Active ingredient name is required.');
      return;
    }

    try {
      setIsAddingActiveIngredient(true);
      setActiveIngredientError(null);
      const headers = getAuthHeaders();

      const response = await axios.post(
        'http://localhost:8080/api/activeIngredient',
        newActiveIngredientData,
        { headers }
      );
      
      console.log('Create active ingredient response:', response.data);

      if (response.data) { // Adjust this check based on your API's success response
           await loadActiveIngredients(); // Refresh the list of active ingredients
           handleCloseActiveIngredientForm();
      } else {
          setActiveIngredientError(response.data?.message || 'Failed to add active ingredient.');
      }

    } catch (err: any) {
      console.error('Error adding active ingredient:', err);
       if (err.response?.status === 401) {
           setActiveIngredientError('Authentication failed. Please log in again.');
       } else if (err.response?.status === 400) {
            setActiveIngredientError(`Invalid data: ${err.response.data?.message || 'Please check your input.'}`);
       } else {
           setActiveIngredientError(err.response?.data?.message || 'Failed to add active ingredient.');
       }
    } finally {
      setIsAddingActiveIngredient(false);
    }
  };

  const handleCloseActiveIngredientForm = () => {
    setIsActiveIngredientFormOpen(false);
    setNewActiveIngredientData({ name: '', description: '', ingredientArabicName: '' });
    setActiveIngredientError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('imageFile', file);

    try {
      const headers = getAuthHeaders();
      console.log('Upload Headers:', {
        headers
      });
      const response = await axios.post('http://localhost:8080/api/images/upload', formData, {
        headers: {
           ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const headers = getAuthHeaders();

      let logoUrl = formData.logo;
      if (selectedImage) {
        const imageURL = await uploadImage(selectedImage);
        if (!imageURL) {
          throw new Error('Failed to upload image');
        }
        logoUrl = imageURL;
      }

      const drugData = {
        ...formData,
        logo: logoUrl
      };

      console.log('Payload being sent:', drugData);
      
      if (editingDrug?.id) {
        await inventoryApi.updateDrug(editingDrug.id, { ...drugData, id: editingDrug.id }, { headers }); // Pass headers correctly
      } else {
        await inventoryApi.createDrug(drugData, { headers }); // Pass headers correctly
      }
      await loadDrugs();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving drug:', error);
      // Display drug save error
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (drug: InventoryDrug) => {
    setEditingDrug(drug);
    setFormData({
      activeIngredientId: drug.activeIngredientId,
      categoryId: drug.categoryId,
      drugName: drug.drugName,
      description: drug.description,
      logo: drug.logo
    });
    setSelectedImage(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (drugId: string) => {
    setDrugToDeleteId(drugId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (drugToDeleteId) {
      try {
        const headers = getAuthHeaders(); // Get the custom headers
        await inventoryApi.deleteDrug(drugToDeleteId, { headers }); // Pass headers correctly
        await loadDrugs();
        handleCloseDeleteModal();
      } catch (error) {
        console.error('Error deleting drug:', error);
        // Display delete error
        handleCloseDeleteModal();
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDrugToDeleteId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDrug(null);
    setFormData({
      activeIngredientId: '',
      categoryId: '',
      drugName: '',
      description: '',
      logo: ''
    });
    setSelectedImage(null);
  };

  const handleDeleteActiveIngredient = (aiId: string) => {
    setActiveIngredientToDeleteId(aiId);
    setShowActiveIngredientDeleteModal(true);
  };

  const confirmDeleteActiveIngredient = async () => {
    if (activeIngredientToDeleteId) {
      try {
        const headers = getAuthHeaders();
        await axios.delete(`http://localhost:8080/api/activeIngredient/${activeIngredientToDeleteId}`, { headers });
        await loadActiveIngredients();
        handleCloseActiveIngredientDeleteModal();
      } catch (error) {
        console.error('Error deleting active ingredient:', error);
        // Optionally display an error message to the user
        handleCloseActiveIngredientDeleteModal();
      }
    }
  };

  const handleCloseActiveIngredientDeleteModal = () => {
    setShowActiveIngredientDeleteModal(false);
    setActiveIngredientToDeleteId(null);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy Inventory Management</h1>
        <p className="mt-1 text-base text-gray-600">Oversee your stock of drugs and their active ingredients.</p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Ingredients Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Ingredients</h2>
                <button
                  onClick={() => setIsActiveIngredientFormOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={activeIngredientSearchTerm}
                  onChange={handleActiveIngredientSearchInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>

            <div className="p-6">
              {activeIngredientError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {activeIngredientError}
                </div>
              )}

              {activeIngredients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-600">No active ingredients found</p>
                  <button
                    onClick={() => setIsActiveIngredientFormOpen(true)}
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
                  >
                    Add your first ingredient
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeIngredients.map((ai) => (
                    <div
                      key={ai.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <span className="text-sm font-medium text-gray-900">{ai.name}</span>
                      <div className="flex-shrink-0 flex items-center space-x-2">
                         {/* Add edit button here if needed */}
                         <button
                            onClick={() => handleDeleteActiveIngredient(ai.id)}
                            className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drugs Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Drugs Inventory</h2>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Drug
                </button>
              </div>
            </div>

            <div className="p-6">
              {drugsList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-600">No drugs found in inventory</p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
                  >
                    Add your first drug
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drugsList.map((drug) => (
                    <div
                      key={drug.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={drug.logo}
                          alt={drug.drugName}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {drug.drugName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {drug.description}
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {categories.find(cat => cat.id === drug.categoryId)?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(drug)}
                          className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(drug.id)}
                          className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Drug Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseForm} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full transform transition-all duration-300 ease-out">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingDrug ? 'Edit Drug' : 'Add New Drug'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="drugName" className="block text-sm font-medium text-gray-700">
                        Drug Name
                      </label>
                      <input
                        type="text"
                        id="drugName"
                        value={formData.drugName}
                        onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="categoryId"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="activeIngredientId" className="block text-sm font-medium text-gray-700">
                      Active Ingredient
                    </label>
                    <select
                      id="activeIngredientId"
                      value={formData.activeIngredientId}
                      onChange={(e) => setFormData({ ...formData, activeIngredientId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select an Active Ingredient</option>
                      {activeIngredients.map((ai) => (
                        <option key={ai.id} value={ai.id}>
                          {ai.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="drugLogo" className="block text-sm font-medium text-gray-700 mb-2">
                      Drug Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      {formData.logo && (
                        <img
                          src={formData.logo}
                          alt="Drug logo preview"
                          className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Upload className="h-5 w-5 mr-2" />
                          {selectedImage ? 'Change Image' : 'Upload Image'}
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        {selectedImage && (
                          <p className="mt-2 text-sm text-gray-500">
                            Selected file: {selectedImage.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Saving...' : editingDrug ? 'Update Drug' : 'Add Drug'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Active Ingredient Modal */}
      {isActiveIngredientFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseActiveIngredientForm} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 ease-out">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Add New Active Ingredient</h3>
                <button
                  onClick={handleCloseActiveIngredientForm}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddActiveIngredientSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="ingredientName"
                      value={newActiveIngredientData.name}
                      onChange={(e) => setNewActiveIngredientData({ ...newActiveIngredientData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ingredientDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="ingredientDescription"
                      value={newActiveIngredientData.description}
                      onChange={(e) => setNewActiveIngredientData({ ...newActiveIngredientData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ingredientArabicName" className="block text-sm font-medium text-gray-700">
                      Ingredient Arabic Name
                    </label>
                    <input
                      type="text"
                      id="ingredientArabicName"
                      value={newActiveIngredientData.ingredientArabicName}
                      onChange={(e) => setNewActiveIngredientData({ ...newActiveIngredientData, ingredientArabicName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseActiveIngredientForm}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                    disabled={isAddingActiveIngredient}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAddingActiveIngredient}
                  >
                    {isAddingActiveIngredient ? 'Adding...' : 'Add Ingredient'}
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
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseDeleteModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 ease-out">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">Delete Drug</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to delete this drug? This action cannot be undone.
                  </p>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseDeleteModal}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Ingredient Delete Confirmation Modal */}
      {showActiveIngredientDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseActiveIngredientDeleteModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 ease-out">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">Delete Active Ingredient</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to delete this active ingredient? This action cannot be undone.
                  </p>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseActiveIngredientDeleteModal}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteActiveIngredient}
                    className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}