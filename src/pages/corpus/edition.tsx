import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConfByEdition } from '@/services/api';
import { getActants } from '@/services/Items';
import { LgConfCard, LgConfSkeleton } from '@/components/ui/ConfCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';
import { Conference, Actant } from '@/types/ui';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

export const Edition: React.FC = () => {
  const { id, title } = useParams<{ id: string; title?: string }>();
  const [conf, setConf] = useState<Conference[]>([]);
  const [loadingConf, setLoadingConf] = useState(true);
  const dataFetchedRef = useRef(false);

  const formatTitle = (urlTitle?: string): string => {
    if (!urlTitle) return '';

    return urlTitle
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
              return await getActants(actantId);
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
    if (dataFetchedRef.current) {
      return;
    }
    fetchConf();
  }, [fetchConf]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <div className='gap-25 flex flex-col'>
        <h2 className='text-24 font-medium text-c6'>Conférences de {formatTitle(title)}</h2>
        <div className='grid grid-cols-4 grid-rows-3 gap-25'>
          {loadingConf
            ? Array.from({ length: 12 }).map((_, index) => <LgConfSkeleton key={index} />)
            : conf.map((conference, index) => (
                <motion.div initial='hidden' animate='visible' variants={fadeIn} key={conference.id} custom={index}>
                  <LgConfCard {...conference} />
                </motion.div>
              ))}
        </div>
      </div>
    </Layouts>
  );
};
