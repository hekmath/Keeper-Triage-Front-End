// components/agent/ActiveChats.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatSession } from '@/types/chat';
import {
  MessageCircle,
  User,
  Clock,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveChatsProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onSendMessage: (sessionId: string, content: string) => void;
  onCloseSession: (sessionId: string) => void;
}

export function ActiveChats({
  sessions,
  currentSessionId,
  onSelectSession,
  onSendMessage,
  onCloseSession,
}: ActiveChatsProps) {
  const [minimizedSessions, setMinimizedSessions] = useState<Set<string>>(
    new Set()
  );

  const toggleMinimize = (sessionId: string) => {
    const newMinimized = new Set(minimizedSessions);
    if (newMinimized.has(sessionId)) {
      newMinimized.delete(sessionId);
    } else {
      newMinimized.add(sessionId);
    }
    setMinimizedSessions(newMinimized);
  };

  const formatLastActivity = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return 'No messages';

    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - new Date(lastMessage.timestamp).getTime()) / 60000
    );

    if (diff < 1) return 'Just now';
    if (diff === 1) return '1m ago';
    if (diff < 60) return `${diff}m ago`;

    const hours = Math.floor(diff / 60);
    if (hours === 1) return '1h ago';
    return `${hours}h ago`;
  };

  const getLastUserMessage = (session: ChatSession) => {
    const userMessages = session.messages.filter(
      (msg) => msg.sender === 'user'
    );
    const lastUserMessage = userMessages[userMessages.length - 1];
    return lastUserMessage?.content || 'No user messages';
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Active Chats</span>
            <Badge variant="secondary">0 active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No active chats</p>
            <p className="text-sm text-gray-500 mt-1">
              Pick up customers from the queue to start chatting
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const isMinimized = minimizedSessions.has(session.id);
        const isSelected = currentSessionId === session.id;

        return (
          <Card
            key={session.id}
            className={cn(
              'transition-all duration-200',
              isSelected ? 'ring-2 ring-blue-500' : '',
              isMinimized ? 'h-auto' : 'h-1/2'
            )}
          >
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {session.metadata?.name || session.userId}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {session.metadata?.email || 'No email'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatLastActivity(session)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.messages.length} msgs
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMinimize(session.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-3 w-3" />
                    ) : (
                      <Minimize2 className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseSession(session.id);
                    }}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {isMinimized && (
                <div className="mt-2 text-xs text-gray-600 line-clamp-1">
                  Last: {getLastUserMessage(session)}
                </div>
              )}
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0 h-80 flex flex-col overflow-hidden">
                <MessageList
                  messages={session.messages}
                  className="flex-1 border-b overflow-hidden"
                />
                <div className="p-2 flex-shrink-0">
                  <MessageInput
                    onSendMessage={(content) =>
                      onSendMessage(session.id, content)
                    }
                    status="agent"
                    isConnected={true}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
