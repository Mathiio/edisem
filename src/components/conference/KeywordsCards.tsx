import React from 'react';
import { Skeleton } from "@heroui/react";
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
    <motion.div variants={itemVariants} className='border-2 border-c3 h-full rounded-8 flex items-center justify-start p-10'>
        <p className='text-14 text-c4 font-extralight'>{word}</p>
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


