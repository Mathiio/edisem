import React from 'react';
import { motion } from 'framer-motion'; // Ajout du module motion
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { Navbar } from '@/components/Navbar/Navbar';

// Définissez vos variants si vous ne les avez pas encore définis
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const Datavisualisation: React.FC = () => {
  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <motion.main
          className='mx-auto max-w-screen-2xl w-full grid grid-cols-10 xl:gap-12 gap-6 p-6 transition-all ease-in-out duration-200'
          initial='hidden'
          animate='visible'
          variants={containerVariants}>
          <motion.div className='col-span-10' variants={itemVariants}>
            <Navbar />
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};

export default Datavisualisation;
