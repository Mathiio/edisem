import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@heroui/react";
import { buildConfsRoute, formatDate } from '@/lib/utils';
import { Conference } from '@/types/ui';



const getYouTubeThumbnailUrl = (ytb: string): string => {
  const videoId = ytb.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : '';
};


export const ConfCard: React.FC<Conference> = ( conference ) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const thumbnailUrl = conference.url ? getYouTubeThumbnailUrl(conference.url) : '';

  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = () => {
    navigate(buildConfsRoute(conference.type, Number(conference.id)));
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
      className={`cursor-pointer border-2 h-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${
        isHovered ? 'border-c4' : 'border-c3'
      }`}>
      <div className={`p-50 h-full w-300 rounded-12 justify-center items-center flex  ${
          thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-200 to-400'
        }`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnailUrl ? 'invisible' : ''}`}>
          CONFÉRENCE
        </h3>
      </div>
      <div className='flex flex-col gap-5 w-full'>
        <div className='relative'>
          <p
            ref={textRef}
            className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {conference.title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>
        <p className='text-16 text-c5 font-extralight'>
          {conference.actant?.firstname} {conference.actant?.lastname}
          <span className='text-14'> - {conference.actant?.universities && <span className='text-14'> {conference.actant?.universities[0].shortName}</span>}</span>
        </p>
        <p className='text-14 text-c5 font-extralight'>{formatDate(conference.date)}</p>
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
