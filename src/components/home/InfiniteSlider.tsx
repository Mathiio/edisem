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
          // Scroll vers le bas
          container.scrollTop = scrollTop + speed;
          
          // Réinitialiser la position de façon fluide
          // Quand on atteint la fin du deuxième set, revenir au début du premier set
          if (scrollTop >= singleSetHeight * 2) {
            container.scrollTop = singleSetHeight;
          }
        } else {
          // Scroll vers le haut
          container.scrollTop = scrollTop - speed;
          
          // Réinitialiser la position de façon fluide
          // Quand on atteint le début du premier set, revenir à la fin du deuxième set
          if (scrollTop <= singleSetHeight) {
            container.scrollTop = singleSetHeight * 2;
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialiser la position au milieu (début du deuxième set)
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

  // Tripler les cards pour créer un effet de boucle fluide
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