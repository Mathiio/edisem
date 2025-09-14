import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@heroui/react";
import { buildConfsRoute, formatDate, getYouTubeThumbnailUrl } from '@/lib/utils';
import { Actant, Conference } from '@/types/ui';
import { UserIcon } from '@/components/ui/icons';
import * as Items from '@/services/Items';

export const ConfCard: React.FC<Conference> = ( conference ) => {
  const [isHovered, setIsHovered] = useState(false);
  const [actants, setActants] = useState<any[]>([]);
  const [isLoadingActants, setIsLoadingActants] = useState(false);
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

  // Récupération des actants
  useEffect(() => {
    const fetchActants = async () => {
      if (!conference.actant) {
        setActants([]);
        return;
      }

      setIsLoadingActants(true);

      try {
        if (Array.isArray(conference.actant) && 
            conference.actant.length > 0 && 
            conference.actant[0] && 
            typeof conference.actant[0] === 'object' && 
            'firstname' in conference.actant[0]) {
          setActants(conference.actant as Actant[]);
          return;
        }

        let actantIds: string[] = [];

        if (Array.isArray(conference.actant)) {
          actantIds = conference.actant.map(id => 
            typeof id === 'object' ? String(id.id || '') : String(id)
          ).filter(id => id);
        } else if (typeof conference.actant === 'string') {
          actantIds = (conference.actant as string).includes(',') 
            ? (conference.actant as string).split(',').map((id: string) => id.trim())
            : [conference.actant as string];
        } else if (typeof conference.actant === 'number') {
          actantIds = [String(conference.actant)];
        }

        if (actantIds.length > 0) {
          const fetchedActants = await Items.getActants(actantIds);
          setActants(fetchedActants);
        } else {
          setActants([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des actants:', error);
        setActants([]);
      } finally {
        setIsLoadingActants(false);
      }
    };

    fetchActants();
  }, [conference.actant]);

  // Helper pour formater les noms d'actants
  const renderActantNames = () => {
    if (isLoadingActants) {
      return 'Chargement...';
    }

    if (!actants || actants.length === 0) {
      return 'Aucun intervenant';
    }

    if (actants.length === 1) {
      const actant = actants[0];
      return `${actant?.firstname || ''} ${actant?.lastname || ''}`;
    }

    // Plusieurs actants - afficher les 2 premiers
    const displayActants = actants.slice(0, 2);
    const names = displayActants
      .filter(actant => actant)
      .map(actant => `${actant.firstname || ''} ${actant.lastname || ''}`)
      .join(', ');

    return actants.length > 2 
      ? `${names} et ${actants.length - 2} autre${actants.length > 3 ? 's' : ''}`
      : names;
  };

  const hasActants = actants && actants.length > 0;

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

        {/* Section actants avec avatars */}
        {isLoadingActants ? (
          <div className='flex items-center gap-5'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded-6 bg-c3 animate-pulse'></div>
              <div className='w-6 h-6 rounded-6 bg-c3 animate-pulse -ml-10'></div>
            </div>
            <div className='h-4 w-32 bg-c3 rounded animate-pulse'></div>
          </div>
        ) : hasActants ? (
          <div className='flex items-center gap-5'>
            {/* Actant avatars */}
            <div className='flex items-center relative'>
              {actants.slice(0, 2).map((actant, index) => {
                const isLastAvatar = index === 1;
                const showCounter = actants.length > 2 && isLastAvatar;

                return actant && (
                  <div
                    key={actant.id || index}
                    className={`w-6 h-6 rounded-6 border-2 border-c1 overflow-hidden ${
                      index > 0 ? '-ml-10' : ''
                    }`}
                    style={{
                      zIndex: index + 1,
                    }}>
                    {showCounter ? (
                      <div className='w-full h-full bg-c4 flex items-center justify-center text-12 font-bold text-c2'>
                        +{actants.length - 1}
                      </div>
                    ) : actant.picture ? (
                      <img 
                        src={actant.picture} 
                        alt={`${actant.firstname} ${actant.lastname}`}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-c4 flex items-center justify-center'>
                        <UserIcon size={8} className='text-c1' />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actant names */}
            <p className='text-16 text-c5 font-extralight'>
              {renderActantNames()}
            </p>
          </div>
        ) : (
          <p className='text-16 text-c5 font-extralight'>Aucun intervenant</p>
        )}

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
