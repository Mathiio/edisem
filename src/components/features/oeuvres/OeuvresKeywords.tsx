import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, Variants } from 'framer-motion';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

const keywordFadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.4 + index * 0.05,
      ease: 'easeOut',
    },
  }),
};

interface KeywordItemProps {
  keyword: string;
  description?: string;
  isTopKeyword: boolean;
  index: number;
  hoveredKeyword: string | null;
  hoveredKeywordHasDescription: boolean;
  onHoverChange: (keyword: string | null) => void;
}

const KeywordItem: React.FC<KeywordItemProps> = ({ keyword, description, isTopKeyword, index, hoveredKeyword, hoveredKeywordHasDescription, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const keywordRef = useRef<HTMLDivElement>(null);
  const isCurrentlyHovered = hoveredKeyword === keyword;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange(keyword);
    updateTooltipPosition();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange(null);
  };

  const updateTooltipPosition = () => {
    if (keywordRef.current) {
      const rect = keywordRef.current.getBoundingClientRect();
      const tooltipWidth = 350; // Largeur approximative du tooltip (réduite)
      const tooltipHeight = 250; // Hauteur approximative du tooltip (augmentée)
      const padding = 20; // Marge par rapport au bord de l'écran (augmentée)

      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + 5;

      // Ajustement horizontal
      const viewportWidth = window.innerWidth;
      if (left + tooltipWidth > viewportWidth - padding) {
        // Si ça dépasse à droite, on positionne à gauche du mot-clé
        left = rect.left + window.scrollX - tooltipWidth;
      }

      // Ajustement vertical
      const viewportHeight = window.innerHeight;
      if (top + tooltipHeight > viewportHeight + window.scrollY - padding) {
        // Si ça dépasse en bas, on positionne au-dessus du mot-clé
        top = rect.top + window.scrollY - tooltipHeight - 5;
      }

      // Assurer qu'on reste dans les limites de l'écran
      left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));
      top = Math.max(padding + window.scrollY, top);

      setTooltipPosition({
        top,
        left,
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

  const tooltip = isCurrentlyHovered && description && (
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
      className='max-w-2xl bg-c2 border-2 border-c3 rounded-12 p-6 shadow-xl pointer-events-auto flex flex-col gap-10'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <p className='text-14 text-c6 font-semibold'>Définition :</p>
      <p className='text-14 text-c5 leading-[120%]'>{description}</p>
    </motion.div>
  );

  return (
    <>
      <div
        ref={keywordRef}
        className='relative transition-all duration-300'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          filter: hoveredKeyword && hoveredKeywordHasDescription && !isCurrentlyHovered ? 'blur(4px)' : 'none',
          opacity: hoveredKeyword && hoveredKeywordHasDescription && !isCurrentlyHovered ? 0.5 : 1,
        }}>
        <motion.div className='p-1 bg-gradient-to-br from-c4 to-c2 bg-[length:120%] rounded-8 flex' variants={keywordFadeIn} custom={index}>
          <div className='bg-c1 flex px-15 py-10 rounded-8'>
            <p
              className={`text-16 font-medium transition-all duration-200 ${isTopKeyword ? 'bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top' : 'text-c6'
                }`}>
              {keyword}
            </p>
          </div>
        </motion.div>
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};

interface KeywordsCloudProps {
  oeuvres: Array<{ id: string; keywords?: string[] | Array<{ id?: string; title?: string; description?: string; short_resume?: string }> }>;
  maxKeywords?: number;
}

export const OeuvresKeywords: React.FC<KeywordsCloudProps> = ({ oeuvres, maxKeywords = 16 }) => {
  // État pour suivre quel keyword est en hover
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);

  // Gérer le cas où oeuvres est undefined ou null
  const safeOeuvres = Array.isArray(oeuvres) ? oeuvres : [];

  // Extract keywords with their descriptions
  const keywordMap = useMemo(() => {
    const map: Record<string, { count: number; description?: string }> = {};
    safeOeuvres.forEach((oeuvre) => {
      oeuvre.keywords?.forEach((keyword) => {
        const keywordTitle = typeof keyword === 'string' ? keyword : keyword.title || '';
        const keywordDescription = typeof keyword === 'string' ? undefined : keyword.description || keyword.short_resume;

        if (keywordTitle) {
          if (!map[keywordTitle]) {
            map[keywordTitle] = { count: 0, description: keywordDescription };
          }
          map[keywordTitle].count += 1;
          // Keep the first description found if not already set
          if (!map[keywordTitle].description && keywordDescription) {
            map[keywordTitle].description = keywordDescription;
          }
        }
      });
    });
    return map;
  }, [safeOeuvres]);

  // Get top 3 most frequent keywords
  const topKeywords = useMemo(() => {
    return Object.entries(keywordMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([keyword]) => keyword);
  }, [keywordMap]);

  // Randomly select keywords while ensuring top 3 are included
  const selectedKeywords = useMemo(() => {
    const allKeywords = Object.entries(keywordMap).filter(([, data]) => data.count > 0);
    const otherKeywords = allKeywords.filter(([keyword]) => !topKeywords.includes(keyword));

    if (allKeywords.length <= maxKeywords) return allKeywords;

    // Get random keywords from remaining pool
    const randomOthers = [...otherKeywords].sort(() => 0.5 - Math.random()).slice(0, maxKeywords - 3);

    // Combine and shuffle
    return [...allKeywords.filter(([keyword]) => topKeywords.includes(keyword)), ...randomOthers].sort(() => 0.5 - Math.random());
  }, [keywordMap, topKeywords, maxKeywords]);

  // Log keywords to console
  useEffect(() => { }, [selectedKeywords]);

  return (
    <motion.section className='flex gap-50 items-end' initial='hidden' animate='visible'>
      <div className='flex-1 flex flex-col justify-center gap-20 max-w-40'>
        <motion.p className='text-c5 text-16 transition-all ease-in-out duration-200 max-w-md' variants={fadeIn} custom={0}>
          Des analyse centrées sur des thèmes
        </motion.p>
        <motion.h2 className='text-c6 text-64 transition-all ease-in-out duration-200' variants={fadeIn} custom={1}>
          Les mots-clés <br /> autour de nos
          <br /> Récits Artistiques/Oeuvres
        </motion.h2>
      </div>

      <motion.div className='flex flex-wrap justify-end w-1/2 gap-20' initial='hidden' animate='visible'>
        {selectedKeywords.map(([keyword, data], index) => {
          const isTopKeyword = topKeywords.includes(keyword);
          const hoveredKeywordData = hoveredKeyword ? keywordMap[hoveredKeyword] : null;
          const hoveredKeywordHasDescription = !!hoveredKeywordData?.description;

          return (
            <KeywordItem
              key={`${keyword}-${index}`}
              keyword={keyword}
              description={data.description}
              isTopKeyword={isTopKeyword}
              index={index}
              hoveredKeyword={hoveredKeyword}
              hoveredKeywordHasDescription={hoveredKeywordHasDescription}
              onHoverChange={setHoveredKeyword}
            />
          );
        })}
      </motion.div>
    </motion.section>
  );
};
