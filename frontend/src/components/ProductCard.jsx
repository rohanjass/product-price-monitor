import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { id, name, brand, price, image, source, condition } = product;

  const prevPriceRef = useRef(price);
  const [flashColor, setFlashColor] = useState('#ffffff');

  useEffect(() => {
    let timer;
    if (price < prevPriceRef.current) {
      setFlashColor('#dcfce7'); // Tailwind green-100
      timer = setTimeout(() => setFlashColor('#ffffff'), 1500);
    } else if (price > prevPriceRef.current) {
      setFlashColor('#fee2e2'); // Tailwind red-100
      timer = setTimeout(() => setFlashColor('#ffffff'), 1500);
    }
    prevPriceRef.current = price;
    return () => clearTimeout(timer);
  }, [price]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      animate={{ backgroundColor: flashColor }}
      transition={{ backgroundColor: { duration: 0.5 } }}
    >
      <div className="relative aspect-[4/3] bg-gray-50 flex-shrink-0">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm border border-gray-100/50">
            {source}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight" title={name}>
            {name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mb-3 mt-auto">
          {brand && brand !== 'Unknown Brand' ? (
            <span className="inline-flex items-center text-xs font-medium text-gray-500">
              <Tag className="w-3 h-3 mr-1" />
              {brand}
            </span>
          ) : null}
        </div>
        
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{condition}</p>
            <p className="text-lg font-bold text-gray-900">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <button className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors" title="View Details">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
