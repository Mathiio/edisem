import { FullCarrousel } from '@/components/ui/Carrousels';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Items from "@/lib/Items";
import { motion, Variants } from 'framer-motion';
import { SeminarEdition } from '@/types/ui';



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
const SeminarEditionCard = ({ edition }: { edition: SeminarEdition }) => {
  const navigate = useNavigate();

  // Handle card click navigation
  const handleClick = () => {
    const url = `/edition/${edition.id}/${edition.title.toLowerCase().replace(/\s+/g, '-')}`;
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
export const EditionsCarousel = () => {
  const [editions, setEditions] = useState<SeminarEdition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and format seminar editions data
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        setIsLoading(true);
        const seminaires = await Items.getSeminaires();

        // Format raw data into SeminarEdition type
        const formattedEditions = seminaires.map((seminaire: any) => ({
          id: seminaire.id,
          title: `Édition ${capitalizeFirstLetter(seminaire.season)} ${seminaire.year}`,
          season: capitalizeFirstLetter(seminaire.season),
          year: seminaire.year,
          conferenceCount: seminaire.confNum,
          date: seminaire.date
        }));

        // Sort by year (descending) then by season
        const sortedEditions = formattedEditions.sort((a, b) => {
          if (b.year !== a.year) return Number(b.year) - Number(a.year);
          return getSeasonOrder(b.season) - getSeasonOrder(a.season);
        });

        setEditions(sortedEditions);
      } catch (error) {
        console.error('Error fetching seminar editions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEditions();
  }, []);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Get numerical order for seasons
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
      {!isLoading && (
        <FullCarrousel
          title='Tous nos séminaires'
          data={editions}
          perPage={3}
          perMove={1}
          renderSlide={(edition, index) => <SeminarEditionCard edition={edition} key={index} />}
        />
      )}
    </div>
  );
};
