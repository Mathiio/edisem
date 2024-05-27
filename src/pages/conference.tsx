import React from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { VideoInfos } from '@/components/conference/VideoInfos';
import { ContentTab } from '@/components/conference/ContentTab';
import { Carousel } from '@/components/conference/Carousel';
import { Scrollbar } from '@/components/Utils/Scrollbar';
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
            <VideoInfos />
          </motion.div>
          <motion.div className='col-span-10 lg:col-span-4 flex flex-col gap-50' variants={itemVariants}>
            <ContentTab />
            <Carousel />
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
