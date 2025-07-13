
// API utility functions for backend communication

const API_BASE_URL = 'http://localhost:8080';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// User Authentication APIs
export const userAPI = {
  // User signup
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/User/signup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // User login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/User/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Get user profile (mock - not in your backend)
  getProfile: async () => {
    // TODO: Implement in backend if needed
    const username = localStorage.getItem('username');
    return {
      username,
      email: `${username}@example.com`,
      createdAt: new Date().toISOString()
    };
  },

  // Update user profile (mock - not in your backend)
  updateProfile: async (profileData) => {
    // TODO: Implement in backend if needed
    console.log('Updating profile:', profileData);
    return profileData;
  }
};

// Room Management APIs
export const roomAPI = {
  // Create a new room
  createRoom: async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/room/create-room`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse(response);
  },

  // Join an existing room
  joinRoom: async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/room/join-room`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse(response);
  },

  // Get room info (mock - not in your backend)
  getRoomInfo: async (roomId) => {
    // TODO: Implement in backend if needed
    return {
      roomId,
      participants: ['user1', 'user2'],
      createdAt: new Date().toISOString()
    };
  }
};

// Message APIs (these would typically be handled via WebSocket)
export const messageAPI = {
  // Get message history for a room
  getMessageHistory: async (roomId) => {
    // TODO: Implement REST endpoint in backend if needed
    // Your backend handles this via WebSocket, but you might want a REST endpoint too
    console.log('Getting message history for room:', roomId);
    return [];
  },

  // Send a message (typically done via WebSocket)
  sendMessage: async (roomId, messageData) => {
    // TODO: This is typically handled via WebSocket in your backend
    console.log('Sending message to room:', roomId, messageData);
    return messageData;
  }
};

// Authentication helper functions
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    return !!(token && username);
  },

  // Get current user
  getCurrentUser: () => {
    return localStorage.getItem('username');
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  },

  // Set authentication data
  setAuthData: (token, username) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
  }
};

// Export all APIs
export default {
  user: userAPI,
  room: roomAPI,
  message: messageAPI,
  auth: authUtils
};
