import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ExternalLink } from 'lucide-react';

const dummyProducts = [
  { id: 1, name: 'Sony WH-1000XM5', store: 'Amazon', currentPrice: 348.00, lowestPrice: 328.00, status: 'Tracking' },
  { id: 2, name: 'Apple MacBook Air M2', store: 'Best Buy', currentPrice: 1099.00, lowestPrice: 999.00, status: 'Tracking' },
  { id: 3, name: 'Logitech MX Master 3S', store: 'Amazon', currentPrice: 99.00, lowestPrice: 89.00, status: 'Paused' },
];

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
        <button className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Store</th>
                <th className="px-6 py-4 font-medium">Current Price</th>
                <th className="px-6 py-4 font-medium">Lowest Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dummyProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500">{product.store}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">${product.currentPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-green-600">${product.lowestPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Tracking' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/products/${product.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
