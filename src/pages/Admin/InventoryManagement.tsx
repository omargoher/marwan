import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { products as mockProducts } from '../../data/products';
import { Product } from '../../types';
import axios from 'axios';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<(Product & { stock: number })[]>(
    mockProducts.map(product => ({ ...product, stock: Math.floor(Math.random() * 100) }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/drugs');
        let apiProducts: any[] = [];
        if (Array.isArray(response.data)) {
          apiProducts = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          apiProducts = response.data.data;
        }

        // Map API products to the expected Product type
        const mappedApiProducts: Product[] = apiProducts.map((p) => ({
          id: p.id,
          name: p.drugName || 'Unknown Drug',
          description: p.description || '',
          price: 0, // Default price
          image: p.logo || '',
          category: p.categoryId || 'otc',
          inStock: true, // Default to true
          requiresPrescription: false, // Default to false
        }));

        // Filter out API products that have the same id as a mock product
        const mockIds = new Set(mockProducts.map(p => p.id));
        const newApiProducts = mappedApiProducts.filter(p => !mockIds.has(p.id));

        // Add random stock to API products
        const apiWithStock = newApiProducts.map(product => ({ ...product, stock: Math.floor(Math.random() * 100) }));

        // Merge and deduplicate by id
        setInventory(prev => {
          const allProducts = [...prev, ...apiWithStock];
          const uniqueProductsMap = new Map();
          allProducts.forEach(product => {
            uniqueProductsMap.set(product.id, product);
          });
          return Array.from(uniqueProductsMap.values());
        });
      } catch (err) {
        console.error('Error fetching API products:', err);
        // Fail silently, just keep mock products
      }
    };
    fetchApiProducts();
    // eslint-disable-next-line
  }, []);

  const filteredInventory = inventory.filter(item => {
    const name = item.name || '';
    const description = item.description || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleUpdateStock = (productId: string, newStock: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, stock: newStock }
          : item
      )
    );
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              <option value="otc">Over the Counter</option>
              <option value="prescription">Prescription</option>
              <option value="personal-care">Personal Care</option>
              <option value="vitamins">Vitamins</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={item.image}
                          alt={item.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => handleUpdateStock(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleUpdateStock(item.id, item.stock)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.stock > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        In Stock
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.stock < 10 && (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Low Stock
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}