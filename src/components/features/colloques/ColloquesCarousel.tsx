import { FullCarrousel } from '@/components/ui/Carrousels';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Edition } from '@/types/ui';
import { getSeasonOrder } from '@/lib/utils';

interface ColloquesCarouselProps {
  editions: Edition[];
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

// Colloques Edition Card Component
const ColloqueEditionCard = ({ edition }: { edition: Edition }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const slug = edition.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/corpus/seminaires/edition/${edition.id}/${slug}`);
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
      <div className='flex flex-col items-start'>
        <p className="text-18 text-c4">
          Édition {edition.season} {edition.year}
        </p>
        <p className="text-18 text-c4">
          {edition.conferences?.length ?? 0} conférences
        </p>
      </div>
    </motion.div>
  );
};

// Main Carousel Component
export const ColloquesCarousel = ({ editions, loading = false }: ColloquesCarouselProps) => {
  if (!editions || editions.length === 0) return null;
  
  const sortedEditions = [...editions].sort((a, b) => {
    if (b.year !== a.year) return Number(b.year) - Number(a.year);
    return getSeasonOrder(b.season) - getSeasonOrder(a.season);
  });

  return (
    <div className="w-full max-w-full">
      {!loading && editions.length > 0 && (
        <FullCarrousel
          title='Tous nos colloques'
          data={sortedEditions}
          perPage={3}
          perMove={1}
          renderSlide={(edition, index) => <ColloqueEditionCard edition={edition} key={index} />}
        />
      )}
    </div>
  );
};
