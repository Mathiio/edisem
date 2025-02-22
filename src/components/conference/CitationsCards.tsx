import React, { useState } from 'react';
import { Button, Skeleton } from '@heroui/react';
import { FileIcon } from '@/components/utils/icons';
import { AnnotationDropdown } from './AnnotationDropdown';

interface CitationCardProps {
  startTime: number;
  endTime: number;
  actant: any;
  citation: string;
  onTimeChange: (time: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ startTime, endTime, actant, citation, onTimeChange }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = secs.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const handleClick = () => {
    onTimeChange(startTime);
  };

  return (
    <div className='w-full flex flex-row justify-start border-2  border-c3 rounded-12 items-start gap-10 transition-transform-colors-opacity'>
      <div className='py-25 pl-25'>
        <div className='w-full flex justify-start items-center gap-10'>
          <Button
            onClick={handleClick}
            className='px-10 py-5 h-auto text-16 rounded-6 text-c6 hover:text-c6 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'>
            {formatTime(startTime) + ' - ' + formatTime(endTime)}
          </Button>
          <h3 className='text-c6 text-16 font-medium'>{actant}</h3>
        </div>
        <p
          className='text-16 text-c4 font-extralight transition-all ease-in-out duration-200'
          style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
          {citation}
        </p>
        <p
          className='text-16 text-c5 font-semibold cursor-pointer transition-all ease-in-out duration-200'
          onClick={toggleExpansion}>
          {expanded ? 'affichez moins' : '...affichez plus'}
        </p>
      </div>
      <div className='flex flex-col h-full py-25 pr-25'>
        <AnnotationDropdown content={citation} actant={actant} type='Citation' />
      </div>
    </div>
  );
};

export const CitationSkeleton: React.FC = () => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 bg-c3 items-start p-10 gap-5 transition-transform-colors-opacity'>
      <div className='w-full flex justify-start items-center gap-10'>
        <Skeleton className='w-[55%] rounded-6'>
          <p className='text-16'>_</p>
        </Skeleton>
      </div>
      <Skeleton className='w-full rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
      <Skeleton className='w-full rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
      <Skeleton className='w-full rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
      <Skeleton className='w-full rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
      <Skeleton className='w-full rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
      <Skeleton className='w-full rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
      <Skeleton className='w-[30%] rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
    </div>
  );
};

interface CitationsProps {
  citations: { citation: string; actant: any; startTime: number; endTime: number }[];
  loading: boolean;
  onTimeChange: (time: number) => void;
}

export const Citations: React.FC<CitationsProps> = ({ citations, loading, onTimeChange }) => {
  return (
    <div className='w-full lg:h-[550px] xl:h-[600px] overflow-hidden flex flex-col gap-20'>
      <div className='flex flex-col gap-20 h-full overflow-y-auto'>
        {loading ? (
          Array.from({ length: 8 }).map((_) => <CitationSkeleton />)
        ) : citations.length === 0 ? (
          <UnloadedCard />
        ) : (
          citations.map((citation, index) => (
            <CitationCard
              key={index}
              startTime={citation.startTime}
              endTime={citation.endTime}
              actant={citation.actant.firstname + ' ' + citation.actant.lastname}
              citation={citation.citation}
              onTimeChange={onTimeChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px] sm:h-[450px] flex flex-col justify-center items-center gap-20'>
      <FileIcon size={42} className='text-200' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-c5 text-32 font-semibold'>Oups !</h2>
        <p className='text-c5 text-16 text-regular text-center'>
          Aucune citation n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres
          sections de notre site.
        </p>
      </div>
    </div>
  );
};
