import React from 'react';
import { Layouts } from '@/components/layout/Layouts';
import { HomeBaner } from '@/components/features/home/HomeBaner';
import { KeywordHighlight } from '@/components/features/home/KeywordHighlight';
import { LogoCarousel } from '@/components/features/home/LogoCarousel';
import { IntervenantsSection } from '@/components/features/home/IntervenantsSection';
import { CorpusSection } from '@/components/features/home/CorpusSection';



export const Home: React.FC = () => {
  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <HomeBaner />
      <LogoCarousel/>
      <CorpusSection />
      <IntervenantsSection/>
      <KeywordHighlight />
    </Layouts>
  );
};
