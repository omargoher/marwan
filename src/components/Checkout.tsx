import React, { useState } from 'react';
import { CreditCard, MapPin, Truck } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function Checkout({ items, total, onClose, onComplete }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h2>

              {/* Progress Steps */}
              <div className="flex items-center mb-8">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        s <= step ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                      }`}>
                        {s}
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {s === 1 ? 'Delivery' : s === 2 ? 'Payment' : 'Review'}
                      </span>
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        s < step ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Delivery Address
                    </h3>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Details
                    </h3>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          required
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          required
                          value={formData.cvv}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Order Summary
                    </h3>
                    <div className="border rounded-lg divide-y">
                      {items.map((item) => (
                        <div key={item.product.id} className="p-4 flex items-center">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Total</p>
                        <p>${total.toFixed(2)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    {step === 3 ? 'Place Order' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}