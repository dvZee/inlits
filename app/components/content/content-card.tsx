import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Star, Play, Headphones, BookOpen, FileText } from 'lucide-react';
import { useOptimisticMutation } from '@/lib/hooks/use-optimistic-mutation';
import { supabase } from '@/lib/supabase';
import { ContentTypeIcon } from './content-type-icon';
import { ImageLoader } from '../image-loader';
import { useAuth } from '@/lib/auth';
import { getTextLanguageClass } from '@/lib/utils';
import type { ContentItem } from '@/lib/types';

const getLowQualityUrl = (url?: string, size: number = 50) => {
  if (!url || url.includes('placehold.co')) return undefined;
  return url.includes('?') ? `${url}&w=${size}` : `${url}?w=${size}`;
};

interface ContentCardProps {
  item: ContentItem & { bookmarked?: boolean };
  activeShelf?: string | null;
  onAddToShelf?: (contentId: string, contentType: string) => void;
}

export const ContentCard = memo(function ContentCard({ item, activeShelf, onAddToShelf }: ContentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = React.useState(item.bookmarked || false);
  const thumbnailLowQuality = getLowQualityUrl(item.thumbnail);
  const creatorLowQuality = getLowQualityUrl(item.creator?.avatar, 20);

  const { mutate: toggleBookmark } = useOptimisticMutation({
    mutationFn: async () => {
      if (!user) {
        navigate('/signin');
        return isBookmarked;
      }

      try {
        if (isBookmarked) {
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('content_id', item.id)
            .eq('content_type', item.type)
            .eq('user_id', user.id);

          if (error) throw error;
          return false;
        } else {
          const { error } = await supabase
            .from('bookmarks')
            .insert({
              content_id: item.id,
              content_type: item.type,
              user_id: user.id
            });

          if (error) throw error;
          return true;
        }
      } catch (error) {
        console.error('Bookmark operation failed:', error);
        throw error;
      }
    },
    optimisticUpdate: () => {
      setIsBookmarked(!isBookmarked);
    },
    rollbackUpdate: () => {
      setIsBookmarked(!isBookmarked);
    },
    invalidateQueries: ['bookmarks']
  });

  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    switch (item.type) {
      case 'article':
        navigate(`/reader/article-${item.id}`);
        break;
      case 'ebook':
        navigate(`/reader/book-${item.id}`);
        break;
      case 'audiobook':
      case 'podcast':
        navigate(`/player/${item.type}-${item.id}`);
        break;
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If we're in "add to shelf" mode, use that function instead
    if (activeShelf && onAddToShelf) {
      onAddToShelf(item.id, item.type);
      return;
    }
    
    try {
      await toggleBookmark();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Determine aspect ratio based on content type
  const getAspectRatio = () => {
    switch (item.type) {
      case 'ebook':
        return 'aspect-[2/3] min-h-[280px]'; // Book standard size with minimum height
      case 'article':
      case 'podcast':
      case 'audiobook':
        return 'aspect-[3/4] min-h-[240px]'; // Taller ratio for audiobooks
      default:
        return 'aspect-[3/4] min-h-[240px]';
    }
  };

  // Safely get creator name for display
  const getCreatorName = () => {
    return item.creator?.name || 'Unknown Creator';
  };

  // Safely get creator initial for avatar fallback
  const getCreatorInitial = () => {
    const name = getCreatorName();
    return name[0]?.toUpperCase() || 'U';
  };

  // Get content label and icon
  const getContentLabel = () => {
    switch (item.type) {
      case 'audiobook':
        return { icon: Headphones, label: 'Full Audiobook' };
      case 'ebook':
        return { icon: BookOpen, label: 'Full Book' };
      case 'podcast':
        return { icon: Headphones, label: 'Podcast' };
      case 'article':
        return { icon: FileText, label: 'Article' };
      case 'summary':
        return { icon: BookOpen, label: 'Summary' };
      default:
        return { icon: BookOpen, label: item.type };
    }
  };

  const contentLabel = getContentLabel();
  const ContentIcon = contentLabel.icon;

  return (
    <div
      onClick={handleClick}
      className="group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-2xl hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:z-10"
    >
      {/* Thumbnail with fixed aspect ratio */}
      <div className={`relative ${getAspectRatio()}`}>
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/600x800?text=Content';
          }}
        />
        
        {/* Content type badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/10">
          <ContentIcon className="w-3.5 h-3.5" />
          <span>{contentLabel.label}</span>
        </div>

        {/* Play button for audio content */}
        {(item.type === 'audiobook' || item.type === 'podcast') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Play className="w-7 h-7 text-black ml-1 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Content Details - Three Row Layout */}
      <div className="p-3 space-y-1.5">
        {/* Title - One or two lines */}
        <h3 className={`font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors content-card-title ${getTextLanguageClass(item.title)}`}>
          {item.title}
        </h3>

        {/* Creator Info */}
        {item.creator && (
          <Link
            to={`/user/${item.creator.username || item.creator.id}`}
            className="flex items-center gap-2 hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
              <img
                src={item.creator.avatar}
                alt={getCreatorName()}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-primary text-xs font-medium">${getCreatorInitial()}</span>`;
                  }
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {getCreatorName()}
            </span>
          </Link>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.duration}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span>{item.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>
      </div>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkClick}
        className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110"
      >
        <Bookmark className={`w-4 h-4 ${isBookmarked || (activeShelf && item.bookmarked) ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
});
