import React from 'react';
import { Plus } from 'lucide-react';
import ProductList from '../components/ProductList';

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
        <button className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-not-allowed opacity-50">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <ProductList />
    </div>
  );
};

export default Products;
