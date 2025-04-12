// calculations.js - Utility functions for financial calculations

/**
 * Calculate the profit/loss amount for an asset
 * @param {number} currentPrice - Current price per unit
 * @param {number} acquisitionPrice - Price paid per unit
 * @param {number} amount - Number of units
 * @returns {number} - Total profit/loss amount
 */
export const calculateProfitLoss = (currentPrice, acquisitionPrice, amount) => {
    return (currentPrice - acquisitionPrice) * amount;
  };
  
  /**
   * Calculate the profit/loss percentage for an asset
   * @param {number} currentPrice - Current price per unit
   * @param {number} acquisitionPrice - Price paid per unit
   * @returns {number} - Profit/loss percentage
   */
  export const calculateProfitLossPercentage = (currentPrice, acquisitionPrice) => {
    if (acquisitionPrice === 0) return 0;
    return ((currentPrice - acquisitionPrice) / acquisitionPrice) * 100;
  };
  
  /**
   * Calculate the total value of an asset
   * @param {number} price - Current price per unit
   * @param {number} amount - Number of units
   * @returns {number} - Total value
   */
  export const calculateAssetValue = (price, amount) => {
    return price * amount;
  };
  
  /**
   * Calculate the total portfolio value
   * @param {Array} assets - Array of asset objects
   * @returns {number} - Total portfolio value
   */
  export const calculateTotalPortfolioValue = (assets) => {
    return assets.reduce((total, asset) => total + asset.value, 0);
  };
  
  /**
   * Group assets by sector type and calculate totals
   * @param {Array} assets - Array of asset objects
   * @returns {Object} - Object with sector types as keys and summary data as values
   */
  export const groupAssetsBySector = (assets) => {
    return assets.reduce((groups, asset) => {
      const sectorType = asset.sectorType;
      
      if (!groups[sectorType]) {
        groups[sectorType] = { count: 0, value: 0 };
      }
      
      groups[sectorType].count += 1;
      groups[sectorType].value += asset.value;
      
      return groups;
    }, {});
  };
  
  /**
   * Format a number as a currency string
   * @param {number} value - The value to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} - Formatted currency string
   */
  export const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };
  
  /**
   * Format a number as a percentage string
   * @param {number} value - The value to format (as a whole number, e.g., 5 for 5%)
   * @returns {string} - Formatted percentage string
   */
  export const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };