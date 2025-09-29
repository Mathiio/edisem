import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConfByEdition } from '@/services/api';
import * as Items from '@/services/Items';
import { LgConfCard, LgConfSkeleton } from '@/components/ui/ConfCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';
import { Conference, Actant, Edition as EditionType } from '@/types/ui';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

export const Edition: React.FC = () => {
  const { id } = useParams<{ id: string; title?: string }>();
  const [conf, setConf] = useState<Conference[]>([]);
  const [loadingConf, setLoadingConf] = useState(true);
  const [edition, setEdition] = useState<EditionType | null>(null);
  const dataFetchedRef = useRef(false);

  const fetchEdition = useCallback(async () => {
    if (!id) return;
    try {
      const editions = await Items.getEditions();
      const selectedEdition = editions.find((ed: EditionType) => ed.id === id);
      setEdition(selectedEdition || null);
    } catch (err) {
      console.error('Erreur lors de la récupération de l’édition :', err);
      setEdition(null);
    }
  }, [id]);

  // Helper pour enrichir les conférences avec les actants complets
  const enrichConferencesWithActants = async (conferences: any[]) => {
    const enrichedConferences = await Promise.all(
      conferences.map(async (conference) => {
        try {
          // Si actant est déjà un array d'objets, on le garde
          if (Array.isArray(conference.actant) && 
              conference.actant.length > 0 && 
              typeof conference.actant[0] === 'object' && 
              conference.actant[0].firstname) {
            return conference;
          }

          // Si actant est un array d'IDs ou une string d'IDs
          let actantIds: string[] = [];
          
          if (typeof conference.actant === 'string') {
            actantIds = conference.actant.includes(',') 
              ? conference.actant.split(',').map((id: string) => id.trim())
              : [conference.actant];
          } else if (Array.isArray(conference.actant)) {
            actantIds = conference.actant;
          }

          // Récupérer les données complètes des actants
          const actantPromises = actantIds.map(async (actantId: string) => {
            try {
              return await Items.getActants(actantId);
            } catch (error) {
              console.warn(`Failed to fetch actant ${actantId}:`, error);
              return null;
            }
          });

          const actants = (await Promise.all(actantPromises)).filter((actant): actant is Actant => actant !== null);

          return {
            ...conference,
            actant: actants
          };
        } catch (error) {
          console.error(`Error enriching conference ${conference.id}:`, error);
          return {
            ...conference,
            actant: []
          };
        }
      })
    );

    return enrichedConferences;
  };

  const fetchConf = useCallback(async () => {
    if (dataFetchedRef.current || !id) return;
    
    try {
      setLoadingConf(true);
      const conferences = await getConfByEdition(id);
      const enrichedConferences = await enrichConferencesWithActants(conferences);
      setConf(enrichedConferences);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setConf([]);
    } finally {
      setLoadingConf(false);
      dataFetchedRef.current = true;
    }
  }, [id]);

  useEffect(() => {
    fetchEdition();
    fetchConf();
  }, [fetchEdition, fetchConf]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
        <div className='gap-20 justify-between flex items-center flex-col'>
            <h1 className='z-[12] text-64 text-c6 font-medium flex text-center flex-col items-center max-w-[850px]'>
              {edition?.title}
            </h1>
            <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>
              {edition?.editionType ? edition.editionType.charAt(0).toUpperCase() + edition.editionType.slice(1) : ''} Edisem - Édition {edition?.season} {edition?.year}
            </p>
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
      <div className='grid grid-cols-4 grid-rows-3 gap-25'>
        {loadingConf
          ? Array.from({ length: 12 }).map((_, index) => <LgConfSkeleton key={index} />)
          : conf.map((conference, index) => (
              <motion.div initial='hidden' animate='visible' variants={fadeIn} key={conference.id} custom={index}>
                <LgConfCard {...conference} />
              </motion.div>
            ))}
      </div>
    </Layouts>
  );
};