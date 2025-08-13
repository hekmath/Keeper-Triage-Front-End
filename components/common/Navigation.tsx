// components/common/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Customer Chat',
      icon: MessageCircle,
      description: 'Start a new support conversation',
    },
    {
      href: '/dashboard',
      label: 'Agent Dashboard',
      icon: BarChart3,
      description: 'Agent portal for handling customer requests',
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      description: 'Manage knowledge base and AI settings',
    },
  ];

  // Don't show navigation on chat pages to keep it clean
  if (pathname.startsWith('/chat')) {
    return null;
  }

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex items-center space-x-2 transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
