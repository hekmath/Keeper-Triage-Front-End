// hooks/useCustomerChat.ts
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { Message, ChatSession, CustomerInfo } from '@/types/chat';
import { toast } from 'sonner';

export const useCustomerChat = () => {
  const { socket, isConnected } = useSocket();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatSession['status']>('bot');
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Reset all state when starting a new chat
  const resetChatState = useCallback(() => {
    setSessionId(null);
    setStatus('bot');
    setMessages([]);
    setAgentName(null);
    setIsTyping(false);
    setQueuePosition(null);
    setHasStarted(false);
  }, []);

  const startChat = useCallback(
    (customerInfo: CustomerInfo) => {
      if (!socket) return;

      // Reset state before starting new chat
      resetChatState();

      socket.emit('customer:start_chat', {
        userId: customerInfo.email,
        botContext: `Customer name: ${customerInfo.name}, Email: ${customerInfo.email}. You are a helpful customer service bot.`,
        metadata: customerInfo,
      });

      setHasStarted(true);
    },
    [socket, resetChatState]
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !sessionId || !content.trim()) return;

      socket.emit('customer:send_message', {
        sessionId,
        content: content.trim(),
      });
    },
    [socket, sessionId]
  );

  const requestHumanAgent = useCallback(() => {
    sendMessage('I would like to speak with a human agent please.');
  }, [sendMessage]);

  // Cleanup function
  const endChat = useCallback(() => {
    // Emit a specific customer disconnect event before cleaning up
    if (socket && sessionId) {
      socket.emit('customer:end_chat', { sessionId });
    }

    resetChatState();
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('customerInfo');
    }
  }, [socket, sessionId, resetChatState]);

  useEffect(() => {
    if (!socket) return;

    const handleSessionCreated = (data: {
      sessionId: string;
      status: ChatSession['status'];
    }) => {
      setSessionId(data.sessionId);
      setStatus(data.status);
      toast.success('Chat session started!');
    };

    const handleMessageReceived = (message: Message) => {
      setMessages((prev) => [...prev, message]);

      // Extract queue position from system messages
      if (message.sender === 'system' && message.content.includes('#')) {
        const match = message.content.match(/#(\d+)/);
        if (match) {
          setQueuePosition(parseInt(match[1]));
        }
      }
    };

    const handleStatusChanged = (data: {
      status: ChatSession['status'];
      agentName?: string;
    }) => {
      setStatus(data.status);
      if (data.agentName) {
        setAgentName(data.agentName);
        toast.success(`${data.agentName} has joined the chat!`);
      }

      switch (data.status) {
        case 'waiting':
          toast.info('You have been placed in the queue for a human agent');
          break;
        case 'agent':
          setQueuePosition(null);
          break;
      }
    };

    const handleSessionClosed = () => {
      toast.info('Chat session has been closed');
      setStatus('closed');
    };

    const handleError = (error: { message: string }) => {
      toast.error(error.message);
    };

    socket.on('session:created', handleSessionCreated);
    socket.on('message:received', handleMessageReceived);
    socket.on('status:changed', handleStatusChanged);
    socket.on('session:closed', handleSessionClosed);
    socket.on('error', handleError);

    return () => {
      socket.off('session:created', handleSessionCreated);
      socket.off('message:received', handleMessageReceived);
      socket.off('status:changed', handleStatusChanged);
      socket.off('session:closed', handleSessionClosed);
      socket.off('error', handleError);
    };
  }, [socket]);

  return {
    sessionId,
    status,
    messages,
    agentName,
    isTyping,
    queuePosition,
    isConnected,
    hasStarted,
    startChat,
    sendMessage,
    requestHumanAgent,
    endChat,
    resetChatState,
  };
};
