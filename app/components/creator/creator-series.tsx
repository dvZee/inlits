import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { BookOpen, FileText, Headphones, Mic, Filter, ArrowUpDown, AlertCircle, Eye, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { getTextLanguageClass } from '@/lib/utils';
import type { Profile } from '@/lib/types';

interface SeriesContentItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
  cover_url?: string;
  views?: number;
}

interface SeriesItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  content_count: number;
  total_views: number;
  latest_content: SeriesContentItem | null;
  content_items: SeriesContentItem[];
}

interface CreatorSeriesProps {
  profile: Profile;
}

export function CreatorSeries({ profile }: CreatorSeriesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const isOwnProfile = user?.id === profile.id;

  useEffect(() => {
    const loadSeries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all series for this creator
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('author_id', profile.id)
          .order(sortBy === 'recent' ? 'updated_at' : 'created_at', { ascending: false });

        if (seriesError) throw seriesError;

        // For each series, get the content items and stats
        const seriesWithContent = await Promise.all(
          (seriesData || []).map(async (seriesItem) => {
            // Get all content in this series from different tables
            const [articlesResult, booksResult, audiobooksResult, podcastsResult] = await Promise.all([
              supabase
                .from('articles')
                .select('id, title, created_at, cover_url, view_count')
                .eq('series_id', seriesItem.id)
                .eq('status', 'published')
                .order('created_at', { ascending: false }),
              
              supabase
                .from('books')
                .select('id, title, created_at, cover_url, view_count')
                .eq('series_id', seriesItem.id)
                .eq('status', 'published')
                .order('created_at', { ascending: false }),
              
              supabase
                .from('audiobooks')
                .select('id, title, created_at, cover_url, view_count')
                .eq('series_id', seriesItem.id)
                .eq('status', 'published')
                .order('created_at', { ascending: false }),
              
              supabase
                .from('podcast_episodes')
                .select('id, title, created_at, cover_url, view_count')
                .eq('series_id', seriesItem.id)
                .eq('status', 'published')
                .order('created_at', { ascending: false })
            ]);

            // Combine all content items
            const transformContent = (items: any[] | null | undefined, type: SeriesContentItem['type']): SeriesContentItem[] =>
              (items || []).map(item => ({
                id: item.id,
                title: item.title,
                created_at: item.created_at,
                cover_url: item.cover_url,
                type,
                views: item.view_count ?? 0
              }));

            const allContent: SeriesContentItem[] = [
              ...transformContent(articlesResult.data, 'article'),
              ...transformContent(booksResult.data, 'book'),
              ...transformContent(audiobooksResult.data, 'audiobook'),
              ...transformContent(podcastsResult.data, 'podcast')
            ];

            // Sort by creation date
            allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Calculate total views
            const totalViews = allContent.reduce((sum, item) => sum + (item.views || 0), 0);

            // Get latest content
            const latestContent = allContent.length > 0 ? allContent[0] : null;

            return {
              ...seriesItem,
              content_count: allContent.length,
              total_views: totalViews,
              latest_content: latestContent,
              content_items: allContent
            };
          })
        );

        setSeries(seriesWithContent);
      } catch (err) {
        console.error('Error loading series:', err);
        setError(err instanceof Error ? err.message : 'Failed to load series');
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [profile.id, sortBy]);

  const handleContentClick = (item: SeriesItem['content_items'][0]) => {
    switch (item.type) {
      case 'article':
        navigate(`/reader/article-${item.id}`);
        break;
      case 'book':
        navigate(`/reader/book-${item.id}`);
        break;
      case 'audiobook':
      case 'podcast':
        navigate(`/player/${item.type}-${item.id}`);
        break;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      case 'audiobook':
        return <Headphones className="w-4 h-4" />;
      case 'podcast':
        return <Mic className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatContentType = (type: string) => {
    switch (type) {
      case 'article':
        return 'Article';
      case 'book':
        return 'Book';
      case 'audiobook':
        return 'Audiobook';
      case 'podcast':
        return 'Podcast';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex gap-4">
                <div className="w-32 h-48 bg-muted rounded-lg" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h3 className="mt-4 text-lg font-medium">Failed to load series</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (series.length === 0) {
    if (isOwnProfile) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No series created yet</h3>
          <p className="text-muted-foreground mt-2">
            Create content and organize it into series to help readers follow your stories
          </p>
          <Link
            to={`/dashboard/${profile.username}/content/new/article`}
            className="inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            Create your first content
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No series published yet</h3>
        <p className="text-muted-foreground mt-2">
          {profile.name || profile.username} hasn't created any series yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Series</h1>
          <p className="text-muted-foreground">
            Organized content collections by {profile.name || profile.username}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setSortBy(sortBy === 'recent' ? 'popular' : 'recent')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-primary/50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm">{sortBy === 'recent' ? 'Most Recent' : 'Most Popular'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Series List */}
      <div className="space-y-6">
        {series.map((seriesItem) => (
          <div
            key={seriesItem.id}
            className="bg-card border rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Series Cover (using latest content cover) */}
                <div className="shrink-0">
                  <div className="w-32 h-48 rounded-lg overflow-hidden bg-muted">
                    {seriesItem.latest_content?.cover_url ? (
                      <img
                        src={seriesItem.latest_content.cover_url}
                        alt={seriesItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Series Info */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <h2 className={`text-xl font-semibold ${getTextLanguageClass(seriesItem.title)}`}>
                      {seriesItem.title}
                    </h2>
                    <p className={`text-muted-foreground mt-2 line-clamp-2 ${getTextLanguageClass(seriesItem.description)}`}>
                      {seriesItem.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{seriesItem.content_count} episodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>{seriesItem.total_views.toLocaleString()} total views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Started {new Date(seriesItem.created_at).toLocaleDateString()}</span>
                    </div>
                    {seriesItem.latest_content && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary">Latest:</span>
                        <span>{new Date(seriesItem.latest_content.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setExpandedSeries(expandedSeries === seriesItem.id ? null : seriesItem.id)}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {expandedSeries === seriesItem.id ? 'Hide Episodes' : 'View Episodes'}
                    </button>
                    {seriesItem.latest_content && (
                      <button
                        onClick={() => handleContentClick(seriesItem.latest_content!)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Read Latest Episode
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Episodes List */}
            {expandedSeries === seriesItem.id && (
              <div className="border-t bg-muted/30">
                <div className="p-6">
                  <h3 className="font-medium mb-4">Episodes in this series</h3>
                  <div className="space-y-3">
                    {seriesItem.content_items.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleContentClick(item)}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        {/* Episode Number */}
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                          {seriesItem.content_items.length - index}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {item.cover_url ? (
                            <img
                              src={item.cover_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getContentIcon(item.type)}
                            </div>
                          )}
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getContentIcon(item.type)}
                              <span className="capitalize">{formatContentType(item.type)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className={`font-medium line-clamp-1 hover:text-primary transition-colors ${getTextLanguageClass(item.title)}`}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            <span>{(item.views || 0).toLocaleString()} views</span>
                          </div>
                        </div>

                        {/* Action Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>

                  {seriesItem.content_items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No episodes in this series yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
