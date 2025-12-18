import React, { useEffect, useState, useMemo } from 'react';
import { Layouts } from "@/components/layout/Layouts";
import * as Items from '@/services/Items';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { ExperimentationIcon, OeuvreIcon, PratiqueNarrativeIcon } from '@/components/ui/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeywordsBarChart } from '@/components/features/pratiquesNarratives/KeywordsBarChart';
import { OeuvreCard } from '@/components/features/oeuvres/OeuvresCards';
import { ExpCard } from '@/components/features/experimentation/ExpCards';
import { PageBanner } from '@/components/ui/PageBanner';


export const PratiquesNarratives: React.FC = () => {
    const [metrics, setMetrics] = useState({
        recits: 0,
        oeuvres: 0,
        experimentations: 0
    });
    const [oeuvresData, setOeuvresData] = useState<any[]>([]);
    const [experimentationsData, setExperimentationsData] = useState<any[]>([]);
    const [keywordCounts, setKeywordCounts] = useState<{label: string, value: number}[]>([]);

    useEffect(() => {
        const loadData = async () => {
             try {
                 const [oeuvres, experimentations, recitsMediatiques, docsScientifiques, objetsTechno, recitsCitoyens] = await Promise.all([
                     Items.getOeuvres(),
                     Items.getExperimentations(),
                     Items.getRecitsMediatiques(),
                     Items.getRecitsScientifiques(),
                     Items.getRecitsTechnoIndustriels(),
                     Items.getRecitsCitoyens()
                 ]);

                 const allRecits = [
                    ...recitsMediatiques, 
                    ...docsScientifiques, 
                    ...objetsTechno,
                    ...recitsCitoyens
                 ];
                 
                 setMetrics({
                     recits: allRecits.length,
                     oeuvres: oeuvres.length,
                     experimentations: experimentations.length
                 });
                 setOeuvresData(oeuvres);
                 setExperimentationsData(experimentations);

                 // Aggregating all keywords
                 const allItems = [
                    ...oeuvres, 
                    ...experimentations, 
                    ...recitsMediatiques, 
                    ...docsScientifiques, 
                    ...objetsTechno, 
                    ...recitsCitoyens
                 ];

                 const keywordCountsMap = new Map<string, number>();

                 allItems.forEach((item: any) => {
                     // Collect all possible keyword arrays
                     const itemKeywords = [
                         ...(Array.isArray(item.keywords) ? item.keywords : []),
                         ...(Array.isArray(item.motcles) ? item.motcles : []),
                         ...(Array.isArray(item.concepts) ? item.concepts : [])
                     ];

                     itemKeywords.forEach((k: any) => {
                         // Extract the label/title. Assuming k is object {title: string} or string
                         const label = (typeof k === 'object' ? k.title : k) || "";
                         if (label) {
                             // Normalize label if needed (e.g. trim)
                             const normalizedLabel = label.trim();
                             keywordCountsMap.set(normalizedLabel, (keywordCountsMap.get(normalizedLabel) || 0) + 1);
                         }
                     });
                 });

                 // Sort by count descending and take top 8
                 const topKeywords = Array.from(keywordCountsMap.entries())
                     .sort((a, b) => b[1] - a[1]) // Sort by count descending
                     .slice(0, 8) // Take top 8
                     .map(([label, value]) => ({ label, value }));

                 setKeywordCounts(topKeywords);

             } catch (error) {
                 console.error("Failed to load Pratiques Narratives data", error);
             }
        };
        loadData();
    }, []);

    const navCards = useMemo(() => [
        {
            id: 'exp',
            title: 'Expérimentations',
            description: 'Explorations interdisciplinaires et démarches expérimentales',
            path: '/corpus/experimentations',
            icon: ExperimentationIcon
        },
        {
            id: 'oeuvres',
            title: 'Oeuvres',
            description: 'Réflexions autour des usages narratifs de l\'intelligence artificielle',
            path: '/corpus/oeuvres',
            icon: OeuvreIcon
        },
        {
            id: 'recits',
            title: "Mises en récits de l'IA",
            description: 'Exploration des imaginaires et représentations médiatiques',
            path: '/corpus/mises-en-recits',
            icon: PratiqueNarrativeIcon
        }
    ], []);

  return (
       <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
          <PageBanner
            icon={<PratiqueNarrativeIcon size={40} />}
            title="Pratique Narratives et IA"
            description="Explorez les récits qui façonnent les imaginaires sociotechniques de l'intelligence artificielle. Découvrez quelles sont les stratégies narratives qui orientent les usages de ces technologies"
            stats={[
              { label: 'Mises en Récits', value: metrics.recits },
              { label: 'Oeuvres', value: metrics.oeuvres },
              { label: 'Expérimentations', value: metrics.experimentations }
            ]}
          />
          
          {/* Section 1: Navigation Carousel */}
          <section className="w-full">
            <FullCarrousel 
                title="Explorer les Corpus"
                data={navCards}
                perPage={3}
                perMove={1}
                renderSlide={(card, index) => <NavCard card={card} index={index} key={card.id}/>}
            />
          </section>

          {/* Section 2: Suggestions d'Oeuvres */}
          <section className="w-full flex flex-col gap-20">
            <h2 className="text-24 font-medium text-c6">Suggestions d'Oeuvres</h2>
            <div className="grid grid-cols-4 grid-rows-auto gap-20">
              {oeuvresData.slice(0, 4).map((oeuvre) => (
                  <OeuvreCard {...oeuvre} />
              ))}
            </div>
          </section>

          {/* Section 3: Keyword Chart */}
          <KeywordsBarChart data={keywordCounts} />

          {/* Section 4: Latest Experimentations */}
          <section className="w-full flex flex-col gap-20">
            <h2 className="text-24 font-medium text-c6">Dernières Expérimentations</h2>
            <div className="grid grid-cols-4 grid-rows-auto gap-20">
              {experimentationsData.slice(0, 5).map((exp) => (
                  <ExpCard {...exp} />
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
        className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-40 rounded-30 justify-between flex flex-col gap-40 hover:bg-c2 h-full transition-all ease-in-out duration-300'
      >
        <card.icon size={40} className='text-c6' />
        <div className='flex flex-col gap-10'>
          <p className='text-32 font-semibold transition-all ease-in-out duration-200 text-c6'>{card.title}</p>
          <p className='text-16 text-c5 font-extralight transition-all ease-in-out duration-200'>{card.description}</p>
        </div>
      </motion.div>
    );
};