import React, { useEffect, useState, useMemo } from 'react';
import { Layouts } from "@/components/layout/Layouts";
import * as Items from '@/services/Items';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { PratiqueNarrativeIcon } from '@/components/ui/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageBanner } from '@/components/ui/PageBanner';
import { GenreCarousel } from '@/components/features/corpus/GenreCarousel';


export const MisesEnRecits: React.FC = () => {
  const [recits, setRecits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRecits: 0,
    totalTypes: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
            recitsMediatiques, 
            docsScientifiques, 
            objetsTechno, 
            recitsCitoyens,
            recitsArtistiques
        ] = await Promise.all([
          Items.getRecitsMediatiquesCards(),
          Items.getRecitsScientifiquesCards(),
          Items.getRecitsTechnoCards(),
          Items.getRecitsCitoyensCards(),
          Items.getRecitsArtistiquesCards()
        ]);

        const allRecits = [
            ...recitsMediatiques, 
            ...docsScientifiques, 
            ...objetsTechno, 
            ...recitsCitoyens,
            ...recitsArtistiques
        ];

        setRecits(allRecits);

        setMetrics({
          totalRecits: allRecits.length,
          totalTypes: 5 
        });

      } catch (error) {
        console.error("Failed to load Mises En Récits data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const navCards = useMemo(() => [
    {
      id: 'artistiques',
      title: 'Récits Artistiques',
      description: 'Analyses des publications scientifiques et académiques.',
      path: '/corpus/recits-artistiques', 
      icon: PratiqueNarrativeIcon,
      color: '#EDB9EB'
    },
    {
      id: 'scientifiques',
      title: 'Récits Scientifiques',
      description: 'Analyses des publications scientifiques et académiques.',
      path: '/corpus/recits-scientifiques', 
      icon: PratiqueNarrativeIcon,
      color: '#86A4E7'
    },
    {
      id: 'techno',
      title: 'Récits TechnoIndustriels',
      description: 'Analyses de discours industriels et technologiques.',
      path: '/corpus/recits-techno-industriels', 
      icon: PratiqueNarrativeIcon,
      color: '#ADCFEC'
    },
    {
      id: 'citoyens',
      title: 'Récits Citoyens',
      description: 'Exploration des perspectives citoyennes et sociales.',
      path: '/corpus/recits-citoyens', 
      icon: PratiqueNarrativeIcon,
      color: '#C8F3C9'
    },
    {
      id: 'mediatiques',
      title: 'Récits Médiatiques',
      description: 'Analyse de la couverture médiatique et de la presse.',
      path: '/corpus/recits-mediatiques', 
      icon: PratiqueNarrativeIcon,
      color: '#FFF1B8'
    }
  ], []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <PageBanner
        icon={<PratiqueNarrativeIcon size={40} />}
        title="Mises en Récits de l'IA"
        description="Explorez les récits qui façonnent les imaginaires sociotechniques de l'intelligence artificielle. Découvrez quelles sont les stratégies narratives qui orientent les usages de ces technologies"
        stats={[
          { label: 'Mises en Récits', value: metrics.totalRecits },
          { label: 'Types de récits', value: metrics.totalTypes }
        ]}
      />

      <section className="w-full flex flex-col gap-100">
        <FullCarrousel
          title="Explorer les Corpus"
          data={navCards}
          perPage={3}
          perMove={1}
          renderSlide={(card, index) => <NavCard card={card} index={index} key={card.id} />}
        />

        <GenreCarousel 
            items={recits} 
            loading={loading} 
            title="Explorer par genres" 
            basePath="/corpus/genre"
        />
      </section>
    </Layouts>
  );
};

const NavCard = ({ card, index }: { card: any, index: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.2 }}
      onClick={() => navigate(card.path)}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-40 rounded-30 justify-between flex flex-col gap-40 hover:bg-c2 h-full transition-all ease-in-out duration-300'
    >
      <card.icon size={40} style={{ color: card.color }} />
      <div className='flex flex-col gap-10'>
        <p className='text-32 font-semibold transition-all ease-in-out duration-200 text-c6'>{card.title}</p>
        <p className='text-16 text-c5 font-extralight transition-all ease-in-out duration-200'>{card.description}</p>
      </div>
    </motion.div>
  );
};