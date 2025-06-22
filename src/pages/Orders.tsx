import React from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

export default function Orders() {
  const orders = [
    {
      id: '#ORD-2024-001',
      date: '2024-03-15',
      status: 'delivered',
      total: 89.99,
      items: [
        { name: 'Pain Relief Tablets', quantity: 2, price: 24.99 },
        { name: 'Multivitamin Complex', quantity: 1, price: 40.01 }
      ]
    },
    {
      id: '#ORD-2024-002',
      date: '2024-03-14',
      status: 'processing',
      total: 45.98,
      items: [
        { name: 'First Aid Kit', quantity: 1, price: 45.98 }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipping':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    Ordered on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 text-sm font-medium capitalize">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="text-gray-900">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 -mx-6 px-6 pt-4 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">When you place an order, it will appear here.</p>
        </div>
      )}
    </main>
  );
}