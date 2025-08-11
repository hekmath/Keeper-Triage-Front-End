// components/chat/StatusIndicator.tsx
import { Badge } from '@/components/ui/badge';
import { ChatSession } from '@/types/chat';
import { Bot, User, Clock, Wifi, WifiOff } from 'lucide-react';

interface StatusIndicatorProps {
  status: ChatSession['status'];
  agentName?: string | null;
  queuePosition?: number | null;
  isConnected: boolean;
}

export function StatusIndicator({
  status,
  agentName,
  queuePosition,
  isConnected,
}: StatusIndicatorProps) {
  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        variant: 'destructive' as const,
        icon: <WifiOff className="h-3 w-3" />,
        text: 'Disconnected',
        description: 'Trying to reconnect...',
      };
    }

    switch (status) {
      case 'bot':
        return {
          variant: 'default' as const,
          icon: <Bot className="h-3 w-3" />,
          text: 'AI Assistant',
          description: 'Chatting with our AI assistant',
        };
      case 'waiting':
        return {
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3" />,
          text: queuePosition ? `Queue Position #${queuePosition}` : 'In Queue',
          description: 'Waiting for the next available agent',
        };
      case 'agent':
        return {
          variant: 'default' as const,
          icon: <User className="h-3 w-3" />,
          text: agentName ? `Agent: ${agentName}` : 'Human Agent',
          description: 'Connected to a human agent',
        };
      case 'closed':
        return {
          variant: 'outline' as const,
          icon: null,
          text: 'Chat Ended',
          description: 'This conversation has been closed',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <Wifi className="h-3 w-3" />,
          text: 'Connected',
          description: 'Ready to chat',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <Badge
          variant={statusInfo.variant}
          className="flex items-center space-x-1"
        >
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </Badge>
        <span className="text-sm text-gray-600">{statusInfo.description}</span>
      </div>

      {status === 'waiting' && queuePosition && (
        <div className="text-xs text-gray-500">
          Estimated wait: {Math.max(1, (queuePosition - 1) * 2)} min
        </div>
      )}
    </div>
  );
}
