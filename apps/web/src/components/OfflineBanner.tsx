'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs sm:text-sm font-medium py-2 px-4 flex items-center justify-center gap-2 transition-all">
        <Wifi className="w-4 h-4" />
        <span>Internet connection restored. Local drafts are synchronized.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs sm:text-sm font-medium py-2 px-4 flex items-center justify-center gap-2 transition-all">
      <WifiOff className="w-4 h-4" />
      <span>
        You are currently offline. Edits are saved locally to IndexedDB. AI optimization and parsing are paused until reconnected.
      </span>
    </div>
  );
}
