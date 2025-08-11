// hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from '@/lib/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = socketManager.connect();
    const socket = socketRef.current;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
