import React, { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './content-card';
import type { ContentItem } from '@/lib/types';

interface ContentCarouselProps {
  title: string;
  items: ContentItem[];
  activeShelf?: string | null;
  onAddToShelf?: (contentId: string, contentType: string) => void;
}

export function ContentCarousel({ title, items, activeShelf, onAddToShelf }: ContentCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const updateButtonVisibility = useCallback(() => {
    if (!rowRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current || isScrolling) return;

    setIsScrolling(true);
    const container = rowRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const scrollPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    setTimeout(() => {
      setIsScrolling(false);
      updateButtonVisibility();
    }, 500);
  };

  React.useEffect(() => {
    const container = rowRef.current;
    if (!container) return;

    updateButtonVisibility();
    container.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('resize', updateButtonVisibility);

    return () => {
      container.removeEventListener('scroll', updateButtonVisibility);
      window.removeEventListener('resize', updateButtonVisibility);
    };
  }, [updateButtonVisibility]);

  if (items.length === 0) return null;

  return (
    <div className="group relative mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>

      <div className="relative">
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            disabled={isScrolling}
          >
            <div className="p-2 bg-background/90 hover:bg-primary hover:text-primary-foreground rounded-full border shadow-lg transition-all">
              <ChevronLeft className="w-6 h-6" />
            </div>
          </button>
        )}

        <div
          ref={rowRef}
          className="flex overflow-x-auto gap-3 md:gap-4 pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(item => (
            <div key={item.id} className="flex-shrink-0 w-[150px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
              <ContentCard
                item={item}
                activeShelf={activeShelf}
                onAddToShelf={onAddToShelf}
              />
            </div>
          ))}
        </div>

        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            disabled={isScrolling}
          >
            <div className="p-2 bg-background/90 hover:bg-primary hover:text-primary-foreground rounded-full border shadow-lg transition-all">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
