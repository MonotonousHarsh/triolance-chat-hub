
// API utility functions for communicating with the backend

const API_BASE_URL = 'http://localhost:8080/real-time';

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// User Authentication APIs
export const authAPI = {
  signup: async (userData) => {
    return apiRequest('/User/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest('/User/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Room Management APIs
export const roomAPI = {
  createRoom: async (roomData) => {
    return apiRequest('/room/create-room', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  joinRoom: async (roomData) => {
    return apiRequest('/room/join-room', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },
};

// Authentication helpers
export const auth = {
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    return !!(token && username);
  },

  getUsername: () => {
    return localStorage.getItem('username');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  },

  setAuth: (username, token) => {
    localStorage.setItem('username', username);
    localStorage.setItem('authToken', token);
  },
};

// Error handling utility
export const handleAPIError = async (response) => {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || 'An error occurred';
    } catch {
      errorMessage = await response.text() || 'An error occurred';
    }
    throw new Error(errorMessage);
  }
  return response;
};
