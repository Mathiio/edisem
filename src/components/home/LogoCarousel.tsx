import React, { useMemo, useState } from 'react';
import { useThemeMode } from '@/hooks/useThemeMode';

export const LogoCarousel: React.FC = () => {
  const { isDark } = useThemeMode();
  const logoHeight = 50; // px


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

  const getLogo = (logoName: string) => {
    const logo = isDark ? `/partners/d_${logoName}.png` : `/partners/w_${logoName}.png`;
    return logo;
  };

  return (
    <div className="relative overflow-hidden w-full py-4">
      <div className="absolute left-0 top-0 h-full w-96 z-10 pointer-events-none fade-left" />
      <div className="absolute right-0 top-0 h-full w-96 z-10 pointer-events-none fade-right" />
      <div className="relative flex">
        <div className="animate-scrollLogos flex min-w-max">
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <img
              key={`${logo}-${index}`}
              src={getLogo(logo)}
              alt={`${logo} logo`}
              style={{ height: `${logoHeight}px` }}
              className="object-contain mr-12 flex-shrink-0 opacity-75"
            />
          ))}
        </div>
      </div>
    </div>
  );
};