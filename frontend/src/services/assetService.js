// assetService.js - Provides an abstraction layer for asset data operations
// This service will make it easy to replace local storage with API calls in the future

// Retrieve assets from local storage
export const getAssets = () => {
    try {
      const assets = localStorage.getItem('assets');
      return assets ? JSON.parse(assets) : [];
    } catch (error) {
      console.error('Error retrieving assets:', error);
      return [];
    }
  };
  
  // Save assets to local storage
  export const saveAssets = (assets) => {
    try {
      localStorage.setItem('assets', JSON.stringify(assets));
      return true;
    } catch (error) {
      console.error('Error saving assets:', error);
      return false;
    }
  };
  
  // Add a new asset
  export const addAsset = (asset) => {
    try {
      const assets = getAssets();
      const updatedAssets = [...assets, asset];
      return saveAssets(updatedAssets) ? updatedAssets : null;
    } catch (error) {
      console.error('Error adding asset:', error);
      return null;
    }
  };
  
  // Update an existing asset
  export const updateAsset = (index, asset) => {
    try {
      const assets = getAssets();
      if (index < 0 || index >= assets.length) {
        return null;
      }
      
      const updatedAssets = [
        ...assets.slice(0, index),
        asset,
        ...assets.slice(index + 1)
      ];
      
      return saveAssets(updatedAssets) ? updatedAssets : null;
    } catch (error) {
      console.error('Error updating asset:', error);
      return null;
    }
  };
  
  // Delete an asset
  export const deleteAsset = (index) => {
    try {
      const assets = getAssets();
      if (index < 0 || index >= assets.length) {
        return null;
      }
      
      const updatedAssets = [
        ...assets.slice(0, index),
        ...assets.slice(index + 1)
      ];
      
      return saveAssets(updatedAssets) ? updatedAssets : null;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return null;
    }
  };
  
  // Placeholder for future API integration to fetch market data
  export const fetchAssetMarketData = async (symbol) => {
    // This would be replaced with actual API call in the future
    // Example structure for future implementation:
    /*
    try {
      const response = await fetch(`https://api.example.com/market-data/${symbol}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
    */
    
    // Currently returns mock data
    return {
      price: Math.random() * 100 + 50, // Mock price between 50 and 150
      updated: new Date().toISOString(),
    };
  };
  
  // Batch update asset prices
  export const updateAssetPrices = async () => {
    try {
      const assets = getAssets();
      const updatedAssets = await Promise.all(
        assets.map(async (asset) => {
          // In the future, this would make an API call for each asset
          // For now, just return the asset unchanged
          return asset;
        })
      );
      
      return saveAssets(updatedAssets) ? updatedAssets : null;
    } catch (error) {
      console.error('Error updating asset prices:', error);
      return null;
    }
  };