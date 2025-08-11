// components/agent/AgentLogin.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Shield, MessageCircle } from 'lucide-react';

const agentLoginSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
});

interface AgentLoginProps {
  onLogin: (name: string) => void;
  isLoading?: boolean;
  isConnected: boolean;
}

export function AgentLogin({
  onLogin,
  isLoading = false,
  isConnected,
}: AgentLoginProps) {
  const form = useForm<{ name: string }>({
    resolver: zodResolver(agentLoginSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = (data: { name: string }) => {
    onLogin(data.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Agent Dashboard
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your name to start handling customer support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Connection Status */}
          <div className="mb-6 flex items-center justify-center">
            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className="flex items-center space-x-1"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </Badge>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Agent Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          className="pl-10"
                          disabled={isLoading || !isConnected}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Start Agent Session
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>Handle customer support chats</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>Pick up customers from the queue</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure agent authentication</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By logging in, you agree to handle customer requests
              professionally and follow company support guidelines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
