import React from 'react';
import { Skeleton } from "@nextui-org/react";
import { motion, Variants } from 'framer-motion';


const itemVariants: Variants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 10 } },
};


type KeywordsCardProps = {
    id: number;
    word: string;
};


export const KeywordsCard: React.FC<KeywordsCardProps> = ({ word }) => {
  return (
    <motion.div variants={itemVariants} className='border-2 border-default-300 h-full rounded-8 flex items-center justify-start p-10'>
        <p className='font-regular text-default-500 text-14'>{word}</p>
    </motion.div>
  );
};



export const KeywordsSkeleton: React.FC = () => {
    return (
        <Skeleton className="w-[100%] rounded-8">
            <p className="w-[120px] font-semibold text-16 p-5">_</p>
        </Skeleton>
    );
  };


