import React, { useEffect, useMemo, useRef } from 'react';
import { IntervenantCard } from '@/components/features/intervenants/IntervenantCards';
import { Actant } from '@/types/ui';


type IntervenantsCarouselProps = {
  intervenants: Actant[];
};


export const IntervenantsCarousel: React.FC<IntervenantsCarouselProps> = ({ intervenants }) => {
  // Refs to the scroll container and its inner content
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Randomly select 12 intervenants on component mount (memoized)
  const selectedIntervenants = useMemo(() => {
    const shuffled = [...intervenants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 12);
  }, [intervenants]);

  // Repeat intervenants 3 times to simulate infinite scrolling
  const repeatedIntervenants = useMemo(() => {
    return [...selectedIntervenants, ...selectedIntervenants, ...selectedIntervenants];
  }, [selectedIntervenants]);


  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let animationFrameId: number;
    const scrollAmount = 0.5; // Scroll speed per frame

    // Set initial scroll position to the middle of the repeated content
    const singleSetWidth = content.scrollWidth / 3;
    container.scrollLeft = singleSetWidth;

    // Scroll animation function
    const scroll = () => {
      if (!container || !content) return;

      container.scrollLeft += scrollAmount;

      // Reset scroll position when reaching the end of the second set
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft = singleSetWidth;
      }

      // Start scrolling animation
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Cleanup on unmount
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [repeatedIntervenants]);

  return (
    <div className="relative overflow-hidden w-full py-4">
      {/* Left and right fading overlays for visual effect */}
      <div className="absolute left-0 top-0 h-full w-48 z-10 pointer-events-none fade-left" />
      <div className="absolute right-0 top-0 h-full w-48 z-10 pointer-events-none fade-right" />

      {/* Scrolling container */}
      <div
        ref={containerRef}
        className="overflow-hidden no-scrollbar w-full"
      >
        {/* Inner content: repeated intervenants in horizontal flex layout */}
        <div
          ref={contentRef}
          className="flex gap-20 w-max"
        >
          {repeatedIntervenants.map((intervenant, index) => (
            <div key={`${intervenant.id}-${index}`} className="flex-shrink-0 w-[250px]">
              <IntervenantCard {...intervenant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};