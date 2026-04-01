import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Bell, TrendingDown } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();

  // Mock data for demonstration
  const product = {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    store: 'Amazon',
    url: 'https://amazon.com/...',
    currentPrice: 348.00,
    lowestPrice: 328.00,
    highestPrice: 398.00,
    targetPrice: 330.00,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <a href="#" className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm mt-1">
              View on {product.store} <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700">
              <Bell className="w-4 h-4 mr-2 text-gray-500" />
              Edit Alert
            </button>
            <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Stop Tracking
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Current Price</p>
          <p className="text-3xl font-bold text-gray-900">${product.currentPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <TrendingDown className="w-24 h-24 text-green-500 -mt-4 -mr-4" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Lowest Recorded</p>
          <p className="text-3xl font-bold text-green-600">${product.lowestPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Highest Recorded</p>
          <p className="text-3xl font-bold text-gray-900">${product.highestPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 relative">
          <p className="text-sm font-medium text-indigo-600 mb-1">Target Alert Price</p>
          <p className="text-3xl font-bold text-indigo-900">${product.targetPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Price History Chart</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">Chart visualization goes here</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
