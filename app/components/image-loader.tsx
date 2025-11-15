import React, { useState } from "react";

interface ImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  lowQualityUrl?: string;
  loadingStrategy?: "lazy" | "eager";
}

export function ImageLoader({
  src,
  alt,
  className,
  fallback,
  lowQualityUrl,
  loadingStrategy = "eager",
  ...props
}: ImageLoaderProps) {
  const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=Inlits";
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src !== PLACEHOLDER_IMAGE) {
      setHasError(true);
      target.src = PLACEHOLDER_IMAGE;
    }
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Use src directly - simpler and more reliable
  const imageSrc = src || PLACEHOLDER_IMAGE;

  return (
    <img
      src={imageSrc}
      alt={alt || ""}
      className={className}
      loading={loadingStrategy}
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
}
