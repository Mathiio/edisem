import React, { useCallback, useMemo } from 'react';
import { InfiniteCarousel } from '@/components/ui/InfiniteCarousel';
import { useThemeMode } from '@/hooks/useThemeMode';

export const LogoCarousel: React.FC = () => {
  const { isDark } = useThemeMode();
  const logoHeight = 50;

  const logos = useMemo(
    () => [
      'crilcq', 'laval', 'montreal', 'uqam', 'paris8',
      'paragraphe', 'sshrc', 'utc', 'rit',
    ],
    []
  );

  const getLogo = useCallback((logoName: string) => {
    return isDark ? `/partners/d_${logoName}.png` : `/partners/w_${logoName}.png`;
  }, [isDark]);

  const logoUrls = useMemo(() => {
    return logos.map(logo => ({
      name: logo,
      url: getLogo(logo)
    }));
  }, [logos, getLogo]);

  return (
    <div className='relative w-full'>
      <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-80 bg-gradient-to-r from-c1 to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-80 bg-gradient-to-l from-c1 to-transparent" />
    <InfiniteCarousel
      items={logoUrls}
      renderItem={(logo) => (
        <img
          src={logo.url}
          alt={`${logo.name} logo`}
          style={{ height: `${logoHeight}px` }}
          className="object-contain opacity-75"
          loading="lazy"
          decoding="async"
        />
      )}
      gap={48}
      speed={30}
      fadeWidth="96px"
      ariaLabel="Logos des partenaires"
    />
    </div>
  );
};