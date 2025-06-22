import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, ShoppingBag, Heart, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Default images for categories
const defaultImages = {
  'Pill': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
  'Heart': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800',
  'ShoppingBag': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800',
};

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/category');
        
        let backendCategories: any[] = [];
        if (Array.isArray(response.data)) {
          backendCategories = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          backendCategories = response.data.data;
        }

        // Map backend categories to our Category interface
        const mappedCategories: Category[] = backendCategories.map((cat) => {
          // Determine which icon to use based on the category name or icon
          let Icon = Pill;
          if (cat.icon === 'Heart' || cat.name?.toLowerCase().includes('prescription')) {
            Icon = Heart;
          } else if (cat.icon === 'ShoppingBag' || cat.name?.toLowerCase().includes('care')) {
            Icon = ShoppingBag;
          }

          // Get the appropriate image
          const image = cat.image || cat.logo || defaultImages[Icon.name as keyof typeof defaultImages] || defaultImages.Pill;

          return {
            id: cat.id,
            name: cat.name || cat.categoryName || 'Unnamed Category',
            description: cat.description || 'No description available',
            image: image,
            icon: Icon
          };
        });

        // Filter out any categories with invalid IDs
        const validCategories = mappedCategories.filter(cat => 
          cat.id && cat.id !== 'string'
        );

        setCategories(validCategories);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-600">{error}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Product Categories</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon || Pill;
          return (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/products/${category.id}`)}
            >
              <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}