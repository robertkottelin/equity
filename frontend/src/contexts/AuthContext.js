import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Validate JWT token format
const isValidJWT = (token) => {
  if (!token) return false;
  
  try {
    // Basic format validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    // Decode payload
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    
    return Boolean(payload);
  } catch (e) {
    console.error("JWT validation error:", e);
    return false;
  }
};

// Create the auth context
export const AuthContext = createContext({
  currentUser: null,
  isAuthenticated: false,
  isSubscribed: false,
  isLoading: true,
  error: null,
  token: null,
  login: () => Promise.resolve({ success: false }),
  register: () => Promise.resolve({ success: false }),
  subscribe: () => Promise.resolve({ success: false }),
  logout: () => Promise.resolve({ success: false })
});

// Create the auth provider component
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    currentUser: null,
    isAuthenticated: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
    token: localStorage.getItem('access_token') || null
  });
  
  const apiBaseUrl = "http://localhost:5000/api";

  // Configure axios defaults
  useEffect(() => {
    // Add token to headers via interceptor
    const interceptor = axios.interceptors.request.use(
      config => {
        if (state.token) {
          config.headers['Authorization'] = `Bearer ${state.token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    // Cleanup interceptor on unmount
    return () => axios.interceptors.request.eject(interceptor);
  }, [state.token]);

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      // Validate token format before attempting to use it
      if (!state.token || !isValidJWT(state.token)) {
        localStorage.removeItem('access_token');
        if (mounted) {
          setState(prev => ({
            ...prev,
            token: null,
            isAuthenticated: false,
            isLoading: false
          }));
        }
        return;
      }
      
      try {
        const response = await axios.get(`${apiBaseUrl}/me`);
        
        if (!mounted) return;
        
        setState(prev => ({
          ...prev,
          currentUser: response.data,
          isAuthenticated: true,
          isSubscribed: response.data.isSubscribed || false,
          isLoading: false
        }));
      } catch (error) {
        if (!mounted) return;
        
        // Handle auth errors
        if (error.response?.status === 401 || error.response?.status === 422) {
          // Clear invalid token
          localStorage.removeItem('access_token');
          
          setState(prev => ({
            ...prev,
            token: null,
            currentUser: null,
            isAuthenticated: false,
            isSubscribed: false,
            isLoading: false,
            error: null
          }));
          return;
        }
        
        // Unexpected error
        console.error("Authentication check failed:", error);
        setState(prev => ({
          ...prev,
          currentUser: null,
          isAuthenticated: false,
          isSubscribed: false,
          isLoading: false,
          error: error.message || "Authentication check failed"
        }));
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [state.token, apiBaseUrl]);

  // Login function
  const login = async (email, password) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await axios.post(`${apiBaseUrl}/login`, { email, password });
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
      }
      
      // Security fix: Clear any temporary data in localStorage
      clearLocalStorageData();
      
      setState(prev => ({
        ...prev,
        token: response.data.token,
        currentUser: response.data.user,
        isAuthenticated: true,
        isSubscribed: response.data.user.isSubscribed || false,
        isLoading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {  
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.response?.data?.error || "Login failed"
      }));
      
      return { 
        success: false, 
        error: error.response?.data?.error || "Login failed" 
      };
    }
  };

  // Register function
  const register = async (email, password) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await axios.post(`${apiBaseUrl}/register`, { email, password });
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
      }
      
      // Security fix: Clear any temporary data in localStorage
      clearLocalStorageData();
      
      setState(prev => ({
        ...prev,
        token: response.data.token,
        currentUser: response.data.user,
        isAuthenticated: true,
        isSubscribed: response.data.user.isSubscribed || false,
        isLoading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.response?.data?.error || "Registration failed"
      }));
      
      return { 
        success: false, 
        error: error.response?.data?.error || "Registration failed" 
      };
    }
  };

  // Subscribe function
  const subscribe = async (paymentMethodId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await axios.post(`${apiBaseUrl}/subscribe`, { paymentMethodId });
      
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          isLoading: false,
          error: null
        }));
        
        return { 
          success: true,
          subscriptionId: response.data.subscriptionId
        };
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: response.data.error || "Subscription failed"
        }));
        
        return { 
          success: false, 
          error: response.data.error || "Subscription failed" 
        };
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.response?.data?.error || "Subscription failed"
      }));
      
      return { 
        success: false, 
        error: error.response?.data?.error || "Subscription failed" 
      };
    }
  };

  // Security fix: Add helper function to clear all local storage data
  const clearLocalStorageData = () => {
    // Clear any potentially sensitive data from localStorage
    localStorage.removeItem('assets');
    
    // Clean up any other application data
    const keysToPreserve = ['access_token']; // Only keep the auth token
    
    Object.keys(localStorage).forEach(key => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  // Logout function
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await axios.post(`${apiBaseUrl}/logout`);
      
      // Security fix: Clear all data from localStorage
      clearLocalStorageData();
      
      // Remove token from localStorage
      localStorage.removeItem('access_token');
      
      setState({
        currentUser: null,
        isAuthenticated: false,
        isSubscribed: false,
        isLoading: false,
        error: null,
        token: null
      });
      
      return { success: true };
    } catch (error) {
      // Even if server logout fails, clear client-side auth state
      clearLocalStorageData();
      localStorage.removeItem('access_token');
      
      setState({
        currentUser: null,
        isAuthenticated: false,
        isSubscribed: false,
        isLoading: false,
        error: null,
        token: null
      });
      
      return { success: true };
    }
  };

  // Return auth context provider
  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      subscribe,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};