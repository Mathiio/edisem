import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type InfiniteCarouselProps<T> = {
  items: T[];
  loading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  skeletonCount?: number;
  itemWidth?: number;
  gap?: number;
  speed?: number;
  hoverSpeed?: number;
  fadeColor?: string;
  fadeWidth?: string;
  emptyMessage?: string;
  className?: string;
  ariaLabel?: string;
};

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2
} as const;

export function InfiniteCarousel<T>({
  items,
  loading = false,
  renderItem,
  renderSkeleton,
  skeletonCount = 12,
  itemWidth,
  gap = 20,
  speed = 50,
  hoverSpeed = 0,
  fadeColor = 'var(--c1)',
  fadeWidth = 'clamp(24px, 8%, 120px)',
  emptyMessage = 'Aucun élément trouvé',
  className = '',
  ariaLabel = 'Carrousel infini'
}: InfiniteCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);
  
  const [seqWidth, setSeqWidth] = useState<number>(0);
  const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  // Update dimensions and calculate copy count
  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceWidth = seqRef.current?.scrollWidth ?? 0;
    
    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  // Resize observer
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => updateDimensions();
      window.addEventListener('resize', handleResize);
      updateDimensions();
      return () => window.removeEventListener('resize', handleResize);
    }

    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    if (seqRef.current) observer.observe(seqRef.current);
    
    updateDimensions();
    
    return () => observer.disconnect();
  }, [updateDimensions, items]);

  // Image loader
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    
    if (images.length === 0) {
      updateDimensions();
      return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) {
        updateDimensions();
      }
    };

    images.forEach(img => {
      const htmlImg = img as HTMLImageElement;
      if (htmlImg.complete) {
        handleImageLoad();
      } else {
        htmlImg.addEventListener('load', handleImageLoad, { once: true });
        htmlImg.addEventListener('error', handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
  }, [updateDimensions, items]);

  // Animation loop
  useEffect(() => {
    if (loading || items.length === 0) return;

    const track = trackRef.current;
    if (!track) return;

    const prefersReduced = 
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return () => {
        lastTimestampRef.current = null;
      };
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = isHovered ? hoverSpeed : speed;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [seqWidth, isHovered, loading, items, speed, hoverSpeed]);

  // Gradient style
  const gradientStyle = useMemo(() => ({
    '--fade-color': fadeColor,
    '--fade-width': fadeWidth,
  } as React.CSSProperties), [fadeColor, fadeWidth]);

  // Render skeleton
  if (loading) {
    return (
      <div className={`relative overflow-hidden w-full py-4 ${className}`} style={gradientStyle}>
        <div 
          aria-hidden
          className="absolute left-0 top-0 h-full z-10 pointer-events-none"
          style={{ 
            width: 'var(--fade-width)',
            background: 'linear-gradient(to right, var(--fade-color), transparent)'
          }} 
        />
        <div 
          aria-hidden
          className="absolute right-0 top-0 h-full z-10 pointer-events-none"
          style={{ 
            width: 'var(--fade-width)',
            background: 'linear-gradient(to left, var(--fade-color), transparent)'
          }} 
        />
        
        <div className="overflow-hidden w-full">
          <div className="flex w-max" style={{ gap: `${gap}px` }}>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="flex-shrink-0"
                style={itemWidth ? { width: `${itemWidth}px` } : undefined}
              >
                {renderSkeleton ? renderSkeleton() : <div className="w-full h-full bg-c3 rounded-lg" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-40">
        <p className="text-c5 text-16">{emptyMessage}</p>
      </div>
    );
  }

  // Render carousel
  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden w-full py-4 ${className}`}
      style={gradientStyle}
      role="region"
      aria-label={ariaLabel}
    >
      <div 
        aria-hidden
        className="absolute left-0 top-0 h-full z-10 pointer-events-none"
        style={{ 
          width: 'var(--fade-width)',
          background: 'linear-gradient(to right, var(--fade-color), transparent)'
        }} 
      />
      <div 
        aria-hidden
        className="absolute right-0 top-0 h-full z-10 pointer-events-none"
        style={{ 
          width: 'var(--fade-width)',
          background: 'linear-gradient(to left, var(--fade-color), transparent)'
        }} 
      />

      <div
        ref={trackRef}
        className="flex w-max will-change-transform select-none relative z-0"
        style={{ gap: `${gap}px`, transform: 'translate3d(0, 0, 0)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Array.from({ length: copyCount }, (_, copyIndex) => (
          <div
            key={`copy-${copyIndex}`}
            ref={copyIndex === 0 ? seqRef : undefined}
            className="flex"
            style={{ gap: `${gap}px` }}
            aria-hidden={copyIndex > 0}
          >
            {items.map((item, itemIndex) => (
              <div 
                key={`${copyIndex}-${itemIndex}`} 
                className="flex-shrink-0"
                style={itemWidth ? { width: `${itemWidth}px` } : undefined}
              >
                {renderItem(item, itemIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}