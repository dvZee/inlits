import React, { useState, useEffect } from 'react';
import { Bell, X, Settings, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '@/lib/utils';

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-notifications-dropdown]')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const cleanup = subscribeToNotifications(user.id);
      return cleanup;
    }
  }, [user, fetchNotifications, subscribeToNotifications]);

  const handleNotificationClick = async (id: string, link?: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    if (link) {
      navigate(link);
    }
    setShowDropdown(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'content':
        return '📚';
      case 'follow':
        return '👥';
      case 'mention':
        return '💬';
      case 'achievement':
        return '🏆';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" data-notifications-dropdown>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 transition-colors rounded-lg hover:bg-primary/5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs font-medium text-white bg-primary rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 w-80 max-w-[90vw] mt-2 bg-popover border rounded-lg shadow-lg z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => fetchNotifications()}
                  className="block mx-auto mt-2 text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors flex items-start gap-3 ${
                    notification.read ? 'opacity-70' : ''
                  }`}
                >
                  {/* Notification Icon */}
                  <div className="text-lg mt-0.5 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {!notification.read && (
                    <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0 absolute left-1" />
                  )}
                  
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span>{formatTimeAgo(notification.created_at)}</span>
                      {notification.link && (
                        <>
                          <span>•</span>
                          <span className="text-primary">Click to view</span>
                        </>
                      )}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">You'll see updates here when you have new activity</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30">
            <Link
              to="/settings/notifications"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Notification Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}