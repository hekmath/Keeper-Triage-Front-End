// lib/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketManager {
  private socket: Socket | null = null;

  connect(): Socket {
    // Always disconnect existing socket before creating new one
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'],
      forceNew: true, // Force a new connection
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Explicit disconnect with session cleanup
  disconnectWithCleanup(sessionId?: string) {
    if (this.socket && sessionId) {
      // Emit cleanup event before disconnecting
      this.socket.emit('customer:end_chat', { sessionId });
      // Give a small delay for the event to be processed
      setTimeout(() => {
        this.disconnect();
      }, 100);
    } else {
      this.disconnect();
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Add method to reset connection
  resetConnection(): Socket {
    this.disconnect();
    return this.connect();
  }
}

export const socketManager = new SocketManager();
