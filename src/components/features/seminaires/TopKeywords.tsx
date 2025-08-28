import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Items from "@/lib/Items";
import { Conference } from '@/types/ui';
import { SearchModal, SearchModalRef } from '@/components/layout/SearchModal';

type KeywordCount = {
  id: string;
  title: string;
  count: number;
};

// Props for individual keyword cards
interface KeywordCardProps {
  keyword: KeywordCount;
  position: 'first' | 'second' | 'third';
  onKeywordClick: (keyword: string) => void;
};


// Individual keyword card component
const KeywordCard = ({ keyword, position, onKeywordClick }: KeywordCardProps) => {
  // Position-specific styles
  const positionStyles = {
    first: {
      container: 'transform -translate-y-20',
    },
    second: {
      container: 'transform translate-y-10',
    },
    third: {
      container: 'transform translate-y-10',
    }
  };

  const currentStyle = positionStyles[position];

  return (
    <div className={`${currentStyle.container} flex flex-col items-center`} onClick={() => onKeywordClick(keyword.title)} >
      <motion.div
        className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer rounded-30 flex flex-col items-center hover:bg-c2 transition-all ease-in-out duration-200 p-40 gap-20 w-80'
      >
        <h3 className={`text-64 bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top font-semibold`}>
          {keyword.count}
        </h3>
        <div className="flex flex-col items-center gap-5">
          <p className="text-12 text-c4">conférences sur</p>
          <p className="text-16 font-medium text-c6 line-clamp-1 text-center">
            {keyword.title}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const TopKeywords = () => {
    const [topKeywords, setTopKeywords] = useState<KeywordCount[]>([]);
    const searchModalRef = useRef<SearchModalRef>(null);

  useEffect(() => {
    const loadSeminarKeywords = async () => {
      try {
        console.log('Chargement des conférences de type "Séminaire"...');

        // 1. Récupérer TOUTES les conférences
        const allConfs = await Items.getConfs();
        console.log(`Nombre total de conférences: ${allConfs.length}`);

        // 2. Filtrer UNIQUEMENT les séminaires (toutes éditions confondues)
        const seminarConfs = allConfs.filter((conf: Conference) =>
          conf.event?.toLowerCase().includes('séminaire')
        );

        // 3. Compter les mots-clés dans les séminaires
        const keywordMap = new Map<string, KeywordCount>();

        seminarConfs.forEach((conf: Conference) => {
          if (conf.motcles && Array.isArray(conf.motcles)) {
            conf.motcles.forEach(keyword => {
              if (keyword.id && keyword.title) {
                const current = keywordMap.get(keyword.id) || {
                  id: keyword.id,
                  title: keyword.title,
                  count: 0
                };
                keywordMap.set(keyword.id, {
                  ...current,
                  count: current.count + 1
                });
              }
            });
          }
        });

        // 4. Trier et prendre les 3 plus fréquents
        const sortedKeywords = Array.from(keywordMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setTopKeywords(sortedKeywords);

      } catch (err) {
        console.error('Erreur lors du chargement:', err);
      }
    };

    loadSeminarKeywords();
  }, []);

  // Get top 3 keywords sorted by count
  const topThreeKeywords = useMemo(() => {
    if (!topKeywords?.length) return [];

    const sorted = [...topKeywords];
    sorted.sort((a, b) => b.count - a.count);
    return sorted.slice(0, 3);
  }, [topKeywords]);

    const handleKeywordClick = (keyword: string) => {
        searchModalRef.current?.openWithSearch(keyword);
    };


  return (
    <section className='flex flex-col items-center justify-center gap-40 p-20'>
      {/* Section header */}
      <div className='flex flex-col items-center justify-center gap-20'>
        <p className='text-c5 text-16 z-[12] text-center'>Thématiques phares des conférences</p>
        <h2 className='text-24 font-medium text-c6 text-center leading-[120%]'>
          Le réseau EdiSem rassemble une constellation de penseurs,<br />
          chercheur·es, artistes et praticien·nes du monde entier.
        </h2>
      </div>

        <SearchModal ref={searchModalRef} notrigger />

      {/* Podium layout - same as TopIntervenants */}
      {topThreeKeywords.length > 0 ? (
        <div className='flex items-end justify-center gap-20 p-20 w-full'>
          {/* Second place */}
          {topThreeKeywords[1] && <KeywordCard keyword={topThreeKeywords[1]} position='second' onKeywordClick={handleKeywordClick}/>}

          {/* First place - center */}
          {topThreeKeywords[0] && <KeywordCard keyword={topThreeKeywords[0]} position='first' onKeywordClick={handleKeywordClick}/>}

          {/* Third place */}
          {topThreeKeywords[2] && <KeywordCard keyword={topThreeKeywords[2]} position='third' onKeywordClick={handleKeywordClick}/>}
        </div>
      ) : (
        <p className='text-c5 text-16'>Aucun mot-clé trouvé</p>
      )}
    </section>
  );
};
