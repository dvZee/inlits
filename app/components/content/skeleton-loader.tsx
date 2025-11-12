import React from 'react';

export function ContentCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[180px] animate-pulse">
      <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
        <div className="aspect-[2/3] bg-muted" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-muted" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-muted rounded w-12" />
            <div className="h-3 bg-muted rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentRowSkeleton() {
  return (
    <div className="space-y-2 mb-8">
      <div className="h-6 bg-muted rounded w-48 mb-4 animate-pulse" />
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
        {Array.from({ length: 7 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden rounded-lg mb-8 animate-pulse">
      <div className="absolute inset-0 bg-muted" />
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl space-y-4">
          <div className="h-6 bg-muted/50 rounded w-32" />
          <div className="h-16 bg-muted/50 rounded w-3/4" />
          <div className="h-4 bg-muted/50 rounded w-1/2" />
          <div className="flex items-center gap-3 pt-4">
            <div className="h-12 bg-muted/50 rounded w-32" />
            <div className="h-12 bg-muted/50 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
