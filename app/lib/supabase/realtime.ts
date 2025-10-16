import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface SubscriptionOptions {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
}

interface SubscriptionCallback<T extends Record<string, unknown> = Record<string, unknown>> {
  onData: (payload: RealtimePostgresChangesPayload<T>) => void;
  onError?: (error: Error) => void;
  onSubscribed?: () => void;
}

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private retryTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private maxRetries = 5;
  private baseRetryDelay = 1000; // 1 second

  private getChannelKey(options: SubscriptionOptions): string {
    return `${options.schema || 'public'}.${options.table}.${options.event}${options.filter || ''}`;
  }

  private getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(2, attempt),
      30000 // Max 30 seconds
    );
    return delay + Math.random() * 1000; // Add up to 1s of jitter
  }

  subscribe<T extends Record<string, unknown> = Record<string, unknown>>(
    options: SubscriptionOptions,
    callbacks: SubscriptionCallback<T>
  ): () => void {
    const channelKey = this.getChannelKey(options);
    let retryCount = 0;

    const setupChannel = () => {
      const channel = supabase.channel(`${channelKey}-${Date.now()}`);

      (channel as any).on(
        'postgres_changes',
        {
          event: options.event,
          schema: options.schema || 'public',
          table: options.table,
          filter: options.filter
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          try {
            callbacks.onData(payload);
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
        .subscribe(async (status: string) => {
          switch (status) {
            case 'SUBSCRIBED':
              console.debug(`Subscribed to ${channelKey}`);
              this.channels.set(channelKey, channel);
              callbacks.onSubscribed?.();
              retryCount = 0; // Reset retry count on successful subscription
              break;

            case 'CLOSED':
            case 'CHANNEL_ERROR':
              console.debug(`Channel ${channelKey} ${status}, attempting reconnect...`);
              if (retryCount < this.maxRetries) {
                const timeout = setTimeout(() => {
                  retryCount++;
                  channel.unsubscribe();
                  setupChannel();
                }, this.getRetryDelay(retryCount));
                this.retryTimeouts.set(channelKey, timeout);
              } else {
                callbacks.onError?.(new Error(`Failed to reconnect after ${this.maxRetries} attempts`));
              }
              break;

            case 'TIMED_OUT':
              callbacks.onError?.(new Error('Subscription timed out'));
              break;
          }
        });

      return channel;
    };

    const channel = setupChannel();
    this.channels.set(channelKey, channel);

    // Return cleanup function
    return () => {
      const timeout = this.retryTimeouts.get(channelKey);
      if (timeout) {
        clearTimeout(timeout);
        this.retryTimeouts.delete(channelKey);
      }

      const existingChannel = this.channels.get(channelKey);
      if (existingChannel) {
        existingChannel.unsubscribe();
        this.channels.delete(channelKey);
      }
    };
  }

  // Utility method to subscribe to multiple tables
  subscribeToTables<T extends Record<string, unknown> = Record<string, unknown>>(
    tables: string[],
    event: SubscriptionOptions['event'] = '*',
    callback: SubscriptionCallback<T>
  ): () => void {
    const cleanupFns = tables.map(table =>
      this.subscribe<T>(
        { table, event },
        callback
      )
    );

    return () => cleanupFns.forEach(cleanup => cleanup());
  }

  // Utility method to subscribe to a specific record
  subscribeToRecord<T extends Record<string, unknown> = Record<string, unknown>>(
    table: string,
    recordId: string,
    callback: SubscriptionCallback<T>
  ): () => void {
    return this.subscribe<T>(
      {
        table,
        event: '*',
        filter: `id=eq.${recordId}`
      },
      callback
    );
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();

    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const realtimeManager = new RealtimeManager();
