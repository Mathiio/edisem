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

export const LgConfCard: React.FC<LgConfCardProps> = ({ id, title, actant, date, url, universite }) => {
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
      className='cursor-pointer flex flex-col gap-10 transition-all ease-in-out duration-200 relative'>
      <div
        className={`absolute w-full h-full rounded-12 transition-all ease-in-out duration-200 
        ${isHovered ? 'bg-100 scale-105' : 'scale-100'}`}></div>
      <div
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${
          thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-200 to-400'
        }`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnailUrl ? 'invisible' : ''}`}>
          CONFÉRENCE
        </h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p
            ref={textRef}
            className='text-16 text-500 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-600'></span>}
        </div>
        <p className='text-16 text-400 font-extralight'>
          {actant}
          <span className='text-14'> - {universite}</span>
        </p>
        <p className='text-14 text-400 font-extralight'>{formatDate(date)}</p>
      </div>
    </div>
  );
};

export const LgConfSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col gap-10'>
      <Skeleton className='p-50 w-full h-200 rounded-12 justify-center flex'>
        <p className='text-16'>_</p>
      </Skeleton>
      <div className='flex flex-col gap-5'>
        <Skeleton className='w-[90%] rounded-8'>
          <p className='text-16 text-600 font-semibold'>_</p>
          <p className='text-16 text-600 font-semibold'>_</p>
        </Skeleton>
        <Skeleton className='w-[60%] rounded-8'>
          <p className='text-16 text-500 font-regular'>_</p>
        </Skeleton>
        <Skeleton className='w-[40%] rounded-8'>
          <p className='text-14 text-500 font-regular'>_</p>
        </Skeleton>
      </div>
    </div>
  );
};
