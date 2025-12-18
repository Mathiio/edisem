import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ThumbnailIcon, PratiqueNarrativeIcon } from '@/components/ui/icons';
import { getYouTubeThumbnailUrl } from '@/lib/utils';

// Types of recits as it is defined in Items.ts
export type RecitType = 'recitCitoyen' | 'recitMediatique' | 'recitScientifique' | 'recitTechnoIndustriel' | 'recitArtistique';

interface RecitCardProps {
  [key: string]: any;
}

export const RecitCard: React.FC<RecitCardProps> = (props) => {
  const recit = props;
  const navigate = useNavigate();

  // Determine the type of display based on the type of content
  const type = recit.type as RecitType;

  // --- LOGIC OF DISPLAY ---

  // 1. URL of the thumbnail
  const thumbnailUrl = recit.thumbnail || recit.picture || (recit.url ? getYouTubeThumbnailUrl(Array.isArray(recit.url) ? recit.url[0] : recit.url) : '');

  // 2. Navigation
  const openRecit = () => {
    // Mapping of the detail routes based on the type
    // The routes must correspond to those defined in App.tsx
    switch (type) {
      case 'recitCitoyen':
        navigate(`/corpus/recit-citoyen/${recit.id}`);
        return;
      case 'recitMediatique':
        navigate(`/corpus/recit-mediatique/${recit.id}`);
        return;
      case 'recitScientifique':
        navigate(`/corpus/recit-scientifique/${recit.id}`);
        return;
      case 'recitTechnoIndustriel':
        navigate(`/corpus/recit-techno-industriel/${recit.id}`);
        return;
      case 'recitArtistique':
        navigate(`/corpus/recit-artistique/${recit.id}`);
        return;
      default:
        // Fallback generic if the type is not recognized
        console.warn('Type of recit unknown for navigation:', type);
        return;
    }
  };

  // 3. Value for the DATE with prefix
  const getDateLine = () => {
    const date = recit.dateIssued || recit.date || "Date inconnue";
    if (type === 'recitCitoyen') return `Fondé : ${date}`;
    return `Publié : ${date}`;
  };

  // 4. Value for the AUTHOR / ENTITY (Name only)
  const getAuthorName = () => {
    // Case Recit Techno-Industriel : often the creator is a string (ex: "Microsoft")
    if (type === 'recitTechnoIndustriel' && typeof recit.creator === 'string') {
      return recit.creator;
    }

    // General cases with hydrated object (Person)
    if (recit.creator && typeof recit.creator === 'object') {
      const c = recit.creator;
      const name = `${c.firstname || c.firstName || ''} ${c.lastname || c.lastName || ''}`.trim();
      if (name) return name;
      return c.name || "Ateur Inconnu";
    }

    // Fallback if creator is an unhydrated ID or a simple string
    if (typeof recit.creator === 'string') return recit.creator;

    // Fallbacks
    if (recit.publisher) return recit.publisher;
    if (recit.source) return recit.source;

    return "Non spécifié";
  };

  // 5. Type Badge Label
  const getTypeBadgeLabel = () => {
    switch (type) {
      case 'recitCitoyen': return 'Mise en Récit Citoyen';
      case 'recitMediatique': return 'Mise en Récit Médiatique';
      case 'recitScientifique': return 'Mise en Récit Scientifique';
      case 'recitTechnoIndustriel': return 'Mise en Récit Techno-Industriel';
      case 'recitArtistique': return 'Mise en Récit Artistique';
      default: return 'Mise en Récit';
    }
  };

  const getTypeBadgeColor = () => {
    switch (type) {
      case 'recitCitoyen': return '#C8F3C9';
      case 'recitMediatique': return '#FFF1B8';
      case 'recitScientifique': return '#86A4E7';
      case 'recitTechnoIndustriel': return '#ADCFEC';
      case 'recitArtistique': return '#EDB9EB';
      default: return '#E0E0E0';
    }
  };


  return (
    <div
      onClick={openRecit}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between flex flex-col gap-20 hover:bg-c2 h-full transition-all ease-in-out duration-300 group'
    >
      <div className="flex flex-col gap-10 justify-between">
        {/* Thumbnail */}
        <div
          className={`w-full aspect-video rounded-12 justify-center items-center flex overflow-hidden ${thumbnailUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'}`}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}
        >
          {!thumbnailUrl && <ThumbnailIcon className="text-c4/20 group-hover:scale-110 transition-transform duration-500" size={40} />}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='flex flex-col gap-1.5 w-full'>
            <p className='text-16 text-c6 font-medium overflow-hidden line-clamp-2 leading-[1.2]'>
              {recit.title}
            </p>
            {/* Date */}
            <p className='text-12 text-c5 font-extralight'>{getDateLine()}</p>
          </div>

          {/* Author */}
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-8 bg-c3 flex items-center justify-center'>
              <UserIcon size={10} className='text-c4' />
            </div>
            <p className='text-16 text-c5 font-light line-clamp-1'>
              {getAuthorName()}
            </p>
          </div>

        </div>
      </div>

      {/* Footer Badge */}
      <div className="flex gap-1.5 items-center">
        <PratiqueNarrativeIcon size={14} className="opacity-80" style={{ color: getTypeBadgeColor() }} />
        <p className="text-14 text-c4/60 font-medium">
          {getTypeBadgeLabel()}
        </p>
      </div>
    </div>
  );
};

export const RecitCardSkeleton: React.FC = () => {
  return (
    <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-20 rounded-18 flex flex-col gap-20 h-full animate-pulse'>
      <div className="w-full aspect-video rounded-12 bg-c3/50" />
      <div className="flex flex-col gap-4 mt-2">
        <div className="h-6 w-3/4 bg-c3/50 rounded" />
        <div className="flex flex-col gap-2 mt-2">
          <div className="h-3 w-1/3 bg-c3/30 rounded" />
          <div className="h-4 w-1/2 bg-c3/50 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-1/3 bg-c3/30 rounded" />
          <div className="h-4 w-1/2 bg-c3/50 rounded" />
        </div>
      </div>
    </div>
  );
};
