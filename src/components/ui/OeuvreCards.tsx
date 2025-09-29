import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { getYouTubeThumbnailUrl } from '@/lib/utils';
import { UserIcon } from '@/components/ui/icons';

interface Oeuvre {
  id: string | number;
  title: string;
  url?: string | string[];
  type?: string;
  actant?: any[];
  personne?: any[];
  picture?: string;
  thumbnail?: string;
  description?: string;
  abstract?: string;
  date?: string;
  genre?: any[];
  keywords?: string[];
  [key: string]: any;
}

export const LgOeuvreCard: React.FC<Oeuvre> = (props) => {
  const oeuvre = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Priorité : thumbnail > picture > url (YouTube) > url (lien)
  const thumbnailUrl = oeuvre.thumbnail || oeuvre.picture || (oeuvre.url ? getYouTubeThumbnailUrl(Array.isArray(oeuvre.url) ? oeuvre.url[0] : oeuvre.url) : '');

  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openOeuvre = () => {
    // Navigation vers la page de l'œuvre
    navigate(`/corpus/oeuvre/${oeuvre.id}`);
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [oeuvre.title]);

  const formatActantNames = () => {
    // Utiliser personne si disponible, sinon actant
    const people = oeuvre.personne || oeuvre.actant || [];

    if (!Array.isArray(people) || people.length === 0) {
      return 'Aucun intervenant';
    }

    if (people.length === 1) {
      const person = people[0];
      return `${person?.firstname || person?.firstName || ''} ${person?.lastname || person?.lastName || ''}`;
    }

    const displayPeople = people.slice(0, 3);
    const names = displayPeople
      .filter((person) => person)
      .map((person) => {
        const firstname = person.firstname || person.firstName || '';
        const lastname = person.lastname || person.lastName || '';
        return `${firstname?.charAt(0) || ''}. ${lastname || ''}`;
      })
      .join(' - ');

    return people.length > 3 ? `${names}...` : names;
  };

  const hasActants =
    (oeuvre.personne && Array.isArray(oeuvre.personne) && oeuvre.personne.length > 0) || (oeuvre.actant && Array.isArray(oeuvre.actant) && oeuvre.actant.length > 0);

  return (
    <div
      onClick={openOeuvre}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='cursor-pointer flex flex-col gap-10 transition-all ease-in-out duration-200 relative'>
      <div
        className={`absolute w-full h-full rounded-12 transition-all ease-in-out duration-200 
        ${isHovered ? 'bg-c2 scale-105' : 'scale-100'}`}></div>
      <div
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-c3 to-c4'}`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnailUrl ? 'invisible' : ''}`}>ŒUVRE</h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {oeuvre.title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>
        {hasActants && (
          <div className='flex items-center gap-5'>
            {/* Actant avatars */}
            <div className='flex items-center relative'>
              {(oeuvre.personne || oeuvre.actant || []).slice(0, 3).map((person, index) => {
                const isLastAvatar = index === 2;
                const people = oeuvre.personne || oeuvre.actant || [];
                const showCounter = people.length > 3 && isLastAvatar;

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
                  person && (
                    <div
                      key={person.id || index}
                      className={`w-8 h-8 rounded-8 border-3 border-c1 overflow-hidden ${index > 0 ? '-ml-15' : ''} ${getRotationClass()}`}
                      style={{
                        zIndex: index + 1,
                      }}>
                      {showCounter ? (
                        <div className='w-full h-full bg-c4 flex items-center justify-center text-14 font-bold text-c2'>+{people.length - 2}</div>
                      ) : person.picture ? (
                        <img src={person.picture} alt={`${person.firstname || person.firstName} ${person.lastname || person.lastName}`} className='w-full h-full object-cover' />
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

            {/* Actant info */}
            <div className='flex flex-col gap-1'>
              <p className='text-16 text-c5 font-extralight'>
                {(oeuvre.personne || oeuvre.actant || []).length === 1 ? '1 intervenant' : `${(oeuvre.personne || oeuvre.actant || []).length} intervenants`}
              </p>
              <p className='text-14 text-c5 font-extralight'>{formatActantNames()}</p>
            </div>
          </div>
        )}
        {!hasActants && <p className='text-16 text-c5 font-extralight'>Aucun intervenant</p>}
      </div>
    </div>
  );
};

export const LgOeuvreSkeleton: React.FC = () => {
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

export const SmOeuvreCard: React.FC<Oeuvre> = (props) => {
  const oeuvre = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const textRef = useRef<HTMLParagraphElement>(null);

  // Priorité : thumbnail > picture > url (YouTube) > url (lien)
  const thumbnailUrl = oeuvre.thumbnail || oeuvre.picture || (oeuvre.url ? getYouTubeThumbnailUrl(Array.isArray(oeuvre.url) ? oeuvre.url[0] : oeuvre.url) : '');

  const openOeuvre = () => {
    // Navigation vers la page de l'œuvre
    navigate(`/corpus/oeuvre/${oeuvre.id}`);
  };

  // Helper pour formater les noms d'actants
  const renderActantNames = () => {
    // Utiliser personne si disponible, sinon actant
    const people = oeuvre.personne || oeuvre.actant || [];

    if (!Array.isArray(people) || people.length === 0) {
      return 'Aucun intervenant';
    }

    if (people.length === 1) {
      const person = people[0];
      return `${person?.firstname || person?.firstName || ''} ${person?.lastname || person?.lastName || ''}`;
    }

    // Plusieurs personnes - afficher les 2 premiers
    const displayPeople = people.slice(0, 2);
    const names = displayPeople
      .filter((person) => person)
      .map((person) => `${person.firstname || person.firstName || ''} ${person.lastname || person.lastName || ''}`)
      .join(', ');

    return people.length > 2 ? `${names} et ${people.length - 2} autre${people.length > 3 ? 's' : ''}` : names;
  };

  return (
    <div
      onClick={openOeuvre}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='cursor-pointer flex flex-col gap-10 transition-all ease-in-out duration-200 relative'>
      <div
        className={`absolute w-full h-full rounded-12 transition-all ease-in-out duration-200 
        ${isHovered ? 'bg-c2 scale-105' : 'scale-100'}`}></div>
      <div
        className={`p-50 h-200 w-full rounded-12 justify-center items-center flex z-10 ${thumbnailUrl ? 'bg-cover bg-center ' : 'bg-gradient-to-br from-c3 to-c4'}`}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnailUrl ? 'invisible' : ''}`}>ŒUVRE</h3>
      </div>
      <div className='flex flex-col gap-5 z-10'>
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden line-clamp-3'>
            {oeuvre.title}
          </p>
        </div>
        <p className='text-16 text-c5 font-extralight'>{renderActantNames()}</p>
      </div>
    </div>
  );
};
