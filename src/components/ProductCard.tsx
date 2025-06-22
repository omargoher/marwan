import React from 'react';
import { ShoppingCart, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: boolean;
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.requiresPrescription && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Prescription Required
          </div>
        )}
        <button
          onClick={() => onToggleWishlist(product)}
          className="absolute top-2 left-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'
            }`}
          />
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm flex-grow">{product.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock || product.requiresPrescription}
            className={`flex items-center px-3 py-2 rounded-full text-sm
              ${
                product.inStock && !product.requiresPrescription
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}