// components/chat/MessageInput.tsx
import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';
import { ChatSession } from '@/types/chat';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onRequestAgent?: () => void;
  status: ChatSession['status'];
  isConnected: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onRequestAgent,
  status,
  isConnected,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const canSend =
    isConnected &&
    !disabled &&
    status !== 'closed' &&
    message.trim().length > 0;
  const showRequestAgent = status === 'bot' && isConnected;

  const handleSend = () => {
    if (canSend) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    if (!isConnected) return 'Connecting...';
    if (status === 'closed') return 'Chat ended';
    if (status === 'waiting') return 'Waiting for agent...';
    return 'Type your message...';
  };

  if (status === 'closed') {
    return (
      <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">This conversation has ended.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={!isConnected || disabled}
            className="min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            rows={1}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Send className="h-4 w-4" />
          </Button>

          {showRequestAgent && onRequestAgent && (
            <Button
              onClick={onRequestAgent}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-50 px-3"
              title="Request human agent"
            >
              <User className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {status === 'waiting' && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          You're in the queue for a human agent. Please wait...
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
