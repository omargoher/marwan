import React from 'react';
import { Pill, ShoppingBag, Heart } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories = [
    { id: 'otc', name: 'Over the Counter', icon: Pill },
    { id: 'prescription', name: 'Prescription', icon: Heart },
    { id: 'vitamins', name: 'Vitamins & Supplements', icon: Pill },
    { id: 'personal-care', name: 'Personal Care', icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {categories.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelectCategory(selectedCategory === id ? null : id)}
          className={`flex items-center px-4 py-2 rounded-full text-sm transition-colors
            ${
              selectedCategory === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {name}
        </button>
      ))}
    </div>
  );
}