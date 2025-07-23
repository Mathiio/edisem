import React, { useCallback, useMemo } from 'react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { motion, Variants } from 'framer-motion';


// Animation variants for all logos
const variants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.5, 
      delay: 0.1+ index * 0.1,
      ease: "easeOut"
    },
  }),
};

export const LogoCarousel: React.FC = () => {
  const { isDark } = useThemeMode(); // Get current theme mode (dark or light)
  const logoHeight = 50; // Set the logo height in px

  // List of logo names (without extension or theme prefix)
  const logos = useMemo(
    () => [
      'crilcq',
      'laval',
      'montreal',
      'uqam',
      'paris8',
      'paragraphe',
      'sshrc',
      'utc',
      'rit',
    ],
    [],
  );

  // Return the appropriate logo path based on current theme
  const getLogo = useCallback((logoName: string) => {
    return isDark ? `/partners/d_${logoName}.png` : `/partners/w_${logoName}.png`;
  }, [isDark]);

  // Construct the full URL list with theme-based paths
  const logoUrls = useMemo(() => {
    return logos.map(logo => ({
      name: logo,
      url: getLogo(logo)
    }));
  }, [logos, getLogo]);

  // Repeat the list 3 times to simulate infinite scrolling
  const repeatedLogos = useMemo(() => {
    return [...logoUrls, ...logoUrls, ...logoUrls];
  }, [logoUrls]);

  return (
    <div className="relative overflow-hidden w-full py-4">
      {/* Left and right fading overlays for visual effect */}
      <div className="absolute left-0 top-0 h-full w-96 z-10 pointer-events-none fade-left" />
      <div className="absolute right-0 top-0 h-full w-96 z-10 pointer-events-none fade-right" />

      {/* Scrolling container */}
      <div className="relative flex">
        <div className="animate-scrollLogos flex min-w-max">

          {/* Inner content: repeated logos in horizontal flex layout */}
          {repeatedLogos.map((logo, index) => (
            <motion.img
              key={`${logo.name}-${index}`}
              src={logo.url}
              alt={`${logo.name} logo`}
              style={{ height: `${logoHeight}px` }}
              className="object-contain mr-12 flex-shrink-0 opacity-75"
              loading="lazy"
              decoding="async"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={variants}
            />
          ))}
        </div>
      </div>
    </div>
  );
};