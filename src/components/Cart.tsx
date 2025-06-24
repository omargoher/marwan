import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { cartApi, drugViewApi } from '../services/api';
import { Cart as CartType, Item, DrugResponseDetailsDto, CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  total: number;
  onCheckout: () => void;
  isAuthenticated: boolean;
}

export default function Cart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  total, 
  onCheckout, 
  isAuthenticated 
}: CartProps) {
  const [cartData, setCartData] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCart();
    }
  }, [isOpen, isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cartApi.getItemsFromCart();
      if (response.status) {
        setCartData(response.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (item: Item) => {
    try {
      setError('');
      const response = await cartApi.removeFromCart(item);
      if (response.status) {
        // Refresh cart data after removing item
        await fetchCart();
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from cart. Please try again.');
    }
  };

  const updateCartItem = async (id: string, item: Item) => {
    try {
      setError('');
      const response = await cartApi.updateCartItem(id, item);
      if (response.status) {
        // Refresh cart data after updating item
        await fetchCart();
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item. Please try again.');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setError('Please sign in to checkout');
      return;
    }
    onCheckout();
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
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Shopping Cart
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : isAuthenticated && cartData && cartData.items.length > 0 ? (
                  <div className="mt-8">
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cartData.items.map((item) => (
                          <CartItemComponent 
                            key={item.id} 
                            item={item} 
                            onRemove={removeFromCart}
                            onUpdateQuantity={updateCartItem}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : !isAuthenticated && items.length > 0 ? (
                  <div className="mt-8">
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {items.map((cartItem) => (
                          <LocalCartItem 
                            key={cartItem.product.id} 
                            cartItem={cartItem} 
                            onUpdateQuantity={onUpdateQuantity}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                    <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {((isAuthenticated && cartData && cartData.items.length > 0) || (!isAuthenticated && items.length > 0)) && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Subtotal</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Checkout
                    </button>
                  </div>
                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      or{' '}
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

interface CartItemProps {
  item: Item;
  onRemove: (item: Item) => void;
  onUpdateQuantity: (id: string, item: Item) => void;
}

function CartItemComponent({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const [drugDetails, setDrugDetails] = useState<DrugResponseDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrugDetails = async () => {
      try {
        const response = await drugViewApi.getDrugDetails(item.drugId);
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
  }, [item.drugId]);

  const handleQuantityChange = (newQuantity: number) => {
    if (item.id) {
      const updatedItem = { ...item, quantity: newQuantity };
      onUpdateQuantity(item.id, updatedItem);
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
            <p className="ml-4">${((item.price || drugDetails.price) * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{drugDetails.categoryName}</p>
        </div>
        <div className="flex-1 flex items-end justify-between text-sm">
          <div className="flex items-center space-x-2">
            <label htmlFor={`quantity-${item.id}`} className="text-gray-500">Qty:</label>
            <select
              id={`quantity-${item.id}`}
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item)}
            className="font-medium text-blue-600 hover:text-blue-500 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

interface LocalCartItemProps {
  cartItem: CartItem;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

function LocalCartItem({ cartItem, onUpdateQuantity }: LocalCartItemProps) {
  return (
    <li className="py-6 flex">
      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
        <img
          src={cartItem.product.image}
          alt={cartItem.product.name}
          className="w-full h-full object-center object-cover"
        />
      </div>

      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{cartItem.product.name}</h3>
            <p className="ml-4">${(cartItem.product.price * cartItem.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{cartItem.product.category}</p>
        </div>
        <div className="flex-1 flex items-end justify-between text-sm">
          <div className="flex items-center space-x-2">
            <label htmlFor={`quantity-${cartItem.product.id}`} className="text-gray-500">Qty:</label>
            <select
              id={`quantity-${cartItem.product.id}`}
              value={cartItem.quantity}
              onChange={(e) => onUpdateQuantity(cartItem.product.id, parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onUpdateQuantity(cartItem.product.id, 0)}
            className="font-medium text-blue-600 hover:text-blue-500 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}