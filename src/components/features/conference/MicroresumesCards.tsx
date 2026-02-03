import React, { useState } from 'react';
import { Button, Link, Skeleton } from '@heroui/react';
import { FileIcon } from '@/components/ui/icons';

import { motion, Variants } from 'framer-motion';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

interface MicroresumeCardProps {
  id: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  outil: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
  };
  onTimeChange: (time: number) => void;
}

export const MicroresumeCard: React.FC<MicroresumeCardProps> = ({ title, description, startTime, endTime, outil, onTimeChange }) => {
  const [expanded, setExpanded] = useState(false);
  const CHARACTER_LIMIT = 350;
  const shouldTruncate = description.length > CHARACTER_LIMIT;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = secs.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const handleClick = () => {
    // Convertir en nombre si nécessaire
    const time = typeof startTime === 'string' ? parseInt(startTime, 10) : startTime;

    onTimeChange(time);
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const displayText = expanded ? description : description.slice(0, CHARACTER_LIMIT);

  return (
    <div className='w-full flex flex-row justify-start border-2 p-25 border-c3 rounded-12 items-start gap-10 transition-transform-colors-opacity'>
      <div className='flex flex-col gap-25'>
        <div className='w-full flex justify-between items-center gap-10'>
          <div className='flex flex-row gap-10'>
            <Button onClick={handleClick} className='px-10 py-5 h-auto text-16 rounded-6 text-c6 hover:text-c6 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'>
              {formatTime(startTime) + ' - ' + formatTime(endTime)}
            </Button>
            <h3 className='text-c6 text-16 font-medium'>{title}</h3>
          </div>
        </div>

        <div className='text-16 text-c4 font-extralight transition-all ease-in-out duration-200'>
          {displayText}
          {shouldTruncate && (
            <div className='mt-2 w-full flex justify-start'>
              <button onClick={toggleExpansion} className='text-16 text-c6 font-semibold cursor-pointer transition-all ease-in-out duration-200'>
                {expanded ? 'afficher moins' : '...afficher plus'}
              </button>
            </div>
          )}
        </div>
        <div className='w-full flex flex-row justify-start items-center gap-10'>
          <Link
            href={'/corpus/tool/' + outil.id}
            className='p-2 w-fit flex flex-row border-2 border-c3 hover:border-c6 transition-all ease-in-out duration-200 rounded-8 items-center gap-10'>
            <img src={outil.thumbnail} alt={outil.title} className='w-50 object-cover rounded-[4px]' />
            <p className='text-16 text-c6'>{outil.title}</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const MicroresumeSkeleton: React.FC = () => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 bg-c3 items-start p-10 gap-5 transition-transform-colors-opacity'>
      <div className='w-full flex justify-start items-center gap-10'>
        <Skeleton className='w-[55%] h-4 rounded-6' />
      </div>
      <Skeleton className='w-full h-4 rounded-6' />
      <Skeleton className='w-full h-4 rounded-6' />
      <Skeleton className='w-full h-4 rounded-6' />
      <Skeleton className='w-full h-4 rounded-6' />
      <Skeleton className='w-full h-4 rounded-6' />
      <Skeleton className='w-full h-4 rounded-6' />
      <Skeleton className='w-[30%] h-4 rounded-6' />
    </div>
  );
};

interface MicroresumesProps {
  microresumes: {
    id: number;
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    outil: { id: string; title: string; description: string; thumbnail: string };
  }[];
  loading: boolean;
  onTimeChange: (time: number) => void;
}

export const Microresumes: React.FC<MicroresumesProps> = ({ microresumes, loading, onTimeChange }) => {
  // Si pas de microresumes et pas en chargement, ne rien afficher (cacher la vue)
  if (!loading && (!microresumes || microresumes.length === 0)) {
    return null;
  }

  return (
    <div className='w-full h-max flex flex-col gap-20'>
      <div className='flex flex-col gap-20 h-full overflow-y-auto scroll-container'>
        {loading
          ? Array.from({ length: 8 }).map((_) => <MicroresumeSkeleton />)
          : microresumes.map((microresume, index) => (
              <motion.div key={microresume.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                <MicroresumeCard
                  key={index}
                  id={microresume.id}
                  startTime={microresume.startTime}
                  endTime={microresume.endTime}
                  title={microresume.title}
                  description={microresume.description}
                  outil={microresume.outil}
                  onTimeChange={onTimeChange}
                />
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center gap-20 mt-50'>
      <FileIcon size={42} className='text-c6' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-c6 text-32 font-semibold'>Oups !</h2>
        <p className='text-c5 text-16 text-regular text-center'>
          Aucune citation n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres sections de notre site.
        </p>
      </div>
    </div>
  );
};
