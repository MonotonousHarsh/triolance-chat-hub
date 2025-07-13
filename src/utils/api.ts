
const API_BASE_URL = 'http://localhost:8080';

export interface User {
  username: string;
  email: string;
  password: string;
}

export interface Room {
  roomId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async signup(userData: User): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/User/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async login(credentials: { username: string; password: string }): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/User/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const message = await response.text();
        return { success: true, data: message };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async createRoom(roomData: Room): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/room/create-room`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        const message = await response.text();
        return { success: true, data: message };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async joinRoom(roomData: Room): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/room/join-room`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }
}

export const apiService = new ApiService();
