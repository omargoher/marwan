import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Star, Package, Pill, Shield, Zap } from 'lucide-react';
import { drugViewApi, categoriesApi } from '../services/api';
import { DrugResponseDto, Category } from '../types';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
  onToggleWishlist: (product: any) => void;
  wishlistItems: any[];
}

export default function Home({ searchQuery, onAddToCart, onToggleWishlist, wishlistItems }: HomeProps) {
  const [products, setProducts] = useState<DrugResponseDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoriesApi.getAllCategories(),
          drugViewApi.searchDrugsByName('') // Get all products
        ]);

        if (categoriesResponse.status) {
          setCategories(categoriesResponse.data);
        } else {
          console.error('Failed to fetch categories:', categoriesResponse.message);
        }

        if (productsResponse.status) {
          setProducts(productsResponse.data);
        } else {
          console.error('Failed to fetch products:', productsResponse.message);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products and categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim()) {
        try {
          setLoading(true);
          setError('');
          const response = await drugViewApi.searchDrugsByName(searchQuery);
          if (response.status) {
            setProducts(response.data);
          } else {
            console.error('Failed to search products:', response.message);
            setError('Failed to search products. Please try again.');
          }
        } catch (err) {
          console.error('Error searching products:', err);
          setError('Failed to search products. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // If search query is empty, fetch all products
        try {
          setLoading(true);
          setError('');
          const response = await drugViewApi.searchDrugsByName('');
          if (response.status) {
            setProducts(response.data);
          }
        } catch (err) {
          console.error('Error fetching all products:', err);
          setError('Failed to load products. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    // Add debounce to search
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const featuredCategories = [
    { id: '1', name: 'Pain Relief', icon: Pill, color: 'bg-red-100 text-red-600' },
    { id: '2', name: 'Vitamins', icon: Package, color: 'bg-blue-100 text-blue-600' },
    { id: '3', name: 'First Aid', icon: Shield, color: 'bg-green-100 text-green-600' },
    { id: '4', name: 'Energy Boost', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  ];

  const convertToProduct = (drug: DrugResponseDto) => ({
    id: drug.drugId,
    name: drug.drugName,
    description: drug.description || 'No description available',
    price: drug.price,
    image: drug.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500',
    category: 'otc' as const,
    inStock: drug.available,
    requiresPrescription: false,
  });

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
            onClick={() => window.location.reload()} 
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover a wide range of pharmaceutical products and healthcare solutions
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/categories"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Categories
              </Link>
              <Link
                to="/products/otc"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              to={`/products/${category.id}`}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{category.categoryName}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Products'}
          </h2>
          {!searchQuery && (
          <Link
            to="/products/otc"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All →
          </Link>
          )}
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No products found' : 'No products available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'Please check back later'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((drug) => {
              const product = convertToProduct(drug);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={wishlistItems.some(item => item.id === product.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose MedCare?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">All our products are FDA approved and sourced from trusted manufacturers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your medications delivered to your doorstep within 24 hours.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">Our pharmacists are available 24/7 to answer your questions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}