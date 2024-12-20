import React, { useState } from 'react';
import { Skeleton } from "@nextui-org/react";
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



type ConfDetailsProps = {
    edition: string;
    description: string;
    date: string;
};



export const ConfDetailsCard: React.FC<ConfDetailsProps> = ({ edition, description, date }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const toggleExpansion = () => {
        setExpanded(!expanded);
    };

    function formatDate(dateString: string) {
        const mois = [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"
        ];
        const dateParts = dateString.split("-");
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1], 10) - 1; 
        const day = parseInt(dateParts[2], 10);
        const formattedDate = `${day} ${mois[monthIndex]} ${year}`;
        
        return formattedDate;
    }

  return (
    <motion.div className='w-full flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div
        variants={itemVariants}
        className='cursor-pointer flex flex-col bg-default-100 hover:bg-default-200 p-25 rounded-8 gap-10 transition-all ease-in-out duration-200'
        onClick={toggleExpansion}>
        <h3 className='text-16 text-default-500 font-semibold'>{formatDate(date) + " - " + edition}</h3>
        <p
          className='text-16 text-default-500 font-regular transition-all ease-in-out duration-200 gap-10'
          style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
          {description}
        </p>
        <p className='text-16 text-default-600 font-semibold transition-all ease-in-out duration-200'>
          {expanded ? 'affichez moins' : '...affichez plus'}
        </p>
      </motion.div>
    </motion.div>
  );
};



export const ConfDetailsSkeleton: React.FC = () => {
  return (
    <div className="flex w-full p-20 bg-default-200 rounded-14">
        <div className="flex w-full flex-col gap-10">
            <Skeleton className="w-[35%] rounded-8">
                <p className="font-semibold text-14">_</p>
            </Skeleton>
            <div className="flex flex-col gap-5">
                <Skeleton className="w-[100%] rounded-8">
                    <p className="font-semibold text-14">_</p>
                </Skeleton>
                <Skeleton className="w-[100%] rounded-8">
                    <p className="font-semibold text-14">_</p>
                </Skeleton>
                <Skeleton className="w-[100%] rounded-8">
                    <p className="font-semibold text-14">_</p>
                </Skeleton>
                <Skeleton className="w-[100%] rounded-8">
                    <p className="font-semibold text-14">_</p>
                </Skeleton>
            </div>
            <Skeleton className="w-[20%] rounded-8">
                <p className="font-semibold text-14">_</p>
            </Skeleton>
        </div>
    </div>
  );
};