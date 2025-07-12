import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { getSeminaires, getActants } from '../lib/Items';
import { EventCard, EventSkeleton } from '@/components/features/home/EventCards';
import { ActantCard, ActantSkeleton } from '@/components/features/actants/ActantCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';
import { HomeBaner } from '@/components/features/home/HomeBaner';
import { KeywordHighlight } from '@/components/features/home/KeywordHighlight';
import { LogoCarousel } from '@/components/features/home/LogoCarousel';
import { InfiniteSlider } from '@/components/features/home/InfiniteSlider';
import { Link } from 'react-router-dom';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

// Fonction pour mélanger un tableau
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const Home: React.FC = () => {
  const [seminaires, setSeminaires] = useState<any[]>([]);
  const [actants, setActants] = useState<any[]>([]);
  const [loadingSeminaires, setLoadingSeminaires] = useState(true);
  const [loadingActants, setLoadingActants] = useState(true);
  const [sliderGroups, setSliderGroups] = useState<any[][]>([]);

  const dataFetchedRef = useRef(false);

  const fetchSeminaires = useCallback(async () => {
    if (dataFetchedRef.current) return;
    const seminaires = await getSeminaires();
    setSeminaires(seminaires);
    setLoadingSeminaires(false);
  }, []);

  const fetchActants = useCallback(async () => {
    if (dataFetchedRef.current) return;
    const actants = await getActants();
    setActants(actants as any);
    setLoadingActants(false);
  }, []);

  // Créer 3 groupes de 8 actants aléatoires
  useEffect(() => {
    if (actants.length > 0 && !loadingActants) {
      const shuffled = shuffleArray(actants);
      const group1 = shuffled.slice(0, 8);
      const group2 = shuffled.slice(8, 16);
      const group3 = shuffled.slice(16, 24);
      setSliderGroups([group1, group2, group3]);
    }
  }, [actants, loadingActants]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    fetchSeminaires();
    fetchActants();
    dataFetchedRef.current = true;
  }, [fetchSeminaires, fetchActants]);

  const renderActantCard = (item: any, index: number) => (
    <motion.div
      key={`${item.id}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <ActantCard
        id={item.id}
        firstname={item.firstname}
        lastname={item.lastname}
        picture={item.picture}
        interventions={item.interventions}
        universities={item.universities.map((uni: { shortName: string; logo: string }) => ({
          shortName: uni.shortName,
          logo: uni.logo,
        }))}
      />
    </motion.div>
  );

  const renderSkeletonCard = (index: number) => (
    <div key={index} className="h-full">
      <ActantSkeleton />
    </div>
  );

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <HomeBaner />
      <LogoCarousel/>

      <FullCarrousel
        title='Derniers séminaires Arcanes'
        perPage={3}
        perMove={1}
        data={loadingSeminaires ? Array.from({ length: 5 }) : seminaires}
        renderSlide={(item) =>
          loadingSeminaires ? (
            <EventSkeleton />
          ) : (
            <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
              <EventCard id={item.id} title={`Édition ${item.season} ${item.year}`} numConf={item.confNum} />
            </motion.div>
          )
        }
      />

      {/* Section avec titre/texte à gauche et 3 sliders à droite */}
      <section className='flex gap-50 h-[600px]'>
        {/* Partie gauche - Titre et description */}
        <div className='flex-1 flex flex-col justify-center gap-20 max-w-40'>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='text-c6 text-64 transition-all ease-in-out duration-200'
          >
            Intervenants & <br/>
            Conférenciers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-c5 text-16 transition-all ease-in-out duration-200 max-w-md'
          >
            Découvrez les chercheur·e·s, artistes et invité·e·s ayant contribué aux séminaires, colloques, journées d’études et œuvres d’EdiSem.          
          </motion.p>
          <Link to='/intervenants' className="hover:bg-c3 bg-c2 border-c3 shadow-[inset_0_0px_10px_rgba(255,255,255,0.05)] w-fit cursor-pointer px-15 py-10 text-16 gap-10 text-c6 rounded-8 border-2 transition-all ease-in-out duration-200">
            <div className='font-medium'>Voir plus</div>
          </Link>
        </div>

        {/* Partie droite - 3 sliders infinis */}
        <div className='flex-1 flex gap-4 relative'>
          <div className="absolute top-0 h-64 w-full z-10 pointer-events-none fade-bottom" />
          <div className="absolute bottom-0 h-64 w-full z-10 pointer-events-none fade-top" />
          {loadingActants ? (
            // Afficher 3 colonnes de skeletons pendant le chargement
            Array.from({ length: 3 }).map((_, sliderIndex) => (
              <InfiniteSlider
                key={sliderIndex}
                cards={Array.from({ length: 8 }).map((_, cardIndex) => 
                  renderSkeletonCard(cardIndex)
                )}
                direction={sliderIndex % 2 === 0 ? 'down' : 'up'}
                speed={0.5 + (sliderIndex * 0.2)}
                className="flex-1"
                cardHeight={240}

              />
            ))
          ) : (
            // Afficher les 3 sliders avec les données
            sliderGroups.map((group, sliderIndex) => (
              <InfiniteSlider
                key={sliderIndex}
                cards={group.map((item, cardIndex) => 
                  renderActantCard(item, cardIndex)
                )}
                direction={sliderIndex % 2 === 0 ? 'down' : 'up'}
                speed={0.5 + (sliderIndex * 0.2)}
                className="flex-1"
                cardHeight={240}
              />
            ))
          )}
        </div>
      </section>

      <KeywordHighlight />
    </Layouts>
  );
};