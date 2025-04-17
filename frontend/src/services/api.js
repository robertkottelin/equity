import axios from 'axios';

// Create axios instance with default config
// const API = axios.create({
//   baseURL: '/api',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   }
// });

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  });

// Add auth token to requests if available
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Asset CRUD operations
const AssetService = {
  // Get all assets
  getAssets: async () => {
    try {
      const response = await API.get('/equity/assets');
      return response.data.assets;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },
  
  // Add new asset
  addAsset: async (assetData) => {
    try {
      const response = await API.post('/equity/assets', assetData);
      return response.data.asset;
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  },
  
  // Update existing asset
  updateAsset: async (assetId, assetData) => {
    try {
      const response = await API.put(`/equity/assets/${assetId}`, assetData);
      return response.data.asset;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },
  
  // Delete asset
  deleteAsset: async (assetId) => {
    try {
      await API.delete(`/equity/assets/${assetId}`);
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },
  
  // Get portfolio summary
  getSummary: async () => {
    try {
      const response = await API.get('/equity/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  }
};

// Subscription operations
const SubscriptionService = {
    // Check subscription status
    checkSubscription: async () => {
      try {
        const response = await API.get('/check-subscription');
        return response.data.isSubscribed;
      } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
      }
    },
    
    // Cancel subscription
    cancelSubscription: async () => {
      try {
        const response = await API.post('/cancel-subscription');
        return response.data.success;
      } catch (error) {
        console.error('Error canceling subscription:', error);
        throw error;
      }
    }
  };
  
  export { API, AssetService, SubscriptionService };