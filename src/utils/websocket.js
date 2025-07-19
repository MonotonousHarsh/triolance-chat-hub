import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let currentRoom = null;

export const connectToRoom = (roomId, username, onMessageReceived) => {
  return new Promise((resolve, reject) => {
    // Disconnect existing connection if any
    if (stompClient && stompClient.connected) {
      stompClient.deactivate();
    }

    // Create SockJS connection
    const socket = new SockJS('http://localhost:8080/real-time/ws-chat');

    // Create STOMP client
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
          body: JSON.stringify({ username })
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
  } else {
    console.error('Cannot send message: not connected to a room');
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

export const isConnected = () => {
  return stompClient && stompClient.connected;
};