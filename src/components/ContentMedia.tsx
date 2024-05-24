import { ContentMediaCard } from './ContentMediaCard';
import { Scrollbar } from './Scrollbar';
import { motion, Variants } from 'framer-motion';
import React from 'react';

interface ContentMediaProps {
  numberOfCards: number;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 12 } },
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const ContentMedia: React.FC<ContentMediaProps> = ({ numberOfCards }) => {
  const cards = [];

  for (let i = 0; i < numberOfCards; i++) {
    cards.push(
      <motion.div key={i} variants={itemVariants}>
        <ContentMediaCard title={`Card ${i + 1}`} author={`Content for card ${i + 1}`} year={1222} />
      </motion.div>,
    );
  }

  return (
    <div className='w-full lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] h-[450px]'>
      <Scrollbar>
        <motion.div className='flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
          {cards}
        </motion.div>
      </Scrollbar>
    </div>
  );
};
