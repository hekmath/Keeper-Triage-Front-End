// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/customer/CustomerForm';
import { Navigation } from '@/components/common/Navigation';
import { CustomerInfo } from '@/types/chat';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Clear any existing session data when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('customerInfo');
    }
  }, []);

  const handleStartChat = async (customerInfo: CustomerInfo) => {
    setIsLoading(true);

    try {
      // Clear any existing session data before storing new info
      sessionStorage.removeItem('customerInfo');

      // Store customer info in sessionStorage for the chat page
      sessionStorage.setItem('customerInfo', JSON.stringify(customerInfo));

      // Navigate to chat page
      router.push('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <CustomerForm onSubmit={handleStartChat} isLoading={isLoading} />
    </>
  );
}
