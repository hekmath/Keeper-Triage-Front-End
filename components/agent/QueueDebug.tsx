// components/agent/QueueDebug.tsx
// Optional component for debugging queue issues

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, RefreshCw } from 'lucide-react';

interface QueueDebugProps {
  socket: any;
}

export function QueueDebug({ socket }: QueueDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchDebugInfo = () => {
    if (!socket) return;

    socket.emit('admin:debug_queue');

    socket.once('queue:debug_info', (data: any) => {
      setDebugInfo(data);
    });
  };

  const clearQueue = () => {
    if (
      !socket ||
      !window.confirm('Clear entire queue? This is for debugging only!')
    )
      return;

    socket.emit('admin:clear_queue');
    fetchDebugInfo();
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Bug className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Bug className="h-4 w-4" />
            <span>Queue Debug</span>
          </CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={fetchDebugInfo}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {debugInfo ? (
          <>
            <div className="flex justify-between">
              <span>Queue Length:</span>
              <Badge variant="secondary">{debugInfo.queueLength}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Sessions:</span>
              <span>{debugInfo.totalSessions}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Sessions:</span>
              <span>{debugInfo.activeSessions}</span>
            </div>

            {debugInfo.queueItems && debugInfo.queueItems.length > 0 && (
              <div className="mt-3">
                <div className="font-medium mb-1">Queue Items:</div>
                {debugInfo.queueItems.map((item: any, index: number) => (
                  <div
                    key={item.sessionId}
                    className="p-1 bg-gray-100 rounded text-xs"
                  >
                    <div>
                      #{index + 1}: {item.sessionId.slice(-6)}
                    </div>
                    <div className="flex justify-between">
                      <span>Status: {item.status}</span>
                      <span>Wait: {item.waitTime}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={clearQueue}
              className="w-full mt-2"
            >
              Clear Queue (Debug)
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <Button variant="outline" size="sm" onClick={fetchDebugInfo}>
              Load Debug Info
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
