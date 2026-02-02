import React from 'react';
import { InfiniteCarousel } from '@/components/ui/InfiniteCarousel';
import { IntervenantCard, IntervenantSkeleton } from '@/components/features/intervenants/IntervenantCards';
import { Actant } from '@/types/ui';

type IntervenantsCarouselProps = {
  intervenants: Actant[];
  loading?: boolean;
};

export const IntervenantsCarousel: React.FC<IntervenantsCarouselProps> = ({ 
  intervenants, 
  loading = false 
}) => {

  return (
    <div className='relative w-full'>
      <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-80 bg-gradient-to-r from-c1 to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-80 bg-gradient-to-l from-c1 to-transparent" />
    <InfiniteCarousel
      items={intervenants}
      loading={loading}
      renderItem={(intervenant) => <IntervenantCard {...intervenant} />}
      renderSkeleton={() => <IntervenantSkeleton />}
      skeletonCount={12}
      itemWidth={250}
      gap={20}
      speed={50}
      hoverSpeed={0}
      emptyMessage="Aucun intervenant trouvé"
      ariaLabel="Carrousel des intervenants"
    />
    </div>
  );
};