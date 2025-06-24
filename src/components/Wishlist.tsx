import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, AlertCircle } from 'lucide-react';
import { wishlistApi, drugViewApi } from '../services/api';
import { Wishlist as WishlistType, DrugResponseDetailsDto, Product } from '../types';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function Wishlist({ 
  isOpen, 
  onClose, 
  onRemove, 
  onAddToCart 
}: WishlistProps) {
  const [wishlistData, setWishlistData] = useState<WishlistType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.getWishlist();
      if (response.status) {
        setWishlistData(response.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItem: WishlistType) => {
    try {
      const response = await wishlistApi.deleteWishlist(wishlistItem);
      if (response.status) {
        setWishlistData(prev => prev.filter(item => item.id !== wishlistItem.id));
        onRemove(wishlistItem.drugId);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  const addToWishlist = async (drugId: string) => {
    try {
      const wishlistItem: WishlistType = {
        drugId: drugId
      };
      const response = await wishlistApi.addWishlist(wishlistItem);
      if (response.status) {
        setWishlistData(prev => [...prev, response.data]);
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Heart className="w-6 h-6 mr-2 text-red-500" />
                    Wishlist
                  </h2>
                  <button
                    onClick={onClose}
                    className="ml-3 h-7 flex items-center"
                  >
                    <X className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  </button>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="mt-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : wishlistData.length > 0 ? (
                  <div className="mt-8">
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {wishlistData.map((wishlistItem) => (
                          <WishlistItem 
                            key={wishlistItem.id} 
                            wishlistItem={wishlistItem}
                            onRemove={removeFromWishlist}
                            onAddToCart={onAddToCart}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center">
                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
                    <p className="mt-1 text-sm text-gray-500">Start adding items to your wishlist.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {wishlistData.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-blue-600 font-medium hover:text-blue-500"
                      >
                        Continue Shopping
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WishlistItemProps {
  wishlistItem: WishlistType;
  onRemove: (wishlistItem: WishlistType) => void;
  onAddToCart: (product: Product) => void;
}

function WishlistItem({ wishlistItem, onRemove, onAddToCart }: WishlistItemProps) {
  const [drugDetails, setDrugDetails] = useState<DrugResponseDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrugDetails = async () => {
      try {
        const response = await drugViewApi.getDrugDetails(wishlistItem.drugId);
        if (response.status) {
          setDrugDetails(response.data);
        }
      } catch (err) {
        console.error('Error fetching drug details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrugDetails();
  }, [wishlistItem.drugId]);

  const handleAddToCart = () => {
    if (drugDetails) {
      const product = {
        id: drugDetails.drugId,
        name: drugDetails.drugName,
        description: drugDetails.description || 'No description available',
        price: drugDetails.price,
        image: drugDetails.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500',
        category: 'otc' as const,
        inStock: drugDetails.available,
        requiresPrescription: false,
      };
      onAddToCart(product);
    }
  };

  if (loading) {
    return (
      <li className="py-6 flex">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-md bg-gray-200 h-24 w-24"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </li>
    );
  }

  if (!drugDetails) {
    return null;
  }

  return (
    <li className="py-6 flex">
      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
        <img
          src={drugDetails.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500'}
          alt={drugDetails.drugName}
          className="w-full h-full object-center object-cover"
        />
      </div>

      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{drugDetails.drugName}</h3>
            <p className="ml-4">${drugDetails.price.toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{drugDetails.categoryName}</p>
          {drugDetails.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{drugDetails.description}</p>
          )}
        </div>
        <div className="flex-1 flex items-end justify-between text-sm">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!drugDetails.available}
            className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {drugDetails.available ? 'Add to Cart' : 'Out of Stock'}
          </button>

          <button
            type="button"
            onClick={() => onRemove(wishlistItem)}
            className="font-medium text-red-600 hover:text-red-500 flex items-center"
          >
            <Heart className="w-4 h-4 mr-1" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}