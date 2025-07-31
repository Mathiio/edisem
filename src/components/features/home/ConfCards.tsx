import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';

function formatDate(dateString: string) {
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const dateParts = dateString.split('-');
  const year = dateParts[0];
  const monthIndex = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const formattedDate = `${day} ${mois[monthIndex]} ${year}`;

  return formattedDate;
}

const getYouTubeThumbnailUrl = (ytb: string): string => {
  const videoId = ytb.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : '';
};

type LgConfCardProps = {
  id: number;
  title: string;
  actant: string;
  date: string;
  universite: string;
  url?: string;
  type?: string;
  thumbnail?: string;
};

export const LgConfCard: React.FC<LgConfCardProps> = ({ id, title, actant, date, url, universite, type, thumbnail }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const thumbnailUrl = url ? getYouTubeThumbnailUrl(url) : thumbnail ? thumbnail : '';

  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = () => {
    navigate(`/${type ? type : 'conference'}/${id}`);
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
        ${isHovered ? 'bg-c2 scale-105' : 'scale-100'}`}></div>
      <div
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-c3 to-c4'}`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnailUrl ? 'invisible' : ''}`}>CONFÉRENCE</h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>
        <p className='text-16 text-c5 font-extralight'>
          {actant}
          <span className='text-14'> - {universite}</span>
        </p>
        <p className='text-14 text-c5 font-extralight'>{type === 'experimentation' ? date : formatDate(date)}</p>
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
          <p className='text-16 text-c6 font-semibold'>_</p>
          <p className='text-16 text-c6 font-semibold'>_</p>
        </Skeleton>
        <Skeleton className='w-[60%] rounded-8'>
          <p className='text-16 text-c6 font-regular'>_</p>
        </Skeleton>
        <Skeleton className='w-[40%] rounded-8'>
          <p className='text-14 text-c6 font-regular'>_</p>
        </Skeleton>
      </div>
    </div>
  );
};

type SmConfCardProps = {
  id: number;
  title: string;
  actant: string;
  url?: string;
};

export const SmConfCard: React.FC<SmConfCardProps> = ({ id, title, actant, url }) => {
  const [isHovered, setIsHovered] = useState(false);
  const thumbnailUrl = url ? getYouTubeThumbnailUrl(url) : '';

  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/conference/${id}`;
  };

  return (
    <div
      onClick={openConf}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='cursor-pointer flex flex-col gap-10 transition-all ease-in-out duration-200 relative'>
      <div
        className={`absolute w-full h-full rounded-12 transition-all ease-in-out duration-200 
        ${isHovered ? 'bg-c2 scale-105' : 'scale-100'}`}></div>
      <div
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-c3 to-c4'}`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnailUrl ? 'invisible' : ''}`}>CONFÉRENCE</h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden line-clamp-3'>
            {title}
          </p>
        </div>
        <p className='text-16 text-c5 font-extralight'>{actant}</p>
      </div>
    </div>
  );
};
