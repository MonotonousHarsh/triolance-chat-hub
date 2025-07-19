import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE_URL = 'http://localhost:8080';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

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

export const authAPI = {
  signup: async (userData) => {
    return apiRequest('/real-time/User/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest('/real-time/User/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

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

export const auth = {
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    return !!(token && username);
  },

  getUsername: () => localStorage.getItem('username'),
  getToken: () => localStorage.getItem('authToken'),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  },

  setAuth: (username, token) => {
    localStorage.setItem('username', username);
    localStorage.setItem('authToken', token);
  },
};

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

let stompClient = null;
let currentRoom = null;

export const connectToRoom = (roomId, username, onMessageReceived) => {
  return new Promise((resolve, reject) => {
    if (stompClient && stompClient.connected) {
      stompClient.deactivate();
    }

    const socket = new SockJS('http://localhost:8080/ws-chat');
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      debug: (str) => console.debug('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('Connected to WebSocket for room:', roomId);

        // Subscribe to room messages
        stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
          const parsedMessage = JSON.parse(message.body);
          onMessageReceived(parsedMessage);
        });

        // Subscribe to private history messages
        stompClient.subscribe(`/user/queue/history/${roomId}`, (message) => {
          const history = JSON.parse(message.body);
          history.forEach(msg => onMessageReceived(msg));
        });

        // Send join notification
        stompClient.publish({
          destination: `/app/chat/${roomId}/join`,
          body: JSON.stringify({})
        });

        currentRoom = roomId;
        resolve();
      },

      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers.message);
        reject(new Error(frame.headers.message));
      },

      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        currentRoom = null;
      }
    });

    stompClient.activate();
  });
};

export const sendMessage = (content) => {
  if (stompClient && stompClient.connected && currentRoom) {
    stompClient.publish({
      destination: `/app/chat/${currentRoom}/send`,
      body: JSON.stringify({ content })
    });
  }
};

export const disconnectFromRoom = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    currentRoom = null;
    console.log('Disconnected from WebSocket');
  }
};

export const isConnected = () => stompClient && stompClient.connected;