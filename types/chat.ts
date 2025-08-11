export interface Message {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'bot' | 'agent' | 'system';
  timestamp: Date;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  status: 'bot' | 'waiting' | 'agent' | 'closed';
  messages: Message[]; // This might be empty for queue sessions
  messageCount?: number; // Add this for efficient queue display
  createdAt: Date;
  updatedAt: Date;
  botContext?: string;
  assignedAgent?: string;
  metadata?: any;
  queueInfo?: {
    sessionId: string;
    status: string;
    priority: string;
    waitTime: number;
    position: number;
  };
}

export interface Agent {
  id: string;
  socketId: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  activeSessions?: string[]; // Make optional since backend might not include this
  joinedAt: Date;
  lastActiveAt?: Date; // Add this field from backend
}

export interface CustomerInfo {
  name: string;
  email: string;
}

export interface QueueSession {
  sessionId: string;
  session: ChatSession;
  transferReason: string;
  priority: 'low' | 'normal' | 'high';
}

export interface SystemStats {
  totalSessions: number;
  activeSessions: number;
  queueLength: number;
  totalAgents: number;
  availableAgents: number;
  queueBreakdown?: {
    high: number;
    normal: number;
    low: number;
  };
  avgWaitTime?: number;
  messagesLast24h?: number;
}
