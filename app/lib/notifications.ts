import { supabase } from './supabase';
import { create } from 'zustand';
import { withRetry } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'content' | 'follow' | 'mention' | 'achievement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotifications = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false, error: 'User not authenticated' });
        return;
      }

      const { data, error } = await withRetry<{ data: Notification[] | null; error: unknown }>(
        async () => {
          const result = await supabase.rpc('get_user_notifications', {
            p_user_id: user.id,
            p_limit: 50,
            p_offset: 0
          });
          return {
            data: (result.data as Notification[] | null) ?? null,
            error: result.error
          };
        }
      );

      if (error) throw error;

      const notifications = data ?? [];
      const unreadCount = notifications.filter(n => !n.read).length;

      set({ 
        notifications, 
        unreadCount,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ 
        error: 'Failed to load notifications', 
        loading: false 
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await withRetry<{ error: unknown }>(async () => {
        const result = await supabase.rpc('mark_notifications_read', {
          p_user_id: user.id,
          p_notification_ids: [id]
        });
        return { error: result.error };
      });
      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await withRetry<{ error: unknown }>(async () => {
        const result = await supabase.rpc('mark_notifications_read', {
          p_user_id: user.id,
          p_notification_ids: null
        });
        return { error: result.error };
      });
      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  subscribeToNotifications: (userId: string) => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const { fetchNotifications } = get();
          await fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  unsubscribeFromNotifications: () => {
    supabase.removeAllChannels();
  }
}));

// Helper function to create notifications
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  link?: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_link: link
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Helper function to get unread count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      p_user_id: userId
    });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
