/**
 * Normalizes raw product data from various scrapers/sources into a standardized format.
 * 
 * @param {Object} data - Raw product JSON object
 * @returns {Object|null} Normalized product object or null if data is invalid
 */
export const normalizeProduct = (data) => {
  if (!data || typeof data !== 'object') return null;
  
  // 1. Extract image safely
  let image = null;
  if (Array.isArray(data.main_images) && data.main_images.length > 0) {
    image = data.main_images[0].url || data.main_images[0];
  } else if (Array.isArray(data.images) && data.images.length > 0) {
    image = data.images[0].url || data.images[0];
  } else if (typeof data.image === 'string') {
    image = data.image;
  }

  // 2. Derive source from URL
  let source = 'Unknown';
  const url = data.product_url || data.url;
  if (url) {
    try {
      source = new URL(url).hostname.replace('www.', '');
    } catch (e) {
      source = url;
    }
  }

  // 3. Extract condition safely
  let condition = data.condition;
  if (!condition && data.metadata) {
    condition = data.metadata.condition || 
                data.metadata.condition_display || 
                data.metadata.item_condition;
  }

  // 4. Extract location safely
  let location = data.location;
  if (!location && data.metadata) {
    location = data.metadata.seller_location || data.metadata.location;
  }

  // 5. Extract brand safely
  let brand = data.brand || data.designer;
  if (!brand && data.metadata) {
    brand = data.metadata.brand || data.metadata.designer;
  }

  // Construct normalized object
  return {
    id: data.product_id || data.id,
    name: data.model || data.name || data.title || 'Unknown Product',
    brand: brand || 'Unknown Brand',
    price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
    image: image || '',
    source: source,
    condition: condition || 'Not specified',
    location: location || 'Not specified'
  };
};

/**
 * Normalizes an array of raw product data objects.
 * 
 * @param {Array} products - Array of raw product JSON objects
 * @returns {Array} Array of normalized product objects
 */
export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct).filter(Boolean);
};
