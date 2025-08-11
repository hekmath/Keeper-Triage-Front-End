// app/chat/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { CustomerInfo } from '@/types/chat';
import { socketManager } from '@/lib/socket';

export default function ChatPage() {
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset socket connection for new chat session
    socketManager.resetConnection();

    // Get customer info from sessionStorage
    const storedInfo = sessionStorage.getItem('customerInfo');

    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        setCustomerInfo(parsedInfo);
      } catch (error) {
        console.error('Error parsing customer info:', error);
        // Clear corrupted data and redirect
        sessionStorage.removeItem('customerInfo');
        router.push('/');
        return;
      }
    } else {
      // No customer info found, redirect to home
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: disconnect socket when leaving chat page
      // socketManager.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!customerInfo) {
    return null; // Will redirect
  }

  return <ChatInterface customerInfo={customerInfo} />;
}
