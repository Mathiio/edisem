import { useEffect, useState, useRef, useCallback } from 'react';

import { useParams } from 'react-router-dom';
import { getConfByEdition } from '../../services/api';
import { LgConfCard, LgConfSkeleton } from '@/components/features/home/ConfCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';

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
  const [conf, setConf] = useState<any[]>([]);
  const [loadingConf, setLoadingConf] = useState(true);
  const dataFetchedRef = useRef(false);

  const formatTitle = (urlTitle?: string): string => {
    if (!urlTitle) return '';
    
    return urlTitle
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchConf = useCallback(async () => {
    if (dataFetchedRef.current) return;
    const conferences = await getConfByEdition(Number(id));
    setConf(conferences);
    setLoadingConf(false);
    dataFetchedRef.current = true;
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
