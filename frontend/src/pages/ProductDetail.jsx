import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Bell, TrendingDown, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/products/${id}`, {
          headers: {
            'X-API-Key': 'dev-secret-key'
          }
        });
        if (!response.ok) throw new Error("Failed to load product details");
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const { chartData, lowestPrice, highestPrice } = useMemo(() => {
    if (!product || !product.price_history || product.price_history.length === 0) {
      return { chartData: [], lowestPrice: product?.latest_price || 0, highestPrice: product?.latest_price || 0 };
    }
    
    let low = Infinity;
    let high = -Infinity;
    
    // Sort chronologically just in case
    const history = [...product.price_history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const formattedData = history.map(item => {
      const p = item.price;
      if (p < low) low = p;
      if (p > high) high = p;
      const date = new Date(item.timestamp);
      return {
        timestamp: item.timestamp,
        dateStr: date.toLocaleDateString(),
        price: p
      };
    });

    return {
      chartData: formattedData,
      lowestPrice: low === Infinity ? 0 : low,
      highestPrice: high === -Infinity ? 0 : high,
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <h3 className="font-bold">Error loading product</h3>
          <p className="text-sm mt-1">{error || "Product not found"}</p>
          <Link to="/products" className="mt-4 inline-block text-red-800 underline text-sm">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = product.latest_price || 0;
  // A simple fallback for target alert target, let's just make it 5% lower than current
  const targetPrice = currentPrice * 0.95; 

  return (
    <div className="space-y-6">
      <div>
        <Link to="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name || 'Unknown Product'}</h1>
            {product.brand && <p className="text-sm text-gray-500 mt-1">{product.brand}</p>}
            {product.source && (
              <a href={product.source} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm mt-1 w-max">
                View Source <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
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
          <p className="text-3xl font-bold text-gray-900">${currentPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <TrendingDown className="w-24 h-24 text-green-500 -mt-4 -mr-4" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Lowest Recorded</p>
          <p className="text-3xl font-bold text-green-600">${lowestPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <TrendingUp className="w-24 h-24 text-red-500 -mt-4 -mr-4" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Highest Recorded</p>
          <p className="text-3xl font-bold text-gray-900">${highestPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 relative">
          <p className="text-sm font-medium text-indigo-600 mb-1">Target Alert Price</p>
          <p className="text-3xl font-bold text-indigo-900">${targetPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Price History Chart</h2>
        <div className="h-[400px] w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dateStr" stroke="#888" fontSize={12} tickMargin={10} />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="#888" 
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">Not enough price history data to display chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
