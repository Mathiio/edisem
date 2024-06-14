import React from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { NavKeyWords } from '@/components/conference';
import { HighlightSection } from '@/components/home/HighlightSection';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { CarouselVideoHome, CarouselConferencierHome } from '@/components/home/CarouselHome';

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

export const Home: React.FC = () => {
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
          <motion.div className='col-span-10  flex flex-col gap-50' variants={itemVariants}>
            <NavKeyWords numberOfButtons={16} />
            <HighlightSection />
            <CarouselVideoHome widthCard={29} heightCard={170} titre='Derniers séminaires Arcanes' />
            <CarouselConferencierHome widthCard={22} heightCard={170} titre='Découvrez nos conférenciers' />
            <CarouselVideoHome widthCard={19} heightCard={150} titre='Séminaires de la session A22' />
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
