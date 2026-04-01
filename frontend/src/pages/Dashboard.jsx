import React from 'react';
import { Package, TrendingUp, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, trend }) => (
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
    <div className="mt-4 flex items-center text-sm">
      <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
      <span className="text-gray-500 ml-2">from last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Tracked Products" 
          value="1,248" 
          icon={<Package className="w-6 h-6 text-indigo-600" />} 
          trend={12} 
        />
        <StatCard 
          title="Price Drops Today" 
          value="34" 
          icon={<TrendingUp className="w-6 h-6 text-indigo-600" />} 
          trend={5} 
        />
        <StatCard 
          title="Alerts Triggered" 
          value="8" 
          icon={<AlertCircle className="w-6 h-6 text-indigo-600" />} 
          trend={-2} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Price Drop Alert</p>
                <p className="text-xs text-gray-500">Sony WH-1000XM5 dropped by $50</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">2 mins ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New Product Added</p>
                <p className="text-xs text-gray-500">Apple iPhone 15 Pro Max</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
