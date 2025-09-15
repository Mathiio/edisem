import React, { useState } from 'react';
import { Skeleton } from '@heroui/react';
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

type RecitiaDetailsProps = {
  description: string;
  date: string;
  credits?: string[];
  genre?: string;
  medium?: string;
  actants?: any[];
};

export const RecitiaDetailsCard: React.FC<RecitiaDetailsProps> = ({ description, date, credits, genre, medium, actants }) => {
  console.log(genre)
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <motion.div className='w-full flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div
        variants={itemVariants}
        className='cursor-pointer flex flex-col bg-c2 hover:bg-c3 p-25 rounded-8 gap-10 transition-all ease-in-out duration-200'
        onClick={toggleExpansion}>
        <h3 className='text-16 text-c5 font-medium'>{date}</h3>

        {genre && <p className='text-16 text-c6 font-semibold'>Genre : {genre}</p>}

        {medium && <p className='text-16 text-c6 font-semibold'>Support : {medium}</p>}

        {credits && credits.length > 0 && (
          <p className='text-16  text-c4  transition-all ease-in-out duration-200 gap-10' style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
            Crédits :{' '}
            {credits
              .map((credit: any) => {
                if (typeof credit === 'string') return credit;
                if (credit.name) return credit.name;
                if (credit.firstName && credit.lastName) return `${credit.firstName} ${credit.lastName}`;
                return 'test';
              })
              .join(', ')}
          </p>
        )}
        {description && (
          <p
            className='text-16 text-c6 font-semibold transition-all ease-in-out duration-200 gap-10'
            style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
            {description}
          </p>
        )}
        {actants && actants.length > 0 && (
          <p className='text-14 text-end text-c4 italic  transition-all ease-in-out duration-200'>Ajouté par : {actants.map((actant: any) => actant.name).join(', ')}</p>
        )}
        {description && <p className='text-16 text-c5 font-semibold transition-all ease-in-out duration-200'>{expanded ? 'affichez moins' : '...affichez plus'}</p>}
      </motion.div>
    </motion.div>
  );
};

export const RecitiaDetailsSkeleton: React.FC = () => {
  return (
    <div className='flex w-full p-20 bg-c3 rounded-14'>
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
