import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 10 } },
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

interface SearchHelperProps {
  items: any[];
}

export const SearchHelper: React.FC<SearchHelperProps> = ({ items }) => {
  console.log(items);
  return (
    <motion.div className='w-full flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div
        variants={itemVariants}
        className='cursor-pointer flex flex-col bg-default-200 hover:bg-default-300 p-25 rounded-8 gap-10 transition-all ease-in-out duration-200'></motion.div>
    </motion.div>
  );
};

export const SearchHelperSkeleton: React.FC = () => {
  return (
    <div className='flex w-full p-20 bg-default-200 rounded-14'>
      <div className='flex w-full flex-col gap-10'>
        <Skeleton className='w-[35%] rounded-8'>
          <p className='font-semibold text-14'>_</p>
        </Skeleton>
        <div className='flex flex-col gap-5'>
          <Skeleton className='w-[100%] rounded-8'>
            <p className='font-semibold text-14'>_</p>
          </Skeleton>
          <Skeleton className='w-[100%] rounded-8'>
            <p className='font-semibold text-14'>_</p>
          </Skeleton>
          <Skeleton className='w-[100%] rounded-8'>
            <p className='font-semibold text-14'>_</p>
          </Skeleton>
          <Skeleton className='w-[100%] rounded-8'>
            <p className='font-semibold text-14'>_</p>
          </Skeleton>
        </div>
        <Skeleton className='w-[20%] rounded-8'>
          <p className='font-semibold text-14'>_</p>
        </Skeleton>
      </div>
    </div>
  );
};
