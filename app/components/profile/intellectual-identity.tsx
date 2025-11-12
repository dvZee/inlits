import React, { useState, useEffect } from 'react';
import { Target, Clock, BookOpen, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface ReadingStats {
  want_to_consume: number;
  consuming: number;
  completed: number;
  paused: number;
}

interface IntellectualIdentityProps {
  stats?: any;
  userId?: string;
  isOwnProfile?: boolean;
}

export function IntellectualIdentity({ stats, userId, isOwnProfile }: IntellectualIdentityProps) {
  const { user } = useAuth();
  const [readingStats, setReadingStats] = useState<ReadingStats>({
    want_to_consume: 0,
    consuming: 0,
    completed: 0,
    paused: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReadingStats = async () => {
      const targetUserId = userId ?? user?.id;

      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reading_status')
          .select('status')
          .eq('user_id', targetUserId);

        if (error) throw error;

        // Count items by status
        const statusCounts = (data || []).reduce((acc, item) => {
          acc[item.status as keyof ReadingStats] = (acc[item.status as keyof ReadingStats] || 0) + 1;
          return acc;
        }, {} as Partial<ReadingStats>);

        setReadingStats({
          want_to_consume: statusCounts.want_to_consume || 0,
          consuming: statusCounts.consuming || 0,
          completed: statusCounts.completed || 0,
          paused: statusCounts.paused || 0
        });
      } catch (error) {
        console.error('Error loading reading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReadingStats();
  }, [user, userId]);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">Intellectual Identity</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-3 md:p-4 text-center animate-pulse">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted mx-auto mb-2" />
              <div className="h-6 bg-muted rounded mb-1" />
              <div className="h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">Intellectual Identity</h2>
        {(isOwnProfile ?? (!userId || user?.id === userId)) && (
          <Link 
            to="/library" 
            className="text-sm text-primary hover:underline"
          >
            Update Preferences
          </Link>
        )}
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card border rounded-lg p-3 md:p-4 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <p className="text-lg md:text-xl font-bold">{readingStats.want_to_consume}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Want to Experience</p>
        </div>
        
        <div className="bg-card border rounded-lg p-3 md:p-4 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <p className="text-lg md:text-xl font-bold">{readingStats.consuming}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Currently Experiencing</p>
        </div>
        
        <div className="bg-card border rounded-lg p-3 md:p-4 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <p className="text-lg md:text-xl font-bold">{readingStats.completed}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Experienced</p>
        </div>
        
        <div className="bg-card border rounded-lg p-3 md:p-4 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Pause className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <p className="text-lg md:text-xl font-bold">{readingStats.paused}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Paused</p>
        </div>
      </div>
    </div>
  );
}
