import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { buildConfsRoute, formatDate } from '@/lib/utils';
import { Conference } from '@/types/ui';


const getYouTubeThumbnailUrl = (ytb: string): string => {
  const videoId = ytb.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : '';
};



export const LgConfCard: React.FC<Conference> = (props) => {
  const conference = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const thumbnailUrl = conference.url ? getYouTubeThumbnailUrl(conference.url) : '';

  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = () => {
    const route = buildConfsRoute( conference.type, Number(conference.id));
    navigate(route);
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [conference.title]);

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
            {conference.title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>
        {conference.actant && (
          <p className='text-16 text-c5 font-extralight'>
            {conference.actant.firstname} {conference.actant.lastname}
            {conference.actant.universities && <span className='text-14'> - {conference.actant.universities[0].shortName}</span>}
          </p>
        )}
        {conference.type === 'experimentation' || conference.type === 'mise-en-recit' || conference.type === 'oeuvre' ? (
          <p className='text-14 text-c5 font-extralight'>{conference.date}</p>
        ) : (
          <p className='text-14 text-c5 font-extralight'>{formatDate(conference.date)}</p>
        )}
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



export const SmConfCard: React.FC<Conference> = (props) => {
  const conference = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const textRef = useRef<HTMLParagraphElement>(null);

  const thumbnailUrl = conference.url ? getYouTubeThumbnailUrl(conference.url) : '';

  const openConf = () => {
    const route = buildConfsRoute(conference.type, Number(conference.id));
    navigate(route);
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
            {conference.title}
          </p>
        </div>
        <p className='text-16 text-c5 font-extralight'>{conference.actant.firstname} {conference.actant.lastname}</p>
      </div>
    </div>
  );
};
