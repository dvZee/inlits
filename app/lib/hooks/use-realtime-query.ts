import { useState, useEffect, useCallback } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { realtimeManager } from '../supabase/realtime';

interface UseRealtimeQueryOptions<T> {
  table: string;
  select?: string;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}

export function useRealtimeQuery<T extends { id: string }>(
  options: UseRealtimeQueryOptions<T>
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T[]>([]);

  const {
    table,
    select,
    filter,
    orderBy,
    limit,
    enabled = true
  } = options;

  const filterKey = JSON.stringify(filter ?? {});
  const orderKey = JSON.stringify(orderBy ?? {});

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      let query = supabase
        .from(table)
        .select(select || '*');

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending
        });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const result = await query;
      const { data: initialData, error: queryError } = result as unknown as {
        data: T[] | null;
        error: Error | null;
      };

      if (queryError) throw queryError;
      setData(initialData ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [enabled, table, select, filterKey, orderKey, limit]);

  useEffect(() => {
    if (!enabled) return;

    fetchData();

    // Subscribe to real-time updates
    const cleanup = realtimeManager.subscribe(
      {
        table,
        event: '*'
      },
      {
        onData: (payload: RealtimePostgresChangesPayload<T>) => {
          setData((current: T[]) => {
            const newData = [...current];
            const nextRecord = (payload.new as T | null) ?? null;
            const previousRecord = (payload.old as T | null) ?? null;
            const recordId = (nextRecord ?? previousRecord)?.id;

            if (!recordId) {
              return newData;
            }

            const index = newData.findIndex(item => item.id === recordId);

            switch (payload.eventType) {
              case 'INSERT':
                if (index === -1 && nextRecord) {
                  return [...newData, nextRecord];
                }
                break;
              case 'UPDATE':
                if (index !== -1 && nextRecord) {
                  newData[index] = { ...newData[index], ...nextRecord };
                  return [...newData];
                }
                break;
              case 'DELETE':
                if (index !== -1) {
                  return newData.filter(item => item.id !== recordId);
                }
                break;
            }

            return newData;
          });
        },
        onError: (err) => {
          console.error('Subscription error:', err);
          setError(err);
        }
      }
    );

    return cleanup;
  }, [enabled, fetchData, table, filterKey, orderKey, limit]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
