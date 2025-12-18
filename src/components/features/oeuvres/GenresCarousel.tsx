import { FullCarrousel } from '@/components/ui/Carrousels';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { slugUtils } from '@/lib/utils';

interface GenreCarouselProps {
  oeuvres: any[];
  loading?: boolean;
}

interface Genre {
  name: string;
  count: number;
  oeuvres: any[];
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
const GenreCard = ({ genre }: { genre: Genre }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const slug = slugUtils.toSlug(genre.name);
    navigate(`/corpus/recits-artistiques/genre/${slug}`);
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
          {genre.count} {genre.count === 1 ? 'œuvre' : 'œuvres'}
        </p>
      </div>
    </motion.div>
  );
};

// Main Genre Carousel Component
export const GenreCarousel = ({ oeuvres, loading = false }: GenreCarouselProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    if (!loading && oeuvres.length > 0) {
      const genreMap: { [key: string]: { oeuvres: any[] } } = {};

      oeuvres.forEach((oeuvre: any) => {
        const genreName = oeuvre.genre;
        if (!genreName) return;

        if (!genreMap[genreName]) {
          genreMap[genreName] = { oeuvres: [] };
        }
        genreMap[genreName].oeuvres.push(oeuvre);
      });

      const formattedGenres = Object.entries(genreMap)
        .map(([name, { oeuvres }]) => ({
          name,
          count: oeuvres.length,
          oeuvres: oeuvres.sort((a, b) => b.date - a.date)
        }))
        .sort((a, b) => b.count - a.count);

      setGenres(formattedGenres);
    }
  }, [oeuvres, loading]);

  if (loading || genres.length === 0) return null;

  return (
    <div className="w-full max-w-full">
      <FullCarrousel
        title="Récits Artistiques/Oeuvres par genre"
        data={genres}
        perPage={3}
        perMove={1}
        renderSlide={(genre, index) => <GenreCard genre={genre} key={`${genre.name}-${index}`} />}
      />
    </div>
  );
};