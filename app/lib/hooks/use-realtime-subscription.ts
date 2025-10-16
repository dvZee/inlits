import { useEffect } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  enabled?: boolean;
  onData?: (payload: any) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeSubscription(options: UseRealtimeSubscriptionOptions) {
  useEffect(() => {
    if (!options.enabled) return;

    // Create channel with unique name
    const channelName = `${options.table}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    (channel as any).on(
      'postgres_changes',
      {
        event: options.event || '*',
        schema: 'public',
        table: options.table,
        filter: options.filter
      },
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        try {
          options.onData?.(payload);
        } catch (error) {
          options.onError?.(error as Error);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        options.onError?.(new Error('Failed to subscribe to changes'));
      }
    });

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    options.table,
    options.event,
    options.filter,
    options.enabled,
    options.onData,
    options.onError
  ]);
}
