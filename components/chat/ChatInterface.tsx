// components/chat/ChatInterface.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from './StatusIndicator';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useCustomerChat } from '@/hooks/useCustomerChat';
import { CustomerInfo } from '@/types/chat';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  customerInfo: CustomerInfo;
}

export function ChatInterface({ customerInfo }: ChatInterfaceProps) {
  const router = useRouter();
  const {
    sessionId,
    status,
    messages,
    agentName,
    queuePosition,
    isConnected,
    hasStarted,
    startChat,
    sendMessage,
    requestHumanAgent,
    endChat,
  } = useCustomerChat();

  useEffect(() => {
    if (!hasStarted && isConnected) {
      startChat(customerInfo);
    }
  }, [isConnected, hasStarted, startChat, customerInfo]);

  const handleBackToHome = () => {
    if (window.confirm('Are you sure you want to leave this chat?')) {
      endChat(); // This will clear sessionStorage and reset state
      router.push('/');
    }
  };

  const handleDownloadTranscript = () => {
    const transcript = messages
      .map(
        (msg) =>
          `[${new Date(
            msg.timestamp
          ).toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.content}`
      )
      .join('\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${sessionId || 'unknown'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cleanup on unmount or navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionId && status !== 'closed') {
        endChat();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && sessionId && status !== 'closed') {
        // User is leaving/minimizing - optional: don't end chat immediately
        // You might want to implement a timeout here instead
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Don't automatically end chat on component unmount
      // as it might be intentional navigation within the app
    };
  }, [sessionId, status, endChat]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">Support Chat</h1>
              <p className="text-sm text-gray-600">
                Welcome, {customerInfo.name}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadTranscript}>
                Download Transcript
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleBackToHome}
                className="text-red-600"
              >
                End Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-4xl h-[600px] flex flex-col shadow-lg overflow-hidden">
          <StatusIndicator
            status={status}
            agentName={agentName}
            queuePosition={queuePosition}
            isConnected={isConnected}
          />

          <MessageList messages={messages} className="flex-1 overflow-hidden" />

          <MessageInput
            onSendMessage={sendMessage}
            onRequestAgent={requestHumanAgent}
            status={status}
            isConnected={isConnected}
          />
        </Card>
      </div>

      {/* Session Info */}
      {sessionId && (
        <div className="bg-gray-100 px-4 py-2 text-center">
          <p className="text-xs text-gray-500">
            Session ID: {sessionId} | Status: {status}
          </p>
        </div>
      )}
    </div>
  );
}
