import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { normalizeProducts } from '../utils/normalize';
import ProductCard from './ProductCard';

// Load directly from combined JSON
import rawData from '../../../data/combined.json';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  useEffect(() => {
    // Simulate a network request for realistic loading states
    const loadData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be a fetch call
        await new Promise(resolve => setTimeout(resolve, 600)); 
        
        if (!rawData) throw new Error("Failed to load data");
        
        const normalizedData = normalizeProducts(rawData);
        setProducts(normalizedData);
      } catch (err) {
        setError(err.message || 'Error parsing product data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    if (products.length === 0) return;

    const intervalId = setInterval(() => {
      setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        // Randomly update 1 to 3 products
        const numUpdates = Math.floor(Math.random() * 3) + 1;
        let updateCount = 0;
        
        for (let i = 0; i < numUpdates; i++) {
          const randIndex = Math.floor(Math.random() * newProducts.length);
          const product = newProducts[randIndex];
          
          // Only update a product's price occasionally
          if (Math.random() > 0.5) continue;
          
          // Update between -5% to +5%
          const changePercent = (Math.random() * 10 - 5) / 100;
          if (Math.abs(changePercent) < 0.01) continue; 
          
          const newPrice = Number((product.price * (1 + changePercent)).toFixed(2));
          const isDrop = newPrice < product.price;
          
          if (isDrop) {
            toast.success(`Price drop! ${product.name.substring(0, 20)}... is now $${newPrice}`, {
              icon: '📉',
              style: { borderRadius: '8px', background: '#333', color: '#fff' }
            });
          } else {
            toast(`Price increase: ${product.name.substring(0, 20)}... is now $${newPrice}`, {
              icon: '📈',
              style: { borderRadius: '8px', background: '#333', color: '#fff' }
            });
          }
          
          newProducts[randIndex] = { ...product, price: newPrice };
          updateCount++;
        }
        
        return updateCount > 0 ? newProducts : prevProducts;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [products.length]);

  // Compute derived state for brands list
  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(b => b && b !== 'Unknown Brand'));
    return ['All', ...Array.from(uniqueBrands).sort()];
  }, [products]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
      
      return matchesSearch && matchesBrand;
    });
  }, [products, searchQuery, selectedBrand]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <h3 className="font-bold">Error loading products</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search products by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 sm:w-64">
          <Filter className="text-gray-400 w-5 h-5 ml-1" />
          <select 
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand === 'All' ? 'All Brands' : brand}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-end pb-2">
        <h2 className="text-lg font-bold text-gray-900">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} found
        </h2>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.map(product => (
            <ProductCard key={product.id || product.name || Math.random()} product={product} />
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500 font-medium">No products match your current filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedBrand('All'); }}
            className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
