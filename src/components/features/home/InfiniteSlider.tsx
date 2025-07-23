import React, { useEffect, useRef, ReactNode } from 'react';

interface InfiniteSliderProps {
  cards: ReactNode[];
  direction?: 'up' | 'down';
  speed?: number;
  className?: string;
  cardHeight?: number;
  cardGap?: number;
}

export const InfiniteSlider: React.FC<InfiniteSliderProps> = ({
  cards,
  direction = 'down',
  speed = 0.2,
  className = '',
  cardHeight = 280,
  cardGap = 20,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (cards.length === 0) return;

    const animate = () => {
      if (sliderRef.current) {
        const container = sliderRef.current;
        const scrollTop = container.scrollTop;
        const singleSetHeight = cards.length * (cardHeight + cardGap);

        if (direction === 'down') {
          container.scrollTop = scrollTop + speed;
          
          if (scrollTop >= singleSetHeight * 2) {
            container.scrollTop = singleSetHeight;
          }
        } else {
          container.scrollTop = scrollTop - speed;
          
          if (scrollTop <= singleSetHeight) {
            container.scrollTop = singleSetHeight * 2;
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    if (sliderRef.current) {
      sliderRef.current.scrollTop = cards.length * cardHeight;
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cards, direction, speed, cardHeight]);

  const displayedCards = [...cards, ...cards, ...cards];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div 
        ref={sliderRef}
        className="h-full overflow-hidden"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
        }}
      >
        <div 
          style={{ display: 'flex', flexDirection: 'column', gap: `${cardGap}px` }}
        >
          {displayedCards.map((card, index) => (
            <div key={index} style={{ height: cardHeight }}>
              {card}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};