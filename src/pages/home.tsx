import React from 'react';
import { Layouts } from '@/components/layout/Layouts';
import { HomeBaner } from '@/components/features/home/HomeBaner';
import { KeywordHighlight } from '@/components/features/home/KeywordHighlight';
import { LogoCarousel } from '@/components/features/home/LogoCarousel';
import { IntervenantsSection } from '@/components/features/home/IntervenantsSection';
import { CorpusSection } from '@/components/features/home/CorpusSection';



import { Alert } from '@heroui/react';

export const Home: React.FC = () => {
  const [isSafari, setIsSafari] = React.useState(false);

  React.useEffect(() => {
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      {isSafari && (
        <Alert
          color="warning"
          description="Le site éprouve actuellement quelques difficultés à fonctionner sur le navigateur Safari. Le problème est en cours de résolution."
          variant="faded"
          className="mb-4"
        />
      )}
      <HomeBaner />
      <LogoCarousel/>
      <CorpusSection />
      <IntervenantsSection/>
      <KeywordHighlight />
    </Layouts>
  );
};
