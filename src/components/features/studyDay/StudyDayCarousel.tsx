import { FullCarrousel } from '@/components/ui/Carrousels';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Edition } from '@/types/ui';

interface StudyDayCarouselProps {
  studyDay: any[];
  loading?: boolean;
}

// Card animation configuration
const cardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: 0.1 + index * 0.2,
      ease: "easeInOut"
    },
  }),
};

// Seminar Edition Card Component
const SeminarEditionCard = ({ edition }: { edition: Edition }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const slug = edition.title.toLowerCase().replace(/\s+/g, '-');
    const url = `/corpus/journees-etudes/edition/${edition.id}/${slug}`;
    navigate(url);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      onClick={handleClick}
      className="shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-40 rounded-30 flex flex-col gap-40 hover:bg-c2 h-full transition-all ease-in-out duration-200"
    >
      <h2 className='text-32 text-c6'>{edition.title}</h2>
      <p className="text-18 text-c4">
        {edition.conferenceCount} conférences
      </p>
    </motion.div>
  );
};

// Main Carousel Component
export const StudyDayCarousel = ({ studyDay, loading = false }: StudyDayCarouselProps) => {
  const [editions, setEditions] = useState<Edition[]>([]);

  useEffect(() => {
    if (!loading && studyDay.length > 0) {
      // Grouper par édition
      const editionMap: { [key: string]: { confNum: number; date: string; season: string } } = {};

      studyDay.forEach((conf: any) => {
        const editionId = conf.edition;
        const season = conf.season.trim();

        if (!editionMap[editionId]) {
          editionMap[editionId] = { confNum: 0, date: conf.date, season };
        }
        editionMap[editionId].confNum++;
      });

      // Formater les données
      const formattedEditions = Object.entries(editionMap)
        .map(([id, { confNum, date, season }]) => ({
          id,
          title: `Édition ${capitalizeFirstLetter(season)} ${date.split('-')[0]}`,
          season: capitalizeFirstLetter(season),
          year: date.split('-')[0],
          conferenceCount: confNum,
          date,
        }))
        .sort((a, b) => {
          if (b.year !== a.year) return Number(b.year) - Number(a.year);
          return getSeasonOrder(b.season) - getSeasonOrder(a.season);
        });

      setEditions(formattedEditions);
    }
  }, [studyDay, loading]);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getSeasonOrder = (season: string) => {
    const seasonOrder: Record<string, number> = {
      'Automne': 3,
      'Été': 2,
      'Printemps': 1,
      'Hiver': 0
    };
    return seasonOrder[season] || 0;
  };

  return (
    <div className="w-full max-w-full">
      {!loading && editions.length > 0 && (
        <FullCarrousel
          title="Toutes nos Journées d'édtudes"
          data={editions}
          perPage={3}
          perMove={1}
          renderSlide={(edition, index) => <SeminarEditionCard edition={edition} key={index} />}
        />
      )}
    </div>
  );
};
