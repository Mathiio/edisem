import { FullCarrousel } from '@/components/ui/Carrousels';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { slugUtils } from '@/lib/utils';

interface GenreItem {
  id: string | number;
  label: string;
}

interface ItemWithGenres {
  id: string;
  genres?: GenreItem[];
  [key: string]: any;
}

interface GenreCarouselProps {
  items: ItemWithGenres[];
  loading?: boolean;
  title?: string;
  basePath?: string; // e.g., '/corpus/genre'
}

interface Genre {
  id: string | number;
  name: string;
  count: number;
  items: ItemWithGenres[];
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

// Genre Card Component
const GenreCard = ({ genre, basePath }: { genre: Genre, basePath: string }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const slug = slugUtils.toSlug(genre.name);
    // Use the genre ID if possible/needed, but slug is prettier for URLs.
    // The detail page will need to handle slug match or we pass ID in state?
    // For now, consistent with old behavior: slug.
    navigate(`${basePath}/${slug}`, { state: { genreId: genre.id } });
  };


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      onClick={handleClick}
      className="shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-40 rounded-30 flex flex-col gap-30 hover:bg-c2 h-full transition-all ease-in-out duration-200 group"
    >
      <div className="flex flex-col gap-20">
        <h2 className='text-32 text-c6 font-semibold transition-colors duration-200'>
          {genre.name}
        </h2>
        <p className="text-18 text-c4">
          {genre.count} {genre.count === 1 ? 'récit' : 'récits'}
        </p>
      </div>
    </motion.div>
  );
};

// Main Genre Carousel Component
export const GenreCarousel = ({ 
  items, 
  loading = false, 
  title = "Explorer par genre",
  basePath = "/corpus/recits-artistiques/genre" // Default to old path for backward compat if needed, but we'll override
}: GenreCarouselProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    if (!loading && items.length > 0) {
      const genreMap: { [key: string]: Genre } = {};

      items.forEach((item) => {
        if (!item.genres || !Array.isArray(item.genres)) return;

        item.genres.forEach((genreItem) => {
            const genreId = String(genreItem.id);
            const genreName = genreItem.label;
            
            if (!genreMap[genreId]) {
                genreMap[genreId] = { 
                    id: genreItem.id,
                    name: genreName, 
                    count: 0, 
                    items: [] 
                };
            }
            
            // Avoid duplicates if an item lists the same genre twice (unlikely but safe)
            if (!genreMap[genreId].items.some(i => i.id === item.id)) {
                genreMap[genreId].items.push(item);
                genreMap[genreId].count++;
            }
        });
      });

      const formattedGenres = Object.values(genreMap)
        .sort((a, b) => b.count - a.count);

      setGenres(formattedGenres);
    }
  }, [items, loading]);

  if (loading || genres.length === 0) return null;

  return (
    <div className="w-full max-w-full">
      <FullCarrousel
        title={title}
        data={genres}
        perPage={3}
        perMove={1}
        renderSlide={(genre, index) => <GenreCard genre={genre} key={`${genre.id}-${index}`} basePath={basePath} />}
      />
    </div>
  );
};
