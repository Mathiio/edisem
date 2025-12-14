import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { buildConfsRoute, getYouTubeThumbnailUrl } from '@/lib/utils';
import { Conference, IconSvgProps } from '@/types/ui';
import { UserIcon, SeminaireIcon, ThumbnailIcon, ColloqueIcon, StudyDayIcon, ArrowIcon } from '@/components/ui/icons';


const CONFERENCE_TYPES: Record<string, { label: string; icon: React.FC<IconSvgProps> }> = {
  seminar: { label: 'Conférence de séminaire', icon: SeminaireIcon },
  colloque: { label: 'Conférence de colloque', icon: ColloqueIcon },
  studyday: { label: 'Conférence de journée d\'études', icon: StudyDayIcon },
  default: { label: 'Conférence', icon: SeminaireIcon }
};

export const ConfCard: React.FC<Conference> = (props) => {
  const conference = props;
  const navigate = useNavigate();

  // Thumbnail priority: thumbnail > picture > YouTube URL
  const thumbnailUrl = 
    conference.thumbnail || 
    conference.picture || 
    (conference.url ? getYouTubeThumbnailUrl(
      Array.isArray(conference.url) ? conference.url[0] : conference.url
    ) : '');

  // Conference type configuration
  const confType = CONFERENCE_TYPES[conference.type || 'default'] || CONFERENCE_TYPES.default;
  const ConfIcon = confType.icon;

  const openConf = () => {
    navigate(buildConfsRoute(conference.type, Number(conference.id)));
  };

  const formatActantNames = () => {
    const people = conference.personne || conference.actant || [];

    if (!Array.isArray(people) || people.length === 0) {
      return 'Aucun intervenant';
    }

    if (people.length === 1) {
      const person = people[0];
      const firstname = person?.firstname || person?.firstName || '';
      const lastname = person?.lastname || person?.lastName || '';
      return `${firstname} ${lastname}`.trim() || 'Nom inconnu';
    }

    const displayPeople = people.slice(0, 3);
    const names = displayPeople
      .filter((person) => person)
      .map((person) => {
        const firstname = person.firstname || person.firstName || '';
        const lastname = person.lastname || person.lastName || '';
        return `${firstname?.charAt(0) || ''}. ${lastname || ''}`.trim();
      })
      .filter(name => name)
      .join(' - ');

    return people.length > 3 ? `${names}...` : names;
  };

  const formatUniversities = () => {
    const people = conference.personne || conference.actant || [];
    
    if (!Array.isArray(people) || people.length === 0) {
      return null;
    }

    // Extract all universities from actants
    const universities = people
      .flatMap((person) => {
        const univs = person?.universite || person?.universities || [];
        return Array.isArray(univs) ? univs : [];
      })
      .filter(Boolean);

    if (universities.length === 0) return null;

    // Deduplicate by shortName or name
    const uniqueUnivs = Array.from(
      new Map(
        universities.map(u => [
          u.shortName || u.name || u.id,
          u.shortName || u.name || 'Université'
        ])
      ).values()
    );

    const univText = uniqueUnivs.slice(0, 2).join(' - ');
    return uniqueUnivs.length > 2 ? `${univText}...` : univText;
  };

  const hasActants = 
    (conference.personne && Array.isArray(conference.personne) && conference.personne.length > 0) || 
    (conference.actant && Array.isArray(conference.actant) && conference.actant.length > 0);

  const universities = formatUniversities();

  return (
    <div
      onClick={openConf}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between flex flex-col gap-20 hover:bg-c2 h-full transition-all ease-in-out duration-300'
    >
      <div className="flex flex-col gap-10 justify-between">
        {/* Thumbnail or placeholder */}
        <div
          className={`w-full h-150 rounded-12 justify-center items-center flex ${
            thumbnailUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'
          }`}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}
        >
          {!thumbnailUrl && (
            <div className="flex flex-col items-center gap-2">
              <ThumbnailIcon className="text-c4/20" size={40} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='flex flex-col gap-1.5 w-full'>
            <p className='text-16 text-c6 font-medium overflow-hidden line-clamp-2 leading-[1.2]'>
              {conference.title}
            </p>
          </div>

          {/* Actants */}
          {hasActants && (
            <div className='flex items-center gap-5'>
              {/* Avatar(s) */}
              <div className='flex items-center relative'>
                {(() => {
                  const people = conference.personne || conference.actant || [];

                  // CASE 1: Single speaker
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

                  // CASE 2: Multiple speakers (2+)
                  return (
                    <div className='w-7 h-7 rounded-8 border-3 border-c3 bg-c3 flex items-center justify-center'>
                      <p className='text-12 font-bold text-c4'>+{people.length}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Actant names */}
              <div className='flex flex-col gap-0.5 w-full'>
                <p className='text-14 text-c4 font-extralight w-full line-clamp-1'>
                  {formatActantNames()}
                </p>
                {universities && (
                  <p className='text-12 text-c5 font-extralight w-full line-clamp-1'>
                    {universities}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No actants */}
          {!hasActants && (
            <div className='flex items-center gap-1.5 w-full'>
              <div className='h-6 w-6 rounded-6 bg-c3 flex items-center justify-center text-12 font-semibold text-c1'>
                <UserIcon size={12} className='text-c4' />
              </div>
              <p className='text-16 text-c5 font-extralight'>Aucun intervenant</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Conference type */}
      <div className="flex gap-1.5 items-center">
        <ConfIcon className="text-c4/60" size={14} />
        <p className='text-14 text-c4/60 font-medium'>{confType.label}</p>
      </div>
    </div>
  );
};



export const SearchConfCard: React.FC<Conference> = (props) => {
  const conference = props;
  const navigate = useNavigate();

  // Thumbnail priority: thumbnail > picture > YouTube URL
  const thumbnailUrl = 
    conference.thumbnail || 
    conference.picture || 
    (conference.url ? getYouTubeThumbnailUrl(
      Array.isArray(conference.url) ? conference.url[0] : conference.url
    ) : '');

  const openConf = () => {
    navigate(buildConfsRoute(conference.type, Number(conference.id)));
  };

  const formatActantNames = () => {
    const people = conference.personne || conference.actant || [];

    if (!Array.isArray(people) || people.length === 0) {
      return 'Aucun intervenant';
    }

    if (people.length === 1) {
      const person = people[0];
      const firstname = person?.firstname || person?.firstName || '';
      const lastname = person?.lastname || person?.lastName || '';
      return `${firstname} ${lastname}`.trim() || 'Nom inconnu';
    }

    const displayPeople = people.slice(0, 3);
    const names = displayPeople
      .filter((person) => person)
      .map((person) => {
        const firstname = person.firstname || person.firstName || '';
        const lastname = person.lastname || person.lastName || '';
        return `${firstname?.charAt(0) || ''}. ${lastname || ''}`.trim();
      })
      .filter(name => name)
      .join(' - ');

    return people.length > 3 ? `${names}...` : names;
  };

  const formatUniversities = () => {
    const people = conference.personne || conference.actant || [];
    
    if (!Array.isArray(people) || people.length === 0) {
      return null;
    }

    // Extract all universities from actants
    const universities = people
      .flatMap((person) => {
        const univs = person?.universite || person?.universities || [];
        return Array.isArray(univs) ? univs : [];
      })
      .filter(Boolean);

    if (universities.length === 0) return null;

    // Deduplicate by shortName or name
    const uniqueUnivs = Array.from(
      new Map(
        universities.map(u => [
          u.shortName || u.name || u.id,
          u.shortName || u.name || 'Université'
        ])
      ).values()
    );

    const univText = uniqueUnivs.slice(0, 2).join(' - ');
    return uniqueUnivs.length > 2 ? `${univText}...` : univText;
  };

  const hasActants = 
    (conference.personne && Array.isArray(conference.personne) && conference.personne.length > 0) || 
    (conference.actant && Array.isArray(conference.actant) && conference.actant.length > 0);

  const universities = formatUniversities();

  return (
    <div
      onClick={openConf}
      className='group shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between items-center flex gap-40 hover:bg-c2 h-full transition-all ease-in-out duration-300'
    >
      <div className="w-full flex gap-20 justify-between items-center">
        {/* Thumbnail or placeholder */}
        <div
          className={`w-200 h-100 rounded-12 justify-center items-center flex ${
            thumbnailUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'
          }`}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}
        >
          {!thumbnailUrl && (
            <div className="flex flex-col items-center gap-2">
              <ThumbnailIcon className="text-c4/20" size={30} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='flex flex-col gap-1.5 w-full'>
            <p className='text-16 text-c6 font-medium overflow-hidden line-clamp-2 leading-[1.2]'>
              {conference.title}
            </p>
          </div>

          {/* Actants */}
          {hasActants && (
            <div className='flex items-center gap-5'>
              {/* Avatar(s) */}
              <div className='flex items-center relative'>
                {(() => {
                  const people = conference.personne || conference.actant || [];

                  // CASE 1: Single speaker
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

                  // CASE 2: Multiple speakers (2+)
                  return (
                    <div className='w-7 h-7 rounded-8 border-3 border-c3 bg-c3 flex items-center justify-center'>
                      <p className='text-12 font-bold text-c4'>+{people.length}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Actant names */}
              <div className='flex flex-col gap-0.5 w-full'>
                <p className='text-14 text-c4 font-extralight w-full line-clamp-1'>
                  {formatActantNames()}
                </p>
                {universities && (
                  <p className='text-12 text-c5 font-extralight w-full line-clamp-1'>
                    {universities}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No actants */}
          {!hasActants && (
            <div className='flex items-center gap-1.5 w-full'>
              <div className='h-6 w-6 rounded-6 bg-c3 flex items-center justify-center text-12 font-semibold text-c1'>
                <UserIcon size={12} className='text-c4' />
              </div>
              <p className='text-16 text-c5 font-extralight'>Aucun intervenant</p>
            </div>
          )}
        </div>
      </div>
      <div className='group-hover:opacity-100 opacity-0 transition-all ease-in-out duration-300 rounded-8 p-10 bg-action transform flex items-center justify-center'>
        <ArrowIcon size={16} className='text-c6' />
      </div>
    </div>
  );
};


export const ConfCardSkeleton: React.FC = () => {
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
          {/* Title (2 lines) */}
          <div className='flex flex-col gap-2'>
            <Skeleton className="h-4 w-full rounded-6" />
            <Skeleton className="h-4 w-full rounded-6" />
          </div>

          {/* Actants section */}
          <div className='flex items-center gap-5 mt-2'>
            <Skeleton className="h-4 w-28 rounded-6" />
          </div>
        </div>
      </div>

      {/* Badge "Conference type" at the bottom */}
      <div className="flex gap-1.5 items-center">
        <Skeleton className="w-4 h-4 rounded-6" />
        <Skeleton className="h-4 w-16 rounded-6" />
      </div>
    </div>
  );
};


export const SmConfCard: React.FC<Conference> = (props) => {
  const conference = props;
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const textRef = useRef<HTMLParagraphElement>(null);

  // Utiliser le thumbnail directement si disponible, sinon essayer getYouTubeThumbnailUrl
  let thumbnailUrl = '';

  // Priorité 1: Thumbnail depuis associatedMedia
  if (conference.associatedMedia?.[0]?.thumbnail) {
    thumbnailUrl = conference.associatedMedia[0].thumbnail;
  }
  // Priorité 2: YouTube thumbnail depuis associatedMedia
  else if (conference.associatedMedia?.[0]?.url && (conference.associatedMedia[0].url.includes('youtube.com') || conference.associatedMedia[0].url.includes('youtu.be'))) {
    thumbnailUrl = getYouTubeThumbnailUrl(conference.associatedMedia[0].url);
  }
  // Priorité 3: Thumbnail direct (si c'est une string)
  else if (typeof conference.thumbnail === 'string' && conference.thumbnail) {
    thumbnailUrl = conference.thumbnail;
  }
  // Priorité 4: YouTube thumbnail depuis thumbnail.url (si thumbnail est un objet)
  else if (
    typeof conference.thumbnail === 'object' &&
    conference.thumbnail &&
    'url' in conference.thumbnail &&
    (conference.thumbnail as any).url &&
    ((conference.thumbnail as any).url.includes('youtube.com') || (conference.thumbnail as any).url.includes('youtu.be'))
  ) {
    thumbnailUrl = getYouTubeThumbnailUrl((conference.thumbnail as any).url);
  }
  // Priorité 5: Thumbnail depuis thumbnail.thumbnail (si thumbnail est un objet)
  else if (typeof conference.thumbnail === 'object' && conference.thumbnail && 'thumbnail' in conference.thumbnail && (conference.thumbnail as any).thumbnail) {
    thumbnailUrl = (conference.thumbnail as any).thumbnail;
  }
  // Priorité 6: YouTube thumbnail depuis conference.url
  else if (conference.url && (conference.url.includes('youtube.com') || conference.url.includes('youtu.be'))) {
    thumbnailUrl = getYouTubeThumbnailUrl(conference.url);
  }

  const openConf = () => {
    const route = buildConfsRoute(conference.type, Number(conference.id));
    navigate(route);
  };

  return (
    <div
      onClick={openConf}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-2 cursor-pointer justify-center flex flex-col gap-10 transition-all ease-in-out duration-200 relative ${isHovered ? 'bg-c2 rounded-12' : ''}`}>
      <div
        className={` absolute min-w-full h-full rounded-12 transition-all ease-in-out duration-200 
       `}></div>
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
      </div>
    </div>
  );
};
