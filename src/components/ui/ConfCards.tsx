import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { buildConfsRoute, getYouTubeThumbnailUrl } from '@/lib/utils';
import { Conference } from '@/types/ui';
import { UserIcon } from '@/components/ui/icons';
import { truncateText } from '@/lib/utils';

export const LgConfCard: React.FC<Conference> = (props) => {
  const conference = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const thumbnailUrl = conference.url ? getYouTubeThumbnailUrl(conference.url) : '';

  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openConf = () => {
    const route = buildConfsRoute(conference.type, Number(conference.id));
    navigate(route);
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [conference.title]);

  const formatActantNames = () => {
    if (!conference.actant || !Array.isArray(conference.actant) || conference.actant.length === 0) {
      return 'Aucun intervenant';
    }

    if (conference.actant.length === 1) {
      const actant = conference.actant[0];
      return `${actant?.firstname || ''} ${actant?.lastname || ''}`;
    }

    const displayActants = conference.actant.slice(0, 3);
    const names = displayActants
      .filter((actant) => actant)
      .map((actant) => `${actant.firstname?.charAt(0) || ''}. ${actant.lastname || ''}`)
      .join(' - ');

    return conference.actant.length > 3 ? `${names}...` : names;
  };
  


  const formatUnivNames = () => {
    if (
      !conference.actant ||
      !Array.isArray(conference.actant) ||
      conference.actant.length === 0
    ) {
      return 'Aucun intervenant';
    }

    if (conference.actant.length === 1) {
      const actant = conference.actant[0];
      if (!actant?.universities || actant.universities.length === 0) {
        return 'Université inconnue';
      }
      return actant.universities.map(u => u.shortName).join(', ');
    }

    const universities = conference.actant
      .flatMap(actant => actant?.universities?.map(u => u.shortName) || [])
      .filter(Boolean);

    return truncateText(universities.join(' - '), 35);
  };

  const hasActants = conference.actant && Array.isArray(conference.actant) && conference.actant.length > 0;

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
        {hasActants && (
          <div className='flex items-center gap-5'>
            <div className='flex items-center relative'>
              {conference.actant.slice(0, 3).map((actant, index) => {
                const isLastAvatar = index === 2;
                const showCounter = conference.actant.length > 3 && isLastAvatar;

                // Déterminer la classe de rotation selon l'index
                const getRotationClass = () => {
                  switch (index) {
                    case 0:
                      return '';
                    case 1:
                      return 'rotate-[5deg]';
                    case 2:
                      return 'rotate-[10deg]';
                    default:
                      return '';
                  }
                };

                return (
                  actant && (
                    <div
                      key={actant.id || index}
                      className={`w-8 h-8 rounded-8 border-3 border-c1 overflow-hidden ${index > 0 ? '-ml-15' : ''} ${getRotationClass()}`}
                      style={{
                        zIndex: index + 1,
                      }}>
                      {showCounter ? (
                        <div className='w-full h-full bg-c4 flex items-center justify-center text-14 font-bold text-c2'>+{conference.actant.length - 2}</div>
                      ) : actant.picture ? (
                        <img src={actant.picture} alt={`${actant.firstname} ${actant.lastname}`} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full bg-c4 flex items-center justify-center text-12 font-semibold text-c1'>
                          <UserIcon size={12} className='text-c1' />
                        </div>
                      )}
                    </div>
                  )
                );
              })}
            </div>

            <div className='flex flex-col gap-5'>
              <p className='text-14 text-c5 font-extralight'>
                {formatActantNames()}
              </p>
              <p className='text-14 text-c5 font-extralight'>
                {formatUnivNames()}
              </p>
            </div>
          </div>
        )}
        {!hasActants && <p className='text-16 text-c5 font-extralight'>Aucun intervenant</p>}
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

  const renderActantNames = () => {
    if (!conference.actant || !Array.isArray(conference.actant) || conference.actant.length === 0) {
      return 'Aucun intervenant';
    }

    if (conference.actant.length === 1) {
      const actant = conference.actant[0];
      return `${actant?.firstname || ''} ${actant?.lastname || ''}`;
    }

    const displayActants = conference.actant.slice(0, 2);
    const names = displayActants
      .filter((actant) => actant)
      .map((actant) => `${actant.firstname || ''} ${actant.lastname || ''}`)
      .join(', ');

    return conference.actant.length > 2 ? `${names} et ${conference.actant.length - 2} autre${conference.actant.length > 3 ? 's' : ''}` : names;
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
        <p className='text-16 text-c5 font-extralight'>{renderActantNames()}</p>
      </div>
    </div>
  );
};
