import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertCircle, Loader2, BarChart2, PieChart } from 'lucide-react';

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-indigo-50 rounded-lg">
        {icon}
      </div>
    </div>
    {subtitle && (
      <div className="mt-4 flex items-center text-sm">
        <span className="text-gray-500">{subtitle}</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/analytics', {
        headers: {
          'X-API-Key': 'dev-secret-key'
        }
      });
      if (!response.ok) throw new Error("Failed to load analytics");
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100">
        <h3 className="font-bold">Error loading analytics</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button 
          onClick={loadAnalytics}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Tracked Products" 
          value={analytics.total_products} 
          icon={<Package className="w-6 h-6 text-indigo-600" />} 
          subtitle="Across all sources"
        />
        <StatCard 
          title="Monitored Categories" 
          value={analytics.by_category.length} 
          icon={<BarChart2 className="w-6 h-6 text-indigo-600" />} 
          subtitle="Distinct groupings"
        />
        <StatCard 
          title="Active Sources" 
          value={analytics.by_source.length} 
          icon={<PieChart className="w-6 h-6 text-indigo-600" />} 
          subtitle="Stores & Websites"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gray-500" />
            Products by Source
          </h2>
          <div className="space-y-4">
            {analytics.by_source.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.source}</span>
                  <span className="text-gray-500">{item.total_products} items</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${Math.max(5, (item.total_products / analytics.total_products) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-gray-500" />
            Average Price by Category
          </h2>
          <div className="space-y-3">
            {analytics.by_category.sort((a,b) => b.average_price - a.average_price).slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {item.category.substring(0,2).toUpperCase() || 'UN'}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={item.category || 'Uncategorized'}>
                    {item.category || 'Uncategorized'}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  ${item.average_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
