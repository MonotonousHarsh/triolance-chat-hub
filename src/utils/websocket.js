import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let currentRoom = null;
let reconnectCount = 0;
const MAX_RECONNECT_ATTEMPTS = 3; // Reduced from 5 to 3
let connectionPromise = null;
let activeReconnectTimeout = null;

/**
 * Connect to a room via SockJS-backed STOMP.
 */
export function connectToRoom(roomId, username, onMessageReceived) {
  // Cancel any pending reconnection attempts
  if (activeReconnectTimeout) {
    clearTimeout(activeReconnectTimeout);
    activeReconnectTimeout = null;
  }

  // Return existing connection promise if available
  if (connectionPromise) {
    return connectionPromise;
  }

  // Tear down any existing client
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  connectionPromise = new Promise((resolve, reject) => {
    const token = localStorage.getItem('authToken');
    const socket = new SockJS('http://localhost:8080/real-time/ws-chat');

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (msg) => console.debug('STOMP:', msg),
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 0, // Disable built-in reconnection

      onConnect: () => {
        reconnectCount = 0; // Reset on successful connection
        console.log('▶ STOMP connected to room', roomId);

        client.roomSub = client.subscribe(
          `/topic/room/${roomId}`,
          (msg) => onMessageReceived(JSON.parse(msg.body))
        );

        client.historySub = client.subscribe(
          `/user/queue/history/${roomId}`,
          (msg) => JSON.parse(msg.body).forEach(onMessageReceived)
        );

        client.publish({
          destination: `/app/chat/${roomId}/join`,
          body: JSON.stringify({ username }),
        });

        currentRoom = roomId;
        resolve();
      },

      onStompError: (frame) => {
        console.error('⤫ STOMP error:', frame.headers.message);
        if (!client.connected) {
          handleReconnect(reject, roomId, username, onMessageReceived);
        }
      },

      onWebSocketClose: (evt) => {
        console.log('✖ SockJS closed', evt);
        currentRoom = null;
        if (client.roomSub) client.roomSub.unsubscribe();
        if (client.historySub) client.historySub.unsubscribe();
        handleReconnect(reject, roomId, username, onMessageReceived);
      }
    });

    // Transport-level errors
    client.onWebSocketError = (evt) => {
      console.error('✖ Transport error:', evt);
      handleReconnect(reject, roomId, username, onMessageReceived);
    };

    stompClient = client;
    client.activate();
  });

  return connectionPromise;
}

/** Handle reconnection with exponential backoff */
function handleReconnect(reject, roomId, username, onMessageReceived) {
  if (reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnect attempts reached');
    connectionPromise = null;
    reject(new Error('Connection failed after multiple attempts'));
    return;
  }

  const delay = Math.pow(2, reconnectCount) * 1000;
  reconnectCount++;

  console.log(`Reconnecting in ${delay}ms (attempt ${reconnectCount})`);

  // Clear any existing timeout
  if (activeReconnectTimeout) {
    clearTimeout(activeReconnectTimeout);
  }

  activeReconnectTimeout = setTimeout(() => {
    // Reset connection promise to allow new attempts
    connectionPromise = null;

    // Clean up before reconnecting
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }

    connectToRoom(roomId, username, onMessageReceived)
      .catch(() => {}); // Avoid unhandled rejection
  }, delay);
}

/** Send a chat message */
export function sendMessage(content) {
  if (stompClient?.connected && currentRoom) {
    stompClient.publish({
      destination: `/app/chat/${currentRoom}/send`,
      body: JSON.stringify({ content }),
    });
  }
}

/** Cleanly disconnect */
export function disconnectFromRoom() {
  if (!stompClient) return;

  // Prevent reconnection
  if (activeReconnectTimeout) {
    clearTimeout(activeReconnectTimeout);
    activeReconnectTimeout = null;
  }

  reconnectCount = MAX_RECONNECT_ATTEMPTS; // Block future reconnections
  connectionPromise = null;

  if (stompClient.roomSub) stompClient.roomSub.unsubscribe();
  if (stompClient.historySub) stompClient.historySub.unsubscribe();
  stompClient.deactivate();
  stompClient = null;
  currentRoom = null;
  console.log('✅ Disconnected');
}

/** Check live connection */
export function isConnected() {
  return Boolean(stompClient?.connected);
}