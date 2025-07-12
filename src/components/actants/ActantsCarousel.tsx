import React, { useEffect, useMemo, useRef } from 'react';
import { ActantCard } from '@/components/actants/ActantCards';


type Actant = {
  id: number;
  firstname: string;
  lastname: string;
  picture: string;
  interventions: number;
  universities: { shortName: string; logo: string }[];
};

type ActantCarouselProps = {
  actants: Actant[];
};


export const ActantCarousel: React.FC<ActantCarouselProps> = ({ actants }) => {
  // Refs to the scroll container and its inner content
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Randomly select 12 actants on component mount (memoized)
  const selectedActants = useMemo(() => {
    const shuffled = [...actants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 12);
  }, [actants]);

  // Repeat actants 3 times to simulate infinite scrolling
  const repeatedActants = useMemo(() => {
    return [...selectedActants, ...selectedActants, ...selectedActants];
  }, [selectedActants]);


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
  }, [repeatedActants]);

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
        {/* Inner content: repeated actants in horizontal flex layout */}
        <div
          ref={contentRef}
          className="flex gap-20 w-max"
        >
          {repeatedActants.map((actant, index) => (
            <div key={`${actant.id}-${index}`} className="flex-shrink-0 w-[250px]">
              <ActantCard {...actant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};