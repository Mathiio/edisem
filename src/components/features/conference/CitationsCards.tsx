import React, { useState } from 'react';
import { Button, Skeleton } from '@heroui/react';
import { FileIcon } from '@/components/utils/icons';
import { AnnotationDropdown } from './AnnotationDropdown';

interface CitationCardProps {
  startTime: number;
  endTime: number;
  actant: any;
  id: number;
  citation: string;
  onTimeChange: (time: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  id,
  startTime,
  endTime,
  actant,
  citation,
  onTimeChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const CHARACTER_LIMIT = 350;
  const shouldTruncate = citation.length > CHARACTER_LIMIT;

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
    onTimeChange(startTime);
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const displayText = expanded ? citation : citation.slice(0, CHARACTER_LIMIT);

  return (
    <div className='w-full flex flex-row justify-start border-2 p-25 border-c3 rounded-12 items-start gap-10 transition-transform-colors-opacity'>
      <div className='flex flex-col gap-25'>
        <div className='w-full flex justify-between items-center gap-10'>
          <div className='flex flex-row gap-10'>
            <Button
              onClick={handleClick}
              className='px-10 py-5 h-auto text-16 rounded-6 text-c6 hover:text-c6 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'>
              {formatTime(startTime) + ' - ' + formatTime(endTime)}
            </Button>
            <h3 className='text-c6 text-16 font-medium'>{actant}</h3>
          </div>

          <AnnotationDropdown id={id} content={citation} actant={actant} type='Citation' />
        </div>

        <div className='text-16 text-c4 font-extralight transition-all ease-in-out duration-200'>
          {displayText}
          {shouldTruncate && (
            <div className='mt-2 w-full flex justify-start'>
              <button
                onClick={toggleExpansion}
                className='text-16 text-c6 font-semibold cursor-pointer transition-all ease-in-out duration-200'>
                {expanded ? 'afficher moins' : '...afficher plus'}
              </button>
            </div>
          )}
        </div>
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
  citations: { id: number; citation: string; actant: any; startTime: number; endTime: number }[];
  loading: boolean;
  onTimeChange: (time: number) => void;
}

export const Citations: React.FC<CitationsProps> = ({ citations, loading, onTimeChange }) => {
  return (
    <div className='w-full h-max flex flex-col gap-20'>
      <div className='flex flex-col gap-20 h-full overflow-y-auto scroll-container'>
        {loading ? (
          Array.from({ length: 8 }).map((_) => <CitationSkeleton />)
        ) : citations.length === 0 ? (
          <UnloadedCard />
        ) : (
          citations.map((citation, index) => (
            <CitationCard
              key={index}
              id={citation.id}
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
    <div className='w-full h-full flex flex-col justify-center items-center gap-20 mt-50'>
      <FileIcon size={42} className='text-c6' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-c6 text-32 font-semibold'>Oups !</h2>
        <p className='text-c5 text-16 text-regular text-center'>
          Aucune citation n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres
          sections de notre site.
        </p>
      </div>
    </div>
  );
};
