import React from 'react';
import { IconSvgProps } from '@/types/ui';
import { ArrowIcon, ThumbnailIcon, UserIcon } from '@/components/ui/icons';
import { Skeleton } from '@heroui/react';

export interface ResourceCardProps {
  title: string;
  thumbnailUrl?: string;
  onClick: () => void;
  authors?: {
    name: string;
    picture?: string;
  }[];
  subtitle?: string; // For universities or extra date info
  date?: string;     // Explicit date line if needed (e.g. for Recits)
  
  // Footer / Type
  typeLabel: string;
  TypeIcon: React.FC<IconSvgProps>;
  typeColor?: string; // Optional override color for the type icon
  
  // Actions (e.g. dropdown for ExpCard)
  actions?: React.ReactNode; 
  
  className?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  thumbnailUrl,
  onClick,
  authors = [],
  subtitle,
  date,
  typeLabel,
  TypeIcon,
  typeColor,
  actions,
  className = ''
}) => {
  
  // Helper to format multiple authors
  const renderAuthorNames = () => {
    if (authors.length === 0) return 'Aucun intervenant';
    
    if (authors.length === 1) return authors[0].name || 'Nom inconnu';
    
    const displayAuthors = authors.slice(0, 3);
    const names = displayAuthors.map(a => {
        // Simple heuristic for "F. Lastname" or just name
        const parts = a.name.split(' ');
        if (parts.length > 1) {
             return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
        }
        return a.name;
    }).join(' - ');
    
    return authors.length > 3 ? `${names}...` : names;
  };

  const hasAuthors = authors.length > 0;

  return (
    <div
      onClick={onClick}
      className={`group shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between flex flex-col gap-20 hover:bg-c2 h-full transition-all ease-in-out duration-300 relative ${className}`}
    >
      {/* Optional Actions (Dropdowns, etc) */}
      {actions && (
        <div className="absolute bottom-20 right-20 z-10 opacity-20 group-hover:opacity-100 transition-opacity duration-200">
           {actions}
        </div>
      )}

      <div className="flex flex-col gap-10 justify-between">
        {/* Thumbnail */}
        <div
          className={`w-full aspect-[2/1] h-150 rounded-12 justify-center items-center flex overflow-hidden ${
            thumbnailUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'
          }`}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : {}}
        >
          {!thumbnailUrl && (
             <ThumbnailIcon className="text-c4/20" size={40} />
          )}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title & Optional Date */}
          <div className='flex flex-col gap-1.5 w-full'>
            <p className='text-16 text-c6 font-medium overflow-hidden line-clamp-2 leading-[1.2]'>
              {title}
            </p>
            {date && <p className='text-12 text-c5 font-extralight'>{date}</p>}
          </div>

          {/* Authors Section */}
          <div className='flex items-center gap-5'>
             {/* Avatars */}
             {hasAuthors ? (
                <div className='flex items-center relative'>
                   {authors.length === 1 ? (
                        <div className='w-7 h-7 rounded-8 border-3 border-c1 overflow-hidden bg-c3 flex items-center justify-center'>
                           {authors[0].picture ? (
                               <img src={authors[0].picture} alt={authors[0].name} className='w-full h-full object-cover' />
                           ) : (
                               <UserIcon size={12} className='text-c4' />
                           )}
                        </div>
                   ) : (
                       <div className='w-7 h-7 rounded-8 border-3 border-c3 bg-c3 flex items-center justify-center'>
                         <p className='text-12 font-bold text-c4'>+{authors.length}</p>
                       </div>
                   )}
                </div>
             ) : (
                <div className='h-6 w-6 rounded-6 bg-c3 flex items-center justify-center text-12 font-semibold text-c1'>
                   <UserIcon size={12} className='text-c4' />
                </div>
             )}

             {/* Names & Subtitle */}
             <div className='flex flex-col gap-0.5 w-full'>
                <p className={`text-14 font-extralight w-full line-clamp-1 ${hasAuthors ? 'text-c4' : 'text-c5'}`}>
                   {renderAuthorNames()}
                </p>
                {subtitle && (
                   <p className='text-12 text-c5 font-extralight w-full line-clamp-1'>
                     {subtitle}
                   </p>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Footer Type Badge */}
      <div className="flex gap-1.5 items-center">
        <TypeIcon size={14} className={typeColor ? "" : "text-c4/60"} style={typeColor ? { color: typeColor } : {}} />
        <p className='text-14 text-c4/60 font-medium'>{typeLabel}</p>
      </div>

    </div>
  );
};

export const ResourceCardSkeleton: React.FC = () => {
    return (
      <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-20 rounded-18 flex flex-col gap-20 h-full animate-pulse'>
        <div className="flex flex-col gap-10 justify-between">
          <div className="w-full aspect-[2/1] h-150 rounded-12 bg-c3/50" />
          <div className="flex flex-col gap-2 mt-2">
            {/* Title lines */}
            <div className="h-4 w-full bg-c3/50 rounded-8" />
            <div className="h-4 w-3/4 bg-c3/50 rounded-8" />
            
            {/* Author line */}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-8 h-8 rounded-8 bg-c3/50" />
              <div className="h-6 w-2/4 bg-c3/50 rounded-6" />
            </div>
          </div>
        </div>
        
        {/* Footer badge */}
        <div className="flex items-center gap-2 mt-auto">
            <div className="w-4 h-4 rounded-6 bg-c3/50" />
            <div className="h-4 w-2/4 bg-c3/50 rounded-6" />
        </div>
      </div>
    );
  };
