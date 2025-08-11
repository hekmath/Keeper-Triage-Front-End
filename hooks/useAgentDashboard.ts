// hooks/useAgentDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import {
  Message,
  ChatSession,
  Agent,
  QueueSession,
  SystemStats,
} from '@/types/chat';
import { toast } from 'sonner';

export const useAgentDashboard = () => {
  const { socket, isConnected } = useSocket();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [queueSessions, setQueueSessions] = useState<ChatSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<
    Map<string, ChatSession>
  >(new Map());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const loginAsAgent = useCallback(
    (name: string) => {
      if (!socket || !name.trim()) return;

      setAgentName(name);
      socket.emit('agent:join', { name: name.trim() });
    },
    [socket]
  );

  const pickupSession = useCallback(
    (sessionId: string) => {
      if (!socket) return;

      socket.emit('agent:pickup_session', { sessionId });
    },
    [socket]
  );

  const sendMessage = useCallback(
    (sessionId: string, content: string) => {
      if (!socket || !content.trim()) return;

      socket.emit('agent:send_message', {
        sessionId,
        content: content.trim(),
      });
    },
    [socket]
  );

  const closeSession = useCallback(
    (sessionId: string) => {
      if (!socket) return;

      socket.emit('agent:close_session', { sessionId });
    },
    [socket]
  );

  const getStats = useCallback(() => {
    if (!socket) return;
    socket.emit('admin:get_stats');
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleAgentJoined = (data: { agentId: string; agent: Agent }) => {
      setAgentId(data.agentId);
      setIsLoggedIn(true);
      toast.success(`Logged in as ${data.agent.name}`);
    };

    const handleQueueUpdate = (data: { sessions: ChatSession[] }) => {
      // Ensure all sessions have a messages array (might be empty for queue display)
      const sessionsWithMessages = data.sessions.map((session) => ({
        ...session,
        messages: session.messages || [],
      }));
      setQueueSessions(sessionsWithMessages);
    };

    const handleCustomerWaiting = (data: QueueSession) => {
      toast.info(`New customer waiting: ${data.sessionId}`);
    };

    const handleSessionAssigned = (data: {
      sessionId: string;
      session: ChatSession;
    }) => {
      // Ensure session has messages array
      const sessionWithMessages = {
        ...data.session,
        messages: data.session.messages || [],
      };

      setActiveSessions(
        (prev) => new Map(prev.set(data.sessionId, sessionWithMessages))
      );
      setCurrentSessionId(data.sessionId);
      toast.success(`Session ${data.sessionId} assigned to you`);
    };

    const handleMessageReceived = (message: Message) => {
      setActiveSessions((prev) => {
        const updated = new Map(prev);
        const session = updated.get(message.sessionId);
        if (session) {
          const updatedMessages = session.messages || [];
          updated.set(message.sessionId, {
            ...session,
            messages: [...updatedMessages, message],
            updatedAt: new Date(),
          });
        }
        return updated;
      });
    };

    const handleStatusChanged = (data: { status: ChatSession['status'] }) => {
      // Handle status changes for active sessions
    };

    const handleSessionClosed = () => {
      if (currentSessionId) {
        setActiveSessions((prev) => {
          const updated = new Map(prev);
          updated.delete(currentSessionId);
          return updated;
        });
        setCurrentSessionId(null);
        toast.info('Session closed');
      }
    };

    const handleStatsUpdate = (data: SystemStats) => {
      setStats(data);
    };

    const handleError = (error: { message: string }) => {
      toast.error(error.message);
    };

    socket.on('agent:joined', handleAgentJoined);
    socket.on('queue:update', handleQueueUpdate);
    socket.on('queue:customer_waiting', handleCustomerWaiting);
    socket.on('session:assigned', handleSessionAssigned);
    socket.on('message:received', handleMessageReceived);
    socket.on('status:changed', handleStatusChanged);
    socket.on('session:closed', handleSessionClosed);
    socket.on('stats:update', handleStatsUpdate);
    socket.on('error', handleError);

    return () => {
      socket.off('agent:joined', handleAgentJoined);
      socket.off('queue:update', handleQueueUpdate);
      socket.off('queue:customer_waiting', handleCustomerWaiting);
      socket.off('session:assigned', handleSessionAssigned);
      socket.off('message:received', handleMessageReceived);
      socket.off('status:changed', handleStatusChanged);
      socket.off('session:closed', handleSessionClosed);
      socket.off('stats:update', handleStatsUpdate);
      socket.off('error', handleError);
    };
  }, [socket, currentSessionId]);

  // Auto-refresh stats
  useEffect(() => {
    if (isLoggedIn) {
      getStats();
      const interval = setInterval(getStats, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, getStats]);

  return {
    agentId,
    agentName,
    isLoggedIn,
    queueSessions,
    activeSessions: Array.from(activeSessions.values()),
    currentSessionId,
    stats,
    isConnected,
    loginAsAgent,
    pickupSession,
    sendMessage,
    closeSession,
    getStats,
  };
};
