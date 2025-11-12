import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLazyImage } from '@/lib/lazy-loading';

interface ImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  lowQualityUrl?: string;
  loadingStrategy?: 'lazy' | 'eager';
}

export function ImageLoader({
  src,
  alt,
  className,
  fallback,
  lowQualityUrl,
  loadingStrategy = 'eager',
  ...props
}: ImageLoaderProps) {
  const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=Inlits';
  const isBrowser = typeof window !== 'undefined';
  const supportsIntersectionObserver =
    isBrowser && typeof window.IntersectionObserver !== 'undefined';
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentSrc, isLoaded, error } = useLazyImage(src || '', lowQualityUrl);
  const [shouldLoad, setShouldLoad] = useState(true);
  const [hardError, setHardError] = useState(false);

  useEffect(() => {
    if (loadingStrategy === 'lazy') {
      if (!supportsIntersectionObserver) {
        setShouldLoad(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const element = containerRef.current;
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [loadingStrategy, supportsIntersectionObserver]);

  if ((error || hardError) && fallback) {
    return <>{fallback}</>;
  }

  const displayedSrc = (() => {
    if (hardError) return PLACEHOLDER_IMAGE;
    if (!shouldLoad) {
      return lowQualityUrl || PLACEHOLDER_IMAGE;
    }
    return currentSrc || src || PLACEHOLDER_IMAGE;
  })();

  return (
    <div ref={containerRef} className="relative">
      <img
        src={displayedSrc}
        alt={alt}
        className={`${className} ${shouldLoad && !isLoaded ? 'blur-sm' : 'blur-0'} transition-all duration-200`}
        loading={loadingStrategy}
        decoding="async"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => {
          setHardError(true);
        }}
        {...props}
      />
      {shouldLoad && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        </div>
      )}
    </div>
  );
}
