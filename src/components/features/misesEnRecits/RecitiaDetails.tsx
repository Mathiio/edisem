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
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  // Check if there's any content to display
  const hasContent =
    date ||
    genre ||
    medium ||
    (credits && credits.length > 0) ||
    description ||
    (Array.isArray(actants) && actants.length > 0);

  // Don't render if there's no content
  if (!hasContent) {
    return null;
  }

  return (
    <motion.div className='w-full flex flex-col gap-6' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div
        variants={itemVariants}
        className='cursor-pointer flex flex-col bg-c2 hover:bg-c3 p-6 rounded-lg gap-2.5 transition-all ease-in-out duration-200'
        onClick={toggleExpansion}>
        <h3 className='text-base text-c5 font-medium'>{date}</h3>

        {genre && <p className='text-base text-c6 font-medium'>Genre : {genre}</p>}

        {medium && <p className='text-base text-c6 font-medium'>Support : {medium}</p>}

        {credits && credits.length > 0 && (
          <p
            className={`text-base  text-c4  transition-all ease-in-out duration-200 gap-2.5 ${expanded ? '' : 'line-clamp-3'}`}
            style={{ lineHeight: '120%' }}>
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
            className={`text-base text-c6 font-medium transition-all ease-in-out duration-200 gap-2.5 ${expanded ? '' : 'line-clamp-3'}`}
            style={{ lineHeight: '120%' }}
            dangerouslySetInnerHTML={{ __html: description }}></p>
        )}
        {Array.isArray(actants) && actants.length > 0 && (
          <p className='text-sm text-end text-c4 italic  transition-all ease-in-out duration-200'>Ajouté par : {actants.map((actant: any) => actant.name).join(', ')}</p>
        )}
        {description && <p className='text-base text-c5 font-medium transition-all ease-in-out duration-200'>{expanded ? 'affichez moins' : '...affichez plus'}</p>}
      </motion.div>
    </motion.div>
  );
};

export const RecitiaDetailsSkeleton: React.FC = () => {
  return (
    <div className='flex w-full p-5 bg-c3 rounded-xl'>
      <div className='flex w-full flex-col gap-2.5'>
        <Skeleton className='w-[35%] h-4 rounded-lg' />
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='w-full h-4 rounded-lg' />
          <Skeleton className='w-full h-4 rounded-lg' />
          <Skeleton className='w-full h-4 rounded-lg' />
          <Skeleton className='w-full h-4 rounded-lg' />
        </div>
        <Skeleton className='w-[20%] h-4 rounded-lg' />
      </div>
    </div>
  );
};
