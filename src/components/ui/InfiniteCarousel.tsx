import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type InfiniteCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  renderSkeleton?: () => React.ReactNode;
  gap?: number;
  itemWidth?: number;
  speed?: number;
  hoverSpeed?: number;
  pauseOnHover?: boolean;
  fade?: boolean;
  className?: string;
  ariaLabel?: string;
};

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

/* ---------------- hooks ---------------- */

function useResizeObserver(
  callback: () => void,
  refs: React.RefObject<HTMLElement>[],
  deps: unknown[]
) {
  useEffect(() => {
    if (!window.ResizeObserver) {
      window.addEventListener('resize', callback);
      callback();
      return () => window.removeEventListener('resize', callback);
    }

    const observers = refs.map(ref => {
      if (!ref.current) return null;
      const obs = new ResizeObserver(callback);
      obs.observe(ref.current);
      return obs;
    });

    callback();
    return () => observers.forEach(o => o?.disconnect());
  }, deps);
}

function useImageLoader(
  seqRef: React.RefObject<HTMLElement>,
  onLoad: () => void,
  deps: unknown[]
) {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) {
      onLoad();
      return;
    }

    let remaining = images.length;
    const done = () => {
      remaining--;
      if (remaining === 0) onLoad();
    };

    images.forEach(img => {
      const i = img as HTMLImageElement;
      if (i.complete) done();
      else {
        i.addEventListener('load', done, { once: true });
        i.addEventListener('error', done, { once: true });
      }
    });

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
      });
    };
  }, deps);
}

/* ---------------- component ---------------- */

export function InfiniteCarousel<T>({
  items,
  renderItem,
  loading = false,
  skeletonCount = 8,
  renderSkeleton,
  gap = 24,
  itemWidth,
  speed = 80,
  hoverSpeed,
  pauseOnHover = true,
  fade = true,
  className = '',
  ariaLabel = 'Carrousel infini',
}: InfiniteCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover) return 0;
    return undefined;
  }, [hoverSpeed, pauseOnHover]);

  const updateDimensions = useCallback(() => {
    const containerW = containerRef.current?.clientWidth ?? 0;
    const seqW = seqRef.current?.scrollWidth ?? 0;

    if (seqW > 0) {
      setSeqWidth(seqW);
      const needed =
        Math.ceil(containerW / seqW) + ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, needed));
    }
  }, []);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [
    items,
    gap,
    itemWidth,
  ]);

  useImageLoader(seqRef, updateDimensions, [items]);

  /* ---------------- animation ---------------- */

  useEffect(() => {
    const track = trackRef.current;
    if (!track || seqWidth === 0) return;

    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      track.style.transform = 'translate3d(0,0,0)';
      return;
    }

    const animate = (t: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      const target =
        isHovered && effectiveHoverSpeed !== undefined
          ? effectiveHoverSpeed
          : speed;

      const easing =
        1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easing;

      offsetRef.current =
        ((offsetRef.current + velocityRef.current * dt) % seqWidth + seqWidth) % seqWidth;

      track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [seqWidth, speed, isHovered, effectiveHoverSpeed]);

  /* ---------------- render ---------------- */

  if (loading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-lg bg-c3"
            style={{ width: itemWidth ?? 160, height: 80 }}
          >
            {renderSkeleton?.()}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className}`}
    >
      {fade && (
        <>
            <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-80 bg-gradient-to-r from-c1 to-transparent" />
            <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-80 bg-gradient-to-l from-c1 to-transparent" />
        </>
      )}

      <div
        ref={trackRef}
        className="flex w-max select-none will-change-transform"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Array.from({ length: copyCount }).map((_, copyIdx) => (
          <div
            key={copyIdx}
            ref={copyIdx === 0 ? seqRef : undefined}
            className="flex"
            style={{ gap, paddingRight: gap }}
            aria-hidden={copyIdx > 0}
          >
            {items.map((item, i) => (
              <div
                key={`${copyIdx}-${i}`}
                className="shrink-0"
                style={itemWidth ? { width: itemWidth } : undefined}
              >
                {renderItem(item, i)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
