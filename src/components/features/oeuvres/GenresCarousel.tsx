import { FullCarrousel } from '@/components/ui/Carrousels';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { slugUtils } from '@/lib/utils';

interface GenreCarouselProps {
  recitsArtistiques: any[];
  loading?: boolean;
}

interface Genre {
  name: string;
  count: number;
  recitsArtistiques: any[];
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
export const GenreCarousel = ({ recitsArtistiques, loading = false }: GenreCarouselProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    if (!loading && recitsArtistiques.length > 0) {
      const genreMap: { [key: string]: { recitsArtistiques: any[] } } = {};

      recitsArtistiques.forEach((recit_artistique: any) => {
        const genreName = recit_artistique.genre;
        if (!genreName) return;

        if (!genreMap[genreName]) {
          genreMap[genreName] = { recitsArtistiques: [] };
        }
        genreMap[genreName].recitsArtistiques.push(recit_artistique);
      });

      const formattedGenres = Object.entries(genreMap)
        .map(([name, { recitsArtistiques }]) => ({
          name,
          count: recitsArtistiques.length,
          recitsArtistiques: recitsArtistiques.sort((a, b) => b.date - a.date)
        }))
        .sort((a, b) => b.count - a.count);

      setGenres(formattedGenres);
    }
  }, [recitsArtistiques, loading]);

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