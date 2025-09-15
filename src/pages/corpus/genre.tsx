import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getOeuvres, getActants, getStudents } from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';
import { OeuvreCard } from '@/components/features/oeuvres/OeuvresCards';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

interface Oeuvre {
  id: string;
  title: string;
  description: string;
  date: string;
  abstract: string;
  genre: Array<{ id: string; name: string }>;
  thumbnail: string;
  enrichedActants: any[];
  primaryActant: any;
  [key: string]: any;
}

export const GenreDetail: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [genreName, setGenreName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const dataFetchedRef = useRef(false);

    const formatSlug = (urlSlug?: string): string => {
    if (!urlSlug) return '';
    
    return urlSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

  const enrichOeuvresWithActants = async (oeuvres: any[]) => {
    try {
      const [actants, students] = await Promise.all([getActants(), getStudents()]);
      
      // Créer les maps des actants et students
      const actantMap = new Map();
      actants.forEach((actant: any) => {
        actantMap.set(actant.id, actant);
        actantMap.set(String(actant.id), actant);
        actantMap.set(Number(actant.id), actant);
      });

      const studentMap = new Map();
      students.forEach((student: any) => {
        studentMap.set(student.id, student);
        studentMap.set(String(student.id), student);
        studentMap.set(Number(student.id), student);
      });

      // Enrichir chaque œuvre
      return oeuvres.map((oeuvre: any) => {
        let enrichedActants = [];

        if (oeuvre.actants && Array.isArray(oeuvre.actants)) {
          enrichedActants = oeuvre.actants
            .map((actant: any) => {
              if (typeof actant === 'string' && !/^\d{5}$/.test(actant)) {
                return { displayName: actant };
              }

              const actantId = actant;
              return (
                actantMap.get(actantId) ||
                actantMap.get(Number(actantId)) ||
                actantMap.get(String(actantId)) ||
                studentMap.get(actantId) ||
                studentMap.get(Number(actantId)) ||
                studentMap.get(String(actantId)) ||
                null
              );
            })
            .filter(Boolean);
        }

        return {
          ...oeuvre,
          enrichedActants,
          primaryActant: enrichedActants.length > 0 ? enrichedActants[0] : null,
        };
      });
    } catch (error) {
      console.error('Erreur lors de l\'enrichissement des œuvres:', error);
      return oeuvres;
    }
  };

  const fetchOeuvresByGenre = useCallback(async () => {
    if (dataFetchedRef.current || !id) return;
    dataFetchedRef.current = true;

    try {
      setLoading(true);
      
      // Récupérer toutes les œuvres
      const allOeuvres = await getOeuvres();
      
      if (!Array.isArray(allOeuvres) || allOeuvres.length === 0) {
        setOeuvres([]);
        return;
      }

      // Filtrer les œuvres par genre
      const filteredOeuvres = allOeuvres.filter((oeuvre: any) => {
        if (!oeuvre.genre || !Array.isArray(oeuvre.genre)) return false;
        
        return oeuvre.genre.some((genreItem: any) => genreItem.id === id);
      });

      // Récupérer le nom du genre à partir de la première œuvre trouvée
      if (filteredOeuvres.length > 0) {
        const genre = filteredOeuvres[0].genre.find((g: any) => g.id === id);
        if (genre) {
          setGenreName(genre.name);
        }
      }

      // Si on n'a pas trouvé le nom via les œuvres, utiliser le slug
      if (!genreName && slug) {
        setGenreName(formatSlug(slug));
      }

      // Enrichir avec les données des actants
      const enrichedOeuvres = await enrichOeuvresWithActants(filteredOeuvres);
      
      // Trier par date décroissante
      const sortedOeuvres = enrichedOeuvres.sort((a: any, b: any) => {
        const dateA = parseInt(a.date) || 0;
        const dateB = parseInt(b.date) || 0;
        return dateB - dateA;
      });

      setOeuvres(sortedOeuvres);
      
      console.log(`Œuvres trouvées pour le genre "${genreName}":`, sortedOeuvres.length);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des œuvres par genre:', error);
      setOeuvres([]);
    } finally {
      setLoading(false);
    }
  }, [id, slug, genreName]);

  useEffect(() => {
    if (!dataFetchedRef.current) {
      fetchOeuvresByGenre();
    }
  }, [fetchOeuvresByGenre]);

  // Utiliser le slug formaté si on n'a pas encore le nom du genre
  const displayTitle = genreName || formatSlug(slug) || 'Genre';

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <div className='gap-25 flex flex-col'>
        <div className='flex flex-col gap-15'>
          <h1 className='text-40 font-semibold text-c6'>{displayTitle}</h1>
          <p className='text-18 text-c4'>
            {loading ? 'Chargement...' : `${oeuvres.length} ${oeuvres.length === 1 ? 'œuvre' : 'œuvres'}`}
          </p>
        </div>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-25'>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <div key={index} />)
            : oeuvres.map((oeuvre, index) => (
                <motion.div 
                  initial='hidden' 
                  animate='visible' 
                  variants={fadeIn} 
                  key={oeuvre.id} 
                  custom={index}
                >
                  <OeuvreCard id={oeuvre.id} title={oeuvre.title} date={oeuvre.date} thumbnail={oeuvre.thumbnail} acteurs={oeuvre.enrichedActants}/>
                </motion.div>
              ))}
        </div>

        {!loading && oeuvres.length === 0 && (
          <div className='flex flex-col items-center justify-center py-100 gap-20'>
            <div className='text-60 opacity-20'>🎭</div>
            <div className='flex flex-col gap-10 text-center'>
              <h3 className='text-24 font-medium text-c6'>Aucune œuvre trouvée</h3>
              <p className='text-16 text-c4'>
                Il n'y a pas encore d'œuvres dans la catégorie "{displayTitle}".
              </p>
            </div>
          </div>
        )}
      </div>
    </Layouts>
  );
};
