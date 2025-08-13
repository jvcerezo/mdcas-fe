import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token attached to request:', token.substring(0, 20) + '...');
        console.log('📋 Request headers:', config.headers);
      } else {
        console.error('❌ No token found in localStorage for protected endpoint');
        console.log('🔍 LocalStorage contents:', {
          authToken: localStorage.getItem('authToken'),
          userData: localStorage.getItem('userData')
        });
      }
    } else {
      console.log('🔓 Skipping token for auth endpoint:', config.url);
    }
    
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received:', response.status, response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Token expired or invalid - clearing auth data');
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    console.error('GET request error:', error);
    throw error;
  }
};

export const post = async (url, data, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error('POST request error:', error);
    throw error;
  }
};

export const put = async (url, data, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error('PUT request error:', error);
    throw error;
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    console.error('DELETE request error:', error);
    throw error;
  }
};

// Utility function to check token status
export const checkTokenStatus = () => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  console.log('=== 🔍 TOKEN STATUS CHECK ===');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'None');
  console.log('User data exists:', !!userData);
  console.log('User data:', userData ? JSON.parse(userData) : 'None');
  
  // Check if token looks like a JWT
  if (token) {
    const parts = token.split('.');
    console.log('Token parts count:', parts.length);
    console.log('Looks like JWT:', parts.length === 3);
  }
  
  console.log('=============================');
  
  return { token, userData };
};

export default api;
