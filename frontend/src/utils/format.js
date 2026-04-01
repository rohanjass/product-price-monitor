/**
 * Format a number as a USD currency string
 * @param {number} value 
 * @returns {string} formatted currency
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

/**
 * Format a date string or timestamp into a readable date
 * @param {string|number|Date} date 
 * @returns {string} formatted date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};
