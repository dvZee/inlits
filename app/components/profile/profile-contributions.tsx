import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { formatTimeAgo } from '@/lib/utils';

interface Contribution {
  id: string;
  type: 'comment' | 'rating';
  title: string;
  excerpt: string;
  content_type: string;
  content_id: string;
  timestamp: string;
  rating?: number;
}

interface ProfileContributionsProps {
  recentActivity?: any[];
  userId?: string;
  isOwnProfile?: boolean;
}

export function ProfileContributions({ recentActivity, userId, isOwnProfile }: ProfileContributionsProps) {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContributions = async () => {
      const targetUserId = userId ?? user?.id;
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (commentsError) throw commentsError;

        // Load user's ratings
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ratingsError) throw ratingsError;

        // Combine and format contributions
        const allContributions: Contribution[] = [
          ...(commentsData || []).map(comment => ({
            id: comment.id,
            type: 'comment' as const,
            title: `Comment on ${comment.content_type}`,
            excerpt: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
            content_type: comment.content_type,
            content_id: comment.content_id,
            timestamp: comment.created_at
          })),
          ...(ratingsData || []).map(rating => ({
            id: rating.id,
            type: 'rating' as const,
            title: `Rated ${rating.content_type}`,
            excerpt: `Gave ${rating.rating} star${rating.rating !== 1 ? 's' : ''}`,
            content_type: rating.content_type,
            content_id: rating.content_id,
            timestamp: rating.created_at,
            rating: rating.rating
          }))
        ];

        // Sort by timestamp and take the most recent
        allContributions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setContributions(allContributions.slice(0, 5));
      } catch (err) {
        console.error('Error loading contributions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contributions');
      } finally {
        setLoading(false);
      }
    };

    loadContributions();
  }, [user, userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg md:text-xl font-semibold">Contributions</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg md:text-xl font-semibold">Contributions</h2>
        <div className="flex items-center justify-center py-8 text-center">
          <div className="space-y-2">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg md:text-xl font-semibold">Contributions</h2>
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No contributions yet</h3>
          <p className="text-muted-foreground">
            Start engaging with content by leaving comments and ratings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">Contributions</h2>
        {(isOwnProfile ?? (!userId || user?.id === userId)) && (
          <div className="flex items-center gap-2">
            <button className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {contributions.map((contribution) => (
          <div
            key={contribution.id}
            className="bg-card border rounded-lg p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className="capitalize">{contribution.type}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(contribution.timestamp)}</span>
                  <span>•</span>
                  <span className="capitalize">{contribution.content_type}</span>
                </div>
                <h3 className="font-medium">{contribution.title}</h3>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground">
              {contribution.excerpt}
            </p>

            {/* Rating display for rating contributions */}
            {contribution.type === 'rating' && contribution.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < contribution.rating! ? 'text-yellow-500' : 'text-muted-foreground'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
