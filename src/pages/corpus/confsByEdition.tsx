import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Items from '@/services/Items';
import { ConfCard, ConfCardSkeleton } from '@/components/features/conference/ConfCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';
import { Conference, Edition as EditionType } from '@/types/ui';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { Skeleton } from '@heroui/react';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

export const Edition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [edition, setEdition] = useState<EditionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await Items.getEditionDetails(id);
        
        if (data) {
            setEdition(data.edition);
            setConferences(data.conferences || []);
        } else {
            console.error('Aucune donnée trouvée pour cette édition');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'édition:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
        <div className='gap-20 justify-between flex items-center flex-col'>
          {loading ?
            <>
              <Skeleton className='w-[850px] h-60 rounded-8' />
              <Skeleton className='w-[650px] h-60 rounded-8' />
            </>
          : 
            <h1 className='z-[12] text-64 text-c6 font-medium flex text-center flex-col items-center max-w-[850px]'>
            {edition?.title}
          </h1>
          }
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
        {loading
          ? Array.from({ length: 12 }).map((_, index) => <ConfCardSkeleton key={index} />)
          : conferences.length > 0 ? (
              conferences.map((conference, index) => (
                <motion.div initial='hidden' animate='visible' variants={fadeIn} key={conference.id} custom={index}>
                  <ConfCard {...conference} />
                </motion.div>
              ))
          ) : (
             <div className="col-span-4 text-center text-c5 py-20">Aucune conférence trouvée pour cette édition.</div>
          )
        }
      </div>
    </Layouts>
  );
};