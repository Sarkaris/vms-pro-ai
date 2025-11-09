// API wrapper that allows GET requests but blocks POST/PUT/DELETE with demo popups
import { showDemoToast } from '../components/UI/DemoPopup';
import toast from 'react-hot-toast';

// Base API URL - adjust if needed
const API_BASE = process.env.REACT_APP_API_URL || '';

// Helper to check if method is a write operation
const isWriteOperation = (method) => {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
};

// Wrapper for fetch
export const apiFetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  
  // Allow GET requests to go through to server
  if (!isWriteOperation(method)) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      // Fallback to mock data if server is not available
      const { mockApi } = await import('./mockData');
      return await mockApi.getFallbackData(url);
    }
  }
  
  // Block write operations and show demo popup
  showDemoToast(method.toLowerCase());
  
  // Return a mock success response for UI updates
  return { success: true, message: 'Demo mode - operation not saved' };
};

// Wrapper for axios-style calls
export const apiRequest = async (config) => {
  const method = config.method || 'get';
  const url = config.url || '';
  
  // Allow GET requests
  if (!isWriteOperation(method)) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.data ? JSON.stringify(config.data) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      // Fallback to mock data
      const { mockApi } = await import('./mockData');
      return { data: await mockApi.getFallbackData(url) };
    }
  }
  
  // Block write operations
  showDemoToast(method.toLowerCase());
  toast.success(`Operation completed (Demo - not saved to database)`);
  
  return { data: { success: true, message: 'Demo mode' } };
};

