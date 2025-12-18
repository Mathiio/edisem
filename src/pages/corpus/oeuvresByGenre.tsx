import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as Items from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';
import { OeuvreCard } from '@/components/features/oeuvres/OeuvresCards';
import { slugUtils } from '@/lib/utils';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

export const GenreDetail: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [recitsArtistiques, setOeuvres] = useState<any[]>([]);
  const [genreName, setGenreName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const fetchOeuvresByGenre = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);

      // Get all works (already normalized in the service)
      const allOeuvres = await Items.getRecitsArtistiques();

      if (!Array.isArray(allOeuvres) || allOeuvres.length === 0) {
        console.warn('⚠️ No recitsArtistiques found');
        setOeuvres([]);
        return;
      }

      // Filter by genre (slug)
      const filteredOeuvres = allOeuvres.filter((oeuvre: any) => {
        // Handle simple or array genre
        const genres = Array.isArray(oeuvre.genre) ? oeuvre.genre : [oeuvre.genre];
        return genres.some((g: any) => {
          const genreStr = typeof g === 'string' ? g : g?.title || g?.name || '';
          return slugUtils.matches(genreStr, slug);
        });
      });

      // Extract genre name
      if (filteredOeuvres.length > 0) {
        const firstGenre = Array.isArray(filteredOeuvres[0].genre)
          ? filteredOeuvres[0].genre[0]
          : filteredOeuvres[0].genre;
        const genreTitle = typeof firstGenre === 'string' ? firstGenre : firstGenre?.title || firstGenre?.name || '';
        setGenreName(genreTitle || slugUtils.toTitle(slug));
      } else {
        setGenreName(slugUtils.toTitle(slug));
      }

      // Sort by date (newest first)
      const sortedOeuvres = filteredOeuvres.sort((a: any, b: any) => {
        const dateA = parseInt(a.date) || 0;
        const dateB = parseInt(b.date) || 0;
        return dateB - dateA;
      });

      setOeuvres(sortedOeuvres);
    } catch (error) {
      console.error('❌ Error fetching recitsArtistiques by genre:', error);
      setOeuvres([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchOeuvresByGenre();
  }, [fetchOeuvresByGenre]);

  const displayTitle = genreName || slugUtils.toTitle(slug || '') || 'Genre';

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      {/* Header section */}
      <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
        <div className='gap-10 justify-between flex items-center flex-col'>
          {/* Title and description */}
          <h1 className='z-[12] text-64 text-c6 font-medium flex text-center flex-col items-center max-w-[850px]'>
            {displayTitle}
          </h1>
          <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>
            Découvrez les {recitsArtistiques.length} {recitsArtistiques.length === 1 ? 'œuvre' : 'œuvres'} en lien avec ce thème
          </p>
          {/* Background ellipse */}
          <motion.div
            className='top-[-50px] absolute z-[-1]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
          >
            <div className='opacity-20 dark:opacity-30'>
              <BackgroundEllipse />
            </div>
          </motion.div>
        </div>
      </div>
      {/* Oeuvres grid */}
      <div className='grid grid-cols-4 grid-rows-auto gap-20'>
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <div key={index} />)
          : recitsArtistiques.map((oeuvre, index) => (
            <motion.div initial='hidden' animate='visible' variants={fadeIn} key={oeuvre.id} custom={index}>
              <OeuvreCard {...oeuvre} />
            </motion.div>
          ))}
      </div>
      {/* No Oeuvres found message */}
      {!loading && recitsArtistiques.length === 0 && (
        <div className='flex flex-col items-center justify-center py-100 gap-20'>
          <div className='flex flex-col gap-10 text-center'>
            <h3 className='text-24 font-medium text-c6'>Aucune œuvre trouvée</h3>
            <p className='text-16 text-c4'>Il n'y a pas encore d'œuvres dans la catégorie "{displayTitle}".</p>
          </div>
        </div>
      )}
    </Layouts>
  );
};
