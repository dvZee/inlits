import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageLoader } from '../image-loader';
import { getTextLanguageClass } from '@/lib/utils';
import type { ContentItem } from '@/lib/types';

interface HeroBannerProps {
  items: ContentItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const featuredItems = items.filter(item => item.featured).slice(0, 5);
  const currentItem = featuredItems[currentIndex];

  useEffect(() => {
    if (featuredItems.length === 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, 7000);

    return () => clearInterval(interval);
  }, [currentIndex, featuredItems.length]);

  if (featuredItems.length === 0) {
    return null;
  }

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePlay = () => {
    switch (currentItem.type) {
      case 'article':
        navigate(`/reader/article-${currentItem.id}`);
        break;
      case 'ebook':
        navigate(`/reader/book-${currentItem.id}`);
        break;
      case 'audiobook':
      case 'podcast':
        navigate(`/player/${currentItem.type}-${currentItem.id}`);
        break;
    }
  };

  const handleMoreInfo = () => {
    switch (currentItem.type) {
      case 'article':
        navigate(`/reader/article-${currentItem.id}`);
        break;
      case 'ebook':
        navigate(`/reader/book-${currentItem.id}`);
        break;
      case 'audiobook':
      case 'podcast':
        navigate(`/player/${currentItem.type}-${currentItem.id}`);
        break;
    }
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[400px] md:min-h-[500px] max-h-[600px] md:max-h-[700px] overflow-hidden rounded-lg mb-8">
      <div className="absolute inset-0">
        <ImageLoader
          src={currentItem.thumbnail}
          alt={currentItem.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-primary/90 text-white rounded-full font-medium">
              Featured
            </span>
            {currentItem.category && (
              <span className="text-white/80">{currentItem.category}</span>
            )}
          </div>

          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight ${getTextLanguageClass(currentItem.title)}`}>
            {currentItem.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-white/80">
            {currentItem.rating && currentItem.rating > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>{currentItem.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
              </>
            )}
            {currentItem.duration && <span>{currentItem.duration}</span>}
            {currentItem.views > 0 && (
              <>
                <span>•</span>
                <span>{currentItem.views.toLocaleString()} views</span>
              </>
            )}
          </div>

          {currentItem.creator && (
            <Link
              to={`/user/${currentItem.creator.username || currentItem.creator.id}`}
              className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                <ImageLoader
                  src={currentItem.creator.avatar}
                  alt={currentItem.creator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-medium">{currentItem.creator.name}</span>
            </Link>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-md font-semibold hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{currentItem.type === 'article' || currentItem.type === 'ebook' ? 'Read' : 'Play'}</span>
            </button>
            <button
              onClick={handleMoreInfo}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-md font-semibold hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {featuredItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-4 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
