import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { Product } from '../types';
import { ArrowLeft } from 'lucide-react';

interface ProductsProps {
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistItems: Product[];
}

export default function Products({ onAddToCart, onToggleWishlist, wishlistItems }: ProductsProps) {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const categoryName = {
    'otc': 'Over the Counter',
    'prescription': 'Prescription Medicines',
    'vitamins': 'Vitamins & Supplements',
    'personal-care': 'Personal Care'
  }[categoryId || ''] || 'Products';

  const filteredProducts = products.filter(product => product.category === categoryId);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Categories
        </button>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">{categoryName}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isInWishlist={wishlistItems.some(item => item.id === product.id)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available in this category.</p>
        </div>
      )}
    </main>
  );
}