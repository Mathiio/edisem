import React from 'react';
import { Button, Skeleton } from '@nextui-org/react';
import { FileIcon } from '@/components/utils/icons';

interface CitationCardProps {
  startTime: number;
  endTime: number;
  actant: any;
  citation: string;
  onTimeChange: (time: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ startTime, endTime, actant, citation, onTimeChange }) => {
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
    <div className='w-full flex flex-col justify-start rounded-12 items-start gap-5 transition-transform-colors-opacity'>
      <div className='w-full flex justify-start items-center gap-10'>
        <Button
          onClick={handleClick}
          className='p-5 text-16 rounded-6 text-default-500 hover:text-default-500 bg-default-200 hover:bg-default-300 transition-all ease-in-out duration-200'>
          {formatTime(startTime) + ' - ' + formatTime(endTime)}
        </Button>
        <h3 className='text-default-500 text-16 font-semibold'>{actant}</h3>
      </div>
      <p className='text-default-400 text-16'>{citation}</p>
    </div>
  );
};

export const CitationSkeleton: React.FC = () => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 bg-default-200 items-start p-10 gap-5 transition-transform-colors-opacity'>
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
    <div className='w-full lg:h-[700px] xl:h-[750px]  overflow-hidden flex flex-col gap-20'>
      <div className='flex flex-col gap-20 scroll-y-auto'>
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
      <FileIcon size={42} className='text-default-200' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-default-400 text-32 font-semibold'>Oups !</h2>
        <p className='text-default-400 text-16 text-regular text-center'>
          Aucune citation n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres
          sections de notre site.
        </p>
      </div>
    </div>
  );
};
