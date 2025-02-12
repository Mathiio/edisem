import React, { ReactNode } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Footer } from '@/components/utils/Footer';
import { motion, Variants } from 'framer-motion';
import clsx from 'clsx';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

interface LayoutsProps {
  children: ReactNode;
  className?: string;
}

export const Layouts: React.FC<LayoutsProps> = ({ children, className }) => {
  return (
    <div className='relative bg-c1'>
      <motion.main
        className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'
        initial='hidden'
        animate='visible'
        variants={containerVariants}
      >
        <motion.div className='col-span-10' variants={itemVariants}>
          <Navbar />
        </motion.div>

        <motion.div className={className} variants={itemVariants}>
          {children}
        </motion.div>

        <motion.div className='col-span-10' variants={itemVariants}>
          <Footer />
        </motion.div>
      </motion.main>
    </div>
  );
};

/*
    <div className='relative bg-c1 h-screen'>
      <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200 scroll-y-auto'></main>
      */