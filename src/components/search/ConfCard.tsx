import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@nextui-org/react';

function formatDate(dateString: string) {
  const mois = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const dateParts = dateString.split('-');
  const year = dateParts[0];
  const monthIndex = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const formattedDate = `${day} ${mois[monthIndex]} ${year}`;

  return formattedDate;
}

const getYouTubeThumbnailUrl = (ytb: string): string => {
  const videoId = ytb.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : '';
};

type LgConfCardProps = {
  id: number;
  title: string;
  actant: string;
  date: string;
  universite: string;
  url?: string;
};

export const ConfCard: React.FC<LgConfCardProps> = ({ id, title, actant, date, url, universite }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const thumbnailUrl = url ? getYouTubeThumbnailUrl(url) : '';

  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = () => {
    navigate(`/conference/${id}`);
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [title]);

  return (
    <div
      onClick={openConf}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer border-2 h-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${
        isHovered ? 'border-default-action' : 'border-default-300'
      }`}>
      <div className={`p-50 h-full w-300 rounded-12 justify-center items-center flex  ${
          thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-default-200 to-default-400'
        }`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-default-100 font-semibold text-default-selected ${thumbnailUrl ? 'invisible' : ''}`}>
          CONFÉRENCE
        </h3>
      </div>
      <div className='flex flex-col gap-5 w-full'>
        <div className='relative'>
          <p
            ref={textRef}
            className='text-16 text-default-600 font-bold overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-default-600'></span>}
        </div>
        <p className='text-16 text-default-500 font-regular'>
          {actant}
          <span className='text-14'> - {universite}</span>
        </p>
        <p className='text-14 text-default-500 font-regular'>{formatDate(date)}</p>
      </div>
    </div>
  );
};

export const ConfSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col gap-10'>
      <Skeleton className='p-50 w-full h-200 rounded-12 justify-center flex'>
        <p className='text-16'>_</p>
      </Skeleton>
      <div className='flex flex-col gap-5'>
        <Skeleton className='w-[90%] rounded-8'>
          <p className='text-16 text-default-600 font-semibold'>_</p>
          <p className='text-16 text-default-600 font-semibold'>_</p>
        </Skeleton>
        <Skeleton className='w-[60%] rounded-8'>
          <p className='text-16 text-default-500 font-regular'>_</p>
        </Skeleton>
        <Skeleton className='w-[40%] rounded-8'>
          <p className='text-14 text-default-500 font-regular'>_</p>
        </Skeleton>
      </div>
    </div>
  );
};
