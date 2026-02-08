'use client';

import { FC, useState, useEffect } from 'react';

type NotificationType = 'achievement' | 'streak' | 'karma' | 'nft' | 'social' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: { label: string; href: string };
}

interface NotificationCenterProps {
  className?: string;
}

const typeConfig: Record<NotificationType, { icon: string; color: string }> = {
  achievement: { icon: '🏆', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30' },
  streak: { icon: '🔥', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  karma: { icon: '⭐', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' },
  nft: { icon: '💎', color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30' },
  social: { icon: '💬', color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30' },
  system: { icon: '🔔', color: 'from-gray-500/20 to-gray-600/20 border-gray-500/30' },
};

export const NotificationCenter: FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notifications from localStorage
    try {
      const stored = localStorage.getItem('cyberfaith_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('cyberfaith_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('cyberfaith_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('cyberfaith_notifications');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-foreground">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-3xl mb-2 block">🔕</span>
                  <p className="text-muted-foreground text-sm">No notifications</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map(notification => {
                    const config = typeConfig[notification.type];
                    return (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-all
                          bg-gradient-to-r ${config.color} border
                          ${notification.read ? 'opacity-60' : 'opacity-100'}
                          hover:opacity-100
                        `}
                      >
                        <div className="flex gap-3">
                          <span className="text-xl">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm text-foreground">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        {notification.action && (
                          <a
                            href={notification.action.href}
                            className="mt-2 inline-block text-xs text-primary hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            {notification.action.label} →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
