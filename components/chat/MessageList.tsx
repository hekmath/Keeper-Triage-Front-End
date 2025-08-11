// components/chat/MessageList.tsx
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/types/chat';
import { Bot, User, UserCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export function MessageList({ messages, className }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageSenderInfo = (sender: Message['sender']) => {
    switch (sender) {
      case 'user':
        return {
          icon: <User className="h-4 w-4" />,
          fallback: 'U',
          name: 'You',
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          alignment: 'justify-end',
          messageColor: 'bg-blue-600 text-white',
        };
      case 'bot':
        return {
          icon: <Bot className="h-4 w-4" />,
          fallback: 'AI',
          name: 'AI Assistant',
          bgColor: 'bg-gray-600',
          textColor: 'text-white',
          alignment: 'justify-start',
          messageColor: 'bg-gray-100 text-gray-900',
        };
      case 'agent':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          fallback: 'A',
          name: 'Agent',
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          alignment: 'justify-start',
          messageColor: 'bg-green-50 text-green-900 border border-green-200',
        };
      case 'system':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          fallback: 'S',
          name: 'System',
          bgColor: 'bg-yellow-600',
          textColor: 'text-white',
          alignment: 'justify-center',
          messageColor: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
        };
      default:
        return {
          icon: <User className="h-4 w-4" />,
          fallback: '?',
          name: 'Unknown',
          bgColor: 'bg-gray-400',
          textColor: 'text-white',
          alignment: 'justify-start',
          messageColor: 'bg-gray-100 text-gray-900',
        };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollArea className={cn('flex-1 p-4 chat-container', className)}>
      <div className="space-y-4 w-full chat-container">
        {messages.map((message) => {
          const senderInfo = getMessageSenderInfo(message.sender);

          if (message.sender === 'system') {
            return (
              <div key={message.id} className="flex justify-center w-full px-2">
                <div
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium max-w-md break-words text-center',
                    senderInfo.messageColor
                  )}
                >
                  {senderInfo.icon}
                  <span className="break-words">{message.content}</span>
                  <span className="opacity-70 whitespace-nowrap">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={cn('flex w-full px-2', senderInfo.alignment)}
            >
              <div
                className={cn(
                  'flex max-w-[75%] space-x-3 overflow-hidden',
                  message.sender === 'user'
                    ? 'flex-row-reverse space-x-reverse'
                    : ''
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      senderInfo.bgColor,
                      senderInfo.textColor,
                      'text-xs'
                    )}
                  >
                    {senderInfo.fallback}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col space-y-1 min-w-0 flex-1 overflow-hidden">
                  <div
                    className={cn(
                      'flex items-center space-x-2 text-xs text-gray-500',
                      message.sender === 'user'
                        ? 'flex-row-reverse space-x-reverse'
                        : ''
                    )}
                  >
                    <span className="whitespace-nowrap">{senderInfo.name}</span>
                    <span className="whitespace-nowrap">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm leading-relaxed chat-message break-anywhere',
                      senderInfo.messageColor,
                      message.sender === 'user'
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
