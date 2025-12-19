import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component that serves WebP with fallback support.
 * For imported assets (from src/assets), Vite automatically handles optimization.
 * For public folder images, it provides WebP source with original fallback.
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [hasError, setHasError] = useState(false);

  // Check if it's an imported asset (already optimized by Vite) or external URL
  const isImportedAsset = src.startsWith('data:') || src.includes('/@fs/') || src.startsWith('/assets/');
  const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');
  
  // For public folder images, try to serve WebP version
  const getWebPSrc = (originalSrc: string): string | null => {
    if (isImportedAsset || isExternalUrl || hasError) return null;
    
    // Replace extension with .webp for public folder images
    const extensionMatch = originalSrc.match(/\.(jpg|jpeg|png)$/i);
    if (extensionMatch) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return null;
  };

  const webpSrc = getWebPSrc(src);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imgProps = {
    alt,
    className,
    width,
    height,
    loading,
    onLoad,
    onError: handleError,
  };

  // If WebP source is available, use picture element with fallback
  if (webpSrc && !hasError) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img src={src} {...imgProps} />
      </picture>
    );
  }

  // For imported assets, external URLs, or when WebP fails, use regular img
  return <img src={src} {...imgProps} />;
};

export default OptimizedImage;
