import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTextLanguageClass } from '@/lib/utils';
import { IntellectualIdentity } from '@/components/profile/intellectual-identity';
import { ProfileContributions } from '@/components/profile/profile-contributions';
import { ProfileCircles } from '@/components/profile/profile-circles';
import { ProfileAchievements } from '@/components/profile/profile-achievements';
import type { Profile } from '@/lib/types';

interface CreatorHomeProps {
  profile: Profile;
  stats?: CreatorData['stats'];
  recentContent: {
    articles: Array<{
      id: string;
      title: string;
      excerpt: string;
      cover_url: string;
      created_at: string;
      views: number;
      rating?: number;
      series_id?: string;
    }>;
    books: Array<{
      id: string;
      title: string;
      description: string;
      cover_url: string;
      price: number;
      created_at: string;
      views: number;
      rating?: number;
      series_id?: string;
    }>;
    audiobooks: Array<{
      id: string;
      title: string;
      description: string;
      cover_url: string;
      price: number;
      narrator: string;
      created_at: string;
      views: number;
      rating?: number;
      series_id?: string;
    }>;
    podcasts: Array<{
      id: string;
      title: string;
      description: string;
      cover_url: string;
      duration: string;
      created_at: string;
      views: number;
      rating?: number;
      series_id?: string;
    }>;
  };
  isOwnProfile: boolean;
}

type CreatorData = {
  stats: {
    total_content: number;
    total_articles: number;
    total_books: number;
    total_audiobooks: number;
    total_podcasts: number;
    total_views: number;
    avg_rating: number;
    total_followers: number;
    total_comments?: number;
  };
};

export function CreatorHome({ profile, stats, recentContent, isOwnProfile }: CreatorHomeProps) {
  const navigate = useNavigate();
  const recentRowRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Get recent content (max 8 items)
  const recentItems = [
    ...recentContent.articles.map(item => ({ 
      ...item, 
      type: 'article' as const,
      description: item.excerpt 
    })),
    ...recentContent.books.map(item => ({ 
      ...item, 
      type: 'book' as const 
    })),
    ...recentContent.audiobooks.map(item => ({ 
      ...item, 
      type: 'audiobook' as const 
    })),
    ...recentContent.podcasts.map(item => ({ 
      ...item, 
      type: 'podcast' as const 
    }))
  ]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 8);

  // Check if creator has any series by looking for content with series_id
  const hasSeries = recentItems.some(item => item.series_id);

  // Get unique series IDs from content
  const seriesIds = new Set(recentItems.filter(item => item.series_id).map(item => item.series_id));

  const handleContentClick = (type: string, id: string) => {
    switch (type) {
      case 'article':
        navigate(`/reader/article-${id}`);
        break;
      case 'book':
        navigate(`/reader/book-${id}`);
        break;
      case 'audiobook':
      case 'podcast':
        navigate(`/player/${type}-${id}`);
        break;
    }
  };

  const achievementsStats = {
    completed_content: stats?.total_content ?? 0,
    totalComments: stats?.total_comments ?? 0,
    bookClubsJoined: stats?.total_followers ?? 0
  };

  const placeholderForType = (type: string, id: string) =>
    `https://placehold.co/400x600?text=${encodeURIComponent(type.toUpperCase())}`;

  const updateScrollButtons = (container: HTMLDivElement | null) => {
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scrollRow = (direction: 'left' | 'right') => {
    const container = recentRowRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const target = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: target, behavior: 'smooth' });
  };

  const handleRowScroll = (ref: React.RefObject<HTMLDivElement>) => {
    updateScrollButtons(ref.current);
  };

  React.useEffect(() => {
    updateScrollButtons(recentRowRef.current);

    const handleResize = () => updateScrollButtons(recentRowRef.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recently Posted</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollRow('left')}
              className="p-2 rounded-full border hover:bg-accent transition-colors disabled:opacity-50"
              aria-label="Scroll left"
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollRow('right')}
              className="p-2 rounded-full border hover:bg-accent transition-colors disabled:opacity-50"
              aria-label="Scroll right"
              disabled={!canScrollRight}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          ref={recentRowRef}
          onScroll={() => handleRowScroll(recentRowRef)}
        >
          {recentItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleContentClick(item.type, item.id)}
              className="group space-y-3 cursor-pointer flex-shrink-0 w-44"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.cover_url || placeholderForType(item.type, item.id)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/90 text-xs">
                  <span className="capitalize">{item.type}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className={`text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors ${getTextLanguageClass(item.title)}`}
                >
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span>{item.rating != null ? item.rating.toFixed(1) : '-'}</span>
                  </div>
                  <span>{item.views != null ? item.views.toLocaleString() : '-'} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <IntellectualIdentity userId={profile.id} isOwnProfile={isOwnProfile} />
          <ProfileContributions userId={profile.id} isOwnProfile={isOwnProfile} />
        </div>
        <div className="space-y-8">
          <ProfileCircles />
          <ProfileAchievements stats={achievementsStats} />
        </div>
      </div>

      {/* Series Section */}
      {hasSeries && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Series ({seriesIds.size})</h2>
            <Link 
              to={`/dashboard/${profile.username}/content?tab=series`} 
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all series
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from(seriesIds).map((seriesId, index) => {
              // Get all content from this series
              const seriesContent = recentItems.filter(item => item.series_id === seriesId);
              const firstItem = seriesContent[0];
              
              return (
                <div key={seriesId} className="group space-y-4">
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={firstItem?.cover_url || placeholderForType('series', String(seriesId))}
                      alt="Series Cover"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="font-medium text-sm">Series {index + 1}</h3>
                        <p className="text-xs text-white/80">{seriesContent.length} items</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
