
import { Client } from '@stomp/stompjs';

export interface ChatMessage {
  username: string;
  content: string;
  sender: string;
  roomId: string;
  timestamp: string;
}

export class WebSocketService {
  private client: Client | null = null;
  private connected = false;

  constructor() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws-chat',
      connectHeaders: {
        // Add JWT token here when available
        // Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.connected = true;
    };

    this.client.onDisconnect = () => {
      console.log('Disconnected from WebSocket');
      this.connected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Client not initialized'));
        return;
      }

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        this.connected = true;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        reject(new Error('Failed to connect to WebSocket'));
      };

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  subscribeToRoom(roomId: string, onMessageReceived: (message: ChatMessage) => void): void {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    // Subscribe to room messages
    this.client.subscribe(`/topic/room/${roomId}`, (message) => {
      const chatMessage: ChatMessage = JSON.parse(message.body);
      onMessageReceived(chatMessage);
    });

    // Subscribe to message history
    this.client.subscribe(`/user/queue/room/${roomId}/history`, (message) => {
      const history: ChatMessage[] = JSON.parse(message.body);
      history.forEach(msg => onMessageReceived(msg));
    });
  }

  sendMessage(roomId: string, content: string): void {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      content,
      timestamp: new Date().toISOString()
    };

    this.client.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify(message)
    });
  }

  joinRoom(roomId: string): void {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: `/app/chat/${roomId}/join`,
      body: JSON.stringify({})
    });
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
