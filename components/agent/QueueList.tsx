// components/agent/QueueList.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatSession } from '@/types/chat';
import { Clock, User, MessageCircle } from 'lucide-react';

interface QueueListProps {
  sessions: ChatSession[];
  onPickupSession: (sessionId: string) => void;
  isLoading?: boolean;
}

export function QueueList({
  sessions,
  onPickupSession,
  isLoading = false,
}: QueueListProps) {
  const formatWaitTime = (createdAt: Date) => {
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - new Date(createdAt).getTime()) / 60000
    );

    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 minute';
    if (diff < 60) return `${diff} minutes`;

    const hours = Math.floor(diff / 60);
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Customer Queue</span>
            <Badge variant="secondary">0 waiting</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No customers waiting</p>
            <p className="text-sm text-gray-500 mt-1">
              New chat requests will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Customer Queue</span>
          <Badge variant="secondary">{sessions.length} waiting</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className="mt-1 text-xs">
                    #{index + 1}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {session.metadata?.name || session.userId}
                    </p>
                    {session.metadata?.priority && (
                      <Badge
                        className={getPriorityColor(session.metadata.priority)}
                      >
                        {session.metadata.priority}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {session.metadata?.email || 'No email provided'}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Waiting {formatWaitTime(session.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{session.messages.length} messages</span>
                    </div>
                  </div>

                  {session.metadata?.transferReason && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <span className="font-medium text-yellow-800">
                        Reason:{' '}
                      </span>
                      <span className="text-yellow-700">
                        {session.metadata.transferReason}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => onPickupSession(session.id)}
                disabled={isLoading}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'Picking up...' : 'Pick Up'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
