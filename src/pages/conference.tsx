import React, {useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConference } from '../services/api';
import { Navbar } from '@/components/Navbar/Navbar';
import { VideoInfos } from '@/components/conference/VideoInfos';
import { ContentTab } from '@/components/conference/ContentTab';
import { Scrollbar } from '@/components/utils/Scrollbar';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delays the appearance of each child by 0.3 seconds
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

export const Conference: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [conference, setConference] = useState<{ title: string, description: string, actant: string, date: string, url: string, fullUrl: string }[]>([]);
  const [loadingConference, setLoadingConference] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    const fetchConference = async () => {
      const conference = await getConference(Number(id));
      setConference(conference);
      setLoadingConference(false);
    };

    if (firstRender.current) {
      firstRender.current = false;
    } else {
      fetchConference();
    }
  }, []);

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <motion.main
          className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'
          initial='hidden'
          animate='visible'
          variants={containerVariants}>
          <motion.div className='col-span-10' variants={itemVariants}>
            <Navbar />
          </motion.div>
          <motion.div className='col-span-10 lg:col-span-6 flex flex-col gap-50' variants={itemVariants}>
          {loadingConference ? "" : <VideoInfos title={conference[0].title} description={conference[0].description} actant={conference[0].actant} date={conference[0].date} url={conference[0].url} fullUrl={conference[0].fullUrl}/>}
          </motion.div>
          <motion.div className='col-span-10 lg:col-span-4 flex flex-col gap-50' variants={itemVariants}>
            <ContentTab />
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
