import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { buildConfsRoute, getYouTubeThumbnailUrl } from '@/lib/utils';
import { Conference } from '@/types/ui';
import { UserIcon } from '@/components/ui/icons';



export const LgExpCard: React.FC<Conference> = (props) => {
  const experimentation = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();


  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = () => {
    navigate(`/corpus/experimentation/${experimentation.id}`);
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [experimentation.title]);



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
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${experimentation.thumbnail ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-c3 to-c4'}`}
        style={experimentation.thumbnail ? { backgroundImage: `url(${experimentation.thumbnail})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${experimentation.thumbnail ? 'invisible' : ''}`}>Expérimentation</h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {experimentation.title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>
          <div className='flex items-center gap-5'>
            {/* Actant info */}
            <div className='flex flex-col gap-1'>
              <p className='text-14 text-c5 font-extralight'>
                 {experimentation.acteurs?.[0]?.name}
              </p>
            </div>
          </div>
      </div>
    </div>
  );
};

export const LgExpSkeleton: React.FC = () => {
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
  const experimentation = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const textRef = useRef<HTMLParagraphElement>(null);

  const thumbnailUrl = experimentation.url ? getYouTubeThumbnailUrl(experimentation.url) : '';

  const openConf = () => {
    const route = buildConfsRoute(experimentation.type, Number(experimentation.id));
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
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${experimentation.thumbnail ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-c3 to-c4'}`}
        style={experimentation.thumbnail ? { backgroundImage: `url(${experimentation.thumbnail})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${experimentation.thumbnail ? 'invisible' : ''}`}>Expérimentation</h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden line-clamp-3'>
            {experimentation.title}
          </p>
        </div>
        <p className='text-16 text-c5 font-extralight'>
          {experimentation.acteurs?.[0]?.name}
        </p>
      </div>
    </div>
  );
};
