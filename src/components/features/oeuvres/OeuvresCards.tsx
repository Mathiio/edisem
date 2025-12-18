import { OeuvreIcon, ThumbnailIcon, UserIcon } from '@/components/ui/icons';
import { getYouTubeThumbnailUrl } from '@/lib/utils';
import { Skeleton } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


interface SearchModalProps {
  id: string;
  title: string;
  date?: string;
  thumbnail?: string;
  acteurs?: Array<{
    id: string;
    name: string;
    thumbnail?: string;
    page?: string;
  }>;
  onClose: () => void;
}

export const SearchModalCard: React.FC<SearchModalProps> = ({ id, title, date, thumbnail, acteurs = [], onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openOeuvre = () => {
    navigate(`/corpus/recit-artistique/${id}`);
    onClose();
  };

  const getActeursText = () => {
    if (!acteurs || acteurs.length === 0) return '';
    const validActeurs = acteurs.filter((acteur) => acteur?.name && typeof acteur.name === 'string');

    if (validActeurs.length === 0) return '';

    const displayActeurs = validActeurs.slice(0, 2).map((acteur) => acteur.name.trim());
    let result = displayActeurs.join(', ');

    if (validActeurs.length > 2) {
      result += ` et ${validActeurs.length - 2} autre${validActeurs.length - 2 > 1 ? 's' : ''}`;
    }

    return result;
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [title]);

  return (
    <div
      onClick={openOeuvre}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer border-2 h-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${isHovered ? 'border-c4' : 'border-c3'
        }`}>
      {/* Image ou placeholder */}
      <div
        className={`p-50 h-full w-300 rounded-12 justify-center items-center flex ${thumbnail ? 'bg-cover bg-center' : 'bg-gradient-to-br from-200 to-400'}`}
        style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnail ? 'invisible' : ''}`}>ŒUVRE</h3>
      </div>

      {/* Content */}
      <div className='flex flex-col gap-5 w-full'>
        {/* Title */}
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>

        {/* Authors */}
        {getActeursText() && <p className='text-16 text-c5 font-extralight'>{getActeursText()}</p>}

        {/* Date */}
        {date && <p className='text-14 text-c5 font-extralight'>{date}</p>}
      </div>
    </div>
  );
};


interface OeuvreCardProps {
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

export const OeuvreCard: React.FC<OeuvreCardProps> = (props) => {
  const oeuvre = props;
  const navigate = useNavigate();

  // Priority : thumbnail > picture > url (YouTube) > url (link)
  const thumbnailUrl = oeuvre.thumbnail || oeuvre.picture || (oeuvre.url ? getYouTubeThumbnailUrl(Array.isArray(oeuvre.url) ? oeuvre.url[0] : oeuvre.url) : '');

  const openOeuvre = () => {
    // Navigation vers la page de l'œuvre
    navigate(`/corpus/recit-artistique/${oeuvre.id}`);
  };

  const formatActantNames = () => {
    // Use personne if available, otherwise actant
    const people = oeuvre.personne || oeuvre.actant || [];

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
      .join(', ');

    return names;
  };

  const hasActants =
    (oeuvre.personne && Array.isArray(oeuvre.personne) && oeuvre.personne.length > 0) || (oeuvre.actant && Array.isArray(oeuvre.actant) && oeuvre.actant.length > 0);

  return (
    <div
      onClick={openOeuvre}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between flex flex-col gap-20 hover:bg-c2 h-full transition-all ease-in-out duration-300'>
      <div className="flex flex-col gap-10 justify-between">
        {/* Thumbnail or placeholder */}
        <div
          className={`w-full h-150 rounded-12 justify-center items-center flex ${thumbnailUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'}`}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}>
          {!thumbnailUrl && <ThumbnailIcon className="text-c4/20" size={40} />}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='flex flex-col gap-1.5 w-full'>
            <p className='text-16 text-c6 font-medium overflow-hidden line-clamp-2 leading-[1.2]'>
              {oeuvre.title}
            </p>
            {/* Date */}
            <p className='text-12 text-c5 font-extralight'>{oeuvre.date ? oeuvre.date : "Aucune date"}</p>
          </div>
          {hasActants && (
            <div className='flex items-center gap-5'>
              {/* Authors avatars */}
              <div className='flex items-center relative'>
                {(() => {
                  const people = oeuvre.personne || oeuvre.actant || [];

                  // CASE 1 : One author
                  if (people.length === 1) {
                    const person = people[0];
                    return (
                      <div className='w-7 h-7 rounded-8 border-3 border-c1 overflow-hidden'>
                        {person.picture ? (
                          <img
                            src={person.picture}
                            alt={`${person.firstname || person.firstName} ${person.lastname || person.lastName}`}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full rounded-8 bg-c4 flex items-center justify-center'>
                            <UserIcon size={12} className='text-c1' />
                          </div>
                        )}
                      </div>
                    );
                  }

                  // CASE 2 : Multiple authors (2+)
                  return (
                    <div className='w-7 h-7 rounded-8 border-3 border-c3 bg-c3 flex items-center justify-center'>
                      <p className='text-12 font-bold text-c4'>
                        +{people.length}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Authors info */}
              <div className='flex flex-col gap-1 w-full'>
                <p className='text-14 text-c4 font-extralight w-full line-clamp-1'>{formatActantNames()}</p>
              </div>
            </div>
          )}
          {!hasActants &&
            <div className='flex items-center gap-1.5 w-full'>
              <div className='h-6 w-6 rounded-6 bg-c3 flex items-center justify-center text-12 font-semibold text-c1'>
                <UserIcon size={12} className='text-c4' />
              </div>
              <p className='text-16 text-c5 font-extralight'>Aucun auteur</p>
            </div>
          }
        </div>
      </div>
      <div className="flex gap-1.5 items-center">
        <OeuvreIcon className="text-c4/60" size={14} />
        <p className='text-14 text-c4/60 font-medium'>Récit Artistique/Oeuvre</p>
      </div>
    </div>
  );
};






export const OeuvreCardSkeleton: React.FC = () => {
  return (
    <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-20 rounded-18 justify-between flex flex-col gap-20 h-full'>
      <div className="flex flex-col gap-10 justify-between">
        {/* Thumbnail placeholder */}
        <Skeleton className="w-300 h-150 rounded-12">
          <div className="w-300 h-150 rounded-12 bg-gradient-to-br from-c2 to-c3 flex items-center justify-center">
            <ThumbnailIcon className="text-c4/20" size={40} />
          </div>
        </Skeleton>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title (1 lines) */}
          <div className='flex flex-col gap-2'>
            <Skeleton className="h-4 w-full rounded-6" />
          </div>

          {/* Date */}
          <Skeleton className="h-3 w-24 rounded-6 mt-1" />

          {/* Authors section */}
          <div className='flex items-center gap-5 mt-2'>
            <Skeleton className="h-4 w-28 rounded-6" />
          </div>
        </div>
      </div>

      {/* Badge "Oeuvre" at the bottom */}
      <div className="flex gap-1.5 items-center">
        <Skeleton className="w-4 h-4 rounded-6" />
        <Skeleton className="h-4 w-16 rounded-6" />
      </div>
    </div>
  );
};
