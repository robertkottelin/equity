import axios from 'axios';

// Define API base URL from environment variable when possible
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000, // Add request timeout
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

// Add response interceptor for handling common errors
API.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors consistently
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('access_token');
      
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        // Optional: redirect to login page
        // window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Asset CRUD operations
const AssetService = {
  // Get all assets
  getAssets: async () => {
    try {
      const response = await API.get('/equity/assets');
      return response.data.assets || [];
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },
  
  // Add new asset
  addAsset: async (assetData) => {
    try {
      // Validate required fields before sending
      const requiredFields = ['sectorType', 'name', 'price', 'acquisitionPrice', 'amount'];
      for (const field of requiredFields) {
        if (!assetData[field] && assetData[field] !== 0) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
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
      if (!assetId) {
        throw new Error('Asset ID is required');
      }
      
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
      if (!assetId) {
        throw new Error('Asset ID is required');
      }
      
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