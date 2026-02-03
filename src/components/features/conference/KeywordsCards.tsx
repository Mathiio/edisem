import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Skeleton } from '@heroui/react';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 10 } },
};

type KeywordsCardProps = {
  word?: string;
  description?: string;
  definition?: string;
  onSearchClick?: (searchTerm: string) => void;
};

export const KeywordsCard: React.FC<KeywordsCardProps> = ({ word, description, definition, onSearchClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const displayDescription = description || definition;

  const handleMouseEnter = () => {
    setIsHovered(true);

    updateTooltipPosition();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const updateTooltipPosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
    }
  };

  useEffect(() => {
    if (isHovered) {
      updateTooltipPosition();
      window.addEventListener('scroll', updateTooltipPosition);
      window.addEventListener('resize', updateTooltipPosition);
      return () => {
        window.removeEventListener('scroll', updateTooltipPosition);
        window.removeEventListener('resize', updateTooltipPosition);
      };
    }
  }, [isHovered]);

  const handleClick = () => {
    if (word && onSearchClick) {
      onSearchClick(word);
    }
  };

  const tooltip = isHovered && displayDescription && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: 'absolute',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex: 10000,
      }}
      className=' max-w-2xl bg-c2 border-2 border-c3 rounded-12 p-6 shadow-xl pointer-events-none flex flex-col gap-10'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <p className='text-14 text-c6 font-semibold'>Définition :</p>
      <p className='text-14 text-c5 leading-[120%]'>{displayDescription}</p>
    </motion.div>
  );

  return (
    <>
      <div ref={cardRef} className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <motion.div
          variants={itemVariants}
          className='border-2 border-c3 h-full rounded-8 flex items-center justify-start p-10 cursor-pointer hover:border-c4 hover:bg-c2 transition-all ease-in-out duration-200'
          onClick={handleClick}>
          <p className='text-14 text-c4 font-extralight'>{word}</p>
        </motion.div>
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};

export const KeywordsSkeleton: React.FC = () => {
  return <Skeleton className='w-[100%] h-4 rounded-8' />;
};
