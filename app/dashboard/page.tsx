// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgentLogin } from '@/components/agent/AgentLogin';
import { QueueList } from '@/components/agent/QueueList';
import { ActiveChats } from '@/components/agent/ActiveChats';
import { Navigation } from '@/components/common/Navigation';
import { useAgentDashboard } from '@/hooks/useAgentDashboard';
import { BarChart3, Users, MessageCircle, Clock, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const {
    agentId,
    agentName,
    isLoggedIn,
    queueSessions,
    activeSessions,
    currentSessionId,
    stats,
    isConnected,
    loginAsAgent,
    pickupSession,
    sendMessage,
    closeSession,
  } = useAgentDashboard();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (name: string) => {
    setIsLoggingIn(true);
    try {
      await loginAsAgent(name);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (
      window.confirm(
        'Are you sure you want to logout? This will close all active chats.'
      )
    ) {
      window.location.reload();
    }
  };

  const selectSession = (sessionId: string) => {
    // This could be enhanced to show a detailed view or highlight the session
    console.log('Selected session:', sessionId);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <AgentLogin
          onLogin={handleLogin}
          isLoading={isLoggingIn}
          isConnected={isConnected}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agent Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {agentName}</p>
            </div>
            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className="flex items-center space-x-1"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span>{isConnected ? 'Online' : 'Offline'}</span>
            </Badge>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSessions} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Queue Length
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.queueLength}</div>
                <p className="text-xs text-muted-foreground">
                  customers waiting
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agents
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.availableAgents} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Active Chats
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeSessions.length}
                </div>
                <p className="text-xs text-muted-foreground">conversations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue */}
          <div>
            <QueueList
              sessions={queueSessions}
              onPickupSession={pickupSession}
            />
          </div>

          {/* Active Chats */}
          <div>
            <ActiveChats
              sessions={activeSessions}
              currentSessionId={currentSessionId}
              onSelectSession={selectSession}
              onSendMessage={sendMessage}
              onCloseSession={closeSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
