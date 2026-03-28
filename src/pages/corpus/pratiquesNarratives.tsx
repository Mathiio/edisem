import React, { useEffect, useState, useMemo } from 'react';
import { Layouts } from '@/components/layout/Layouts';
import * as Items from '@/services/Items';
import * as Analytics from '@/services/Analytics';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { PratiqueNarrativeIcon } from '@/components/ui/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeywordsBarChart } from '@/components/features/pratiquesNarratives/KeywordsBarChart';
import { ResourceCard } from '@/components/features/corpus/ResourceCard';
import { PageBanner } from '@/components/ui/PageBanner';
import { RESOURCE_TYPES } from '@/config/resourceConfig';

export const PratiquesNarratives: React.FC = () => {
  const [metrics, setMetrics] = useState({
    recits: 0,
    experimentations: 0
  });
  const [experimentationsData, setExperimentationsData] = useState<any[]>([]);
  const [keywordCounts, setKeywordCounts] = useState<{ label: string, value: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use optimized backend stats from Analytics service
        const [stats, keywords, experimentations] = await Promise.all([
          Analytics.getNarrativePracticesStats(),
          Analytics.getNarrativeTopKeywords(8),
          Items.getExperimentationCards()
        ]);

        setMetrics({
          recits: stats.recits || 0,
          experimentations: stats.experimentations || 0
        });
        
        setExperimentationsData(experimentations);
        setKeywordCounts(keywords || []);

      } catch (error) {
        console.error("Failed to load Pratiques Narratives data", error);
      }
    };
    loadData();
  }, []);

  const navCards = useMemo(() => {
    const expConfig = RESOURCE_TYPES.experimentation;
    
    return [
      {
        id: 'exp',
        title: expConfig.collectionLabel || expConfig.label,
        description: 'Explorations interdisciplinaires et démarches expérimentales',
        path: expConfig.collectionUrl || expConfig.getUrl(''),
        icon: expConfig.icon
      },
      {
        id: 'recits',
        title: "Mises en récits de l'IA",
        description: 'Exploration des imaginaires et représentations médiatiques',
        path: '/corpus/mises-en-recits',
        icon: PratiqueNarrativeIcon
      }
    ];
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-36 z-0 overflow-visible'>
      <PageBanner
        icon={<PratiqueNarrativeIcon size={40} />}
        title="IA et Pratiques Narratives"
        description="Explorez les récits qui façonnent les imaginaires sociotechniques de l'intelligence artificielle. Découvrez quelles sont les stratégies narratives qui orientent les usages de ces technologies"
        stats={[
          { label: 'Mises en Récits', value: metrics.recits },
          { label: 'Expérimentations', value: metrics.experimentations }
        ]}
      />

      {/* Section 1: Navigation Carousel */}
      <section className="w-full">
        <FullCarrousel
          title="Explorer le Corpus"
          data={navCards}
          perPage={3}
          perMove={1}
          renderSlide={(card, index) => <NavCard card={card} index={index} key={card.id} />}
        />
      </section>

      {/* Section 3: Keyword Chart */}
      <KeywordsBarChart data={keywordCounts} />

      {/* Section 4: Latest Experimentations */}
      <section className="w-full flex flex-col gap-5">
        <h2 className="text-2xl font-medium text-c6">Dernières Expérimentations</h2>
        <div className="grid grid-cols-4 grid-rows-auto gap-5">
          {experimentationsData.slice(0, 5).map((exp) => (
            <ResourceCard 
              title={exp.title}
              thumbnailUrl={exp.thumbnail}
              authors={exp.authors}
              subtitle={exp.subtitle}
              type={exp.type}
              item={{ ...exp }}
              key={exp.id}
            />
          ))}
        </div>
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
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-10 rounded-4xl justify-between flex flex-col gap-10 hover:bg-c2 h-full transition-all ease-in-out duration-300'
    >
      <card.icon size={40} className='text-c6' />
      <div className='flex flex-col gap-2.5'>
        <p className='text-3xl font-medium transition-all ease-in-out duration-200 text-c6'>{card.title}</p>
        <p className='text-base text-c5 font-normal transition-all ease-in-out duration-200'>{card.description}</p>
      </div>
    </motion.div>
  );
};
