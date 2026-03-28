import React from 'react';

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { Conference } from '@/types/ui';
import { EditIcon, TrashIcon, UserIcon, ThumbnailIcon, SeminaireIcon } from '@/components/ui/icons';
import { getResourceAuthors, getResourceSubtitle, getSafeResourceUrl, getResourceThumbnail } from '@/lib/resourceUtils';
import { getRessourceLabel, getResourceIcon } from '@/config/resourceConfig';
import { useNavigate } from 'react-router-dom';

interface ExpCardProps extends Omit<Conference, 'type'> {
  type?: string;
  showActions?: boolean;
  onEdit?: (id: string, type?: string) => void;
  onDelete?: (id: string) => void;
}

export const StudentCard: React.FC<ExpCardProps> = (props) => {
  const { type = 'experimentation_etudiant', showActions = false, onEdit, onDelete, ...experimentation } = props;
  const navigate = useNavigate();

  const handleEdit = () => {
    if (onEdit && experimentation.id) {
      onEdit(experimentation.id, type);
    }
  };

  const handleDelete = () => {
    if (onDelete && experimentation.id) {
      onDelete(experimentation.id);
    }
  };

  // Actions Dropdown
  const actionsContent = showActions ? (
     <Dropdown
        shouldBlockScroll={false}
        classNames={{
          content:
            'shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 rounded-xl border-2 border-c3 min-w-[140px]',
        }}>
        <DropdownTrigger>
          <button
            onClick={(e) => e.stopPropagation()}
            className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-lg border-2 border-c4 items-center justify-center p-2 text-c6 transition-all ease-in-out duration-200'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
              <circle cx='12' cy='5' r='2' />
              <circle cx='12' cy='12' r='2' />
              <circle cx='12' cy='19' r='2' />
            </svg>
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label='Actions'
          className='p-2'
          classNames={{
            base: 'bg-transparent shadow-none border-0',
            list: 'bg-transparent',
          }}>
          <DropdownItem
            key='edit'
            className='cursor-pointer text-c6 rounded-lg py-2 px-3 data-[hover=true]:!bg-c3 data-[selectable=true]:focus:!bg-c3'
            startContent={<EditIcon size={14} className='text-c5' />}
            onPress={handleEdit}
          >
            Modifier
          </DropdownItem>
          <DropdownItem
            key='delete'
            className='cursor-pointer text-c6 rounded-lg py-2 px-3 data-[hover=true]:!bg-c3 data-[selectable=true]:focus:!bg-c3'
            startContent={<TrashIcon size={14} className='text-c5' />}
            onPress={handleDelete}
          >
            Supprimer
          </DropdownItem>
        </DropdownMenu>
     </Dropdown>
  ) : undefined;


  // --- ResourceCard Logic ---
  const item: any = { ...experimentation, type };
  const finalTitle = experimentation.title || '';
  const finalThumbnail = experimentation.thumbnail || getResourceThumbnail(item) || '';
  const finalAuthors = getResourceAuthors(item);
  const finalSubtitle = getResourceSubtitle(item);
  const finalType = type;

  const finalTypeLabel = getRessourceLabel(finalType);
  const FinalTypeIcon = getResourceIcon(finalType) || SeminaireIcon; 

  const handleClick = () => {
      const url = getSafeResourceUrl(item);
      if (url && url !== '#') {
        navigate(url);
        return;
      }
      
      console.warn('Navigation impossible: ID manquant pour ce type', { type, item });
  };

  const renderAuthorNames = () => {
    if (finalAuthors.length === 0) return 'Aucun intervenant';
    
    if (finalAuthors.length === 1) return finalAuthors[0].name || 'Nom inconnu';
    
    const displayAuthors = finalAuthors.slice(0, 3);
    const names = displayAuthors.map(a => {
        const parts = a.name.split(' ');
        if (parts.length > 1) {
             return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
        }
        return a.name;
    }).join(' - ');
    
    return finalAuthors.length > 3 ? `${names}...` : names;
  };

  const hasAuthors = finalAuthors.length > 0;
  const typeColor = undefined; // Or define via props if needed

  return (
    <div
      onClick={handleClick}
      className={`group shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-5 rounded-2xl justify-between flex flex-col gap-5 hover:bg-c2 h-full transition-all ease-in-out duration-300 relative`}
    >
      {/* Optional Actions (Dropdowns, etc) */}
      {actionsContent && (
        <div className="absolute bottom-4 right-4 z-10 opacity-20 group-hover:opacity-100 transition-opacity duration-200">
           {actionsContent}
        </div>
      )}

      <div className="flex flex-col gap-2.5 justify-between">
        {/* Thumbnail */}
        <div
          className={`w-full aspect-[2/1] h-36 rounded-xl justify-center items-center flex overflow-hidden ${
            finalThumbnail ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'
          }`}
          style={finalThumbnail ? { backgroundImage: `url(${finalThumbnail})` } : {}}
        >
          {!finalThumbnail && (
             <ThumbnailIcon className="text-c4/20" size={40} />
          )}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='flex flex-col gap-1.5 w-full'>
            <p className='text-base text-c6 font-medium overflow-hidden line-clamp-2 leading-[1.2]'>
              {finalTitle}
            </p>
          </div>

          {/* Authors Section */}
          <div className='flex items-center gap-1.5'>
             {/* Avatars */}
             {hasAuthors ? (
                <div className='flex items-center relative'>
                   {finalAuthors.length === 1 ? (
                        <div className='w-7 h-7 rounded-lg overflow-hidden bg-c3 flex items-center justify-center'>
                           {finalAuthors[0].picture ? (
                               <img src={finalAuthors[0].picture} alt={finalAuthors[0].name} className='w-full h-full object-cover' />
                           ) : (
                               <UserIcon size={12} className='text-c4' />
                           )}
                        </div>
                   ) : (
                       <div className='w-7 h-7 rounded-lg bg-c3 flex items-center justify-center'>
                         <p className='text-xs font-bold text-c4'>+{finalAuthors.length}</p>
                       </div>
                   )}
                </div>
             ) : (
                <div className='h-6 w-6 rounded-md bg-c3 flex items-center justify-center text-xs font-medium text-c1'>
                   <UserIcon size={12} className='text-c4' />
                </div>
             )}

             {/* Names & Subtitle */}
             <div className='flex flex-col gap-0.5 w-full'>
                <p className={`text-sm font-normal w-full line-clamp-1 ${hasAuthors ? 'text-c4' : 'text-c5'}`}>
                   {renderAuthorNames()}
                </p>
                {finalSubtitle && (
                   <p className='text-xs text-c5 font-normal w-full line-clamp-1'>
                     {finalSubtitle}
                   </p>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Footer Type Badge */}
      <div className="flex gap-1.5 items-center">
        <FinalTypeIcon size={14} className={typeColor ? "" : "text-c4/60"} style={typeColor ? { color: typeColor } : {}} />
        <p className='text-sm text-c4/60 font-medium'>{finalTypeLabel}</p>
      </div>

    </div>
  );
};

export const StudentCardSkeleton: React.FC = () => {
    return (
      <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-5 rounded-2xl flex flex-col gap-5 h-full animate-pulse'>
        <div className="flex flex-col gap-2.5 justify-between">
          <div className="w-full aspect-[2/1] h-36 rounded-xl bg-c3/50" />
          <div className="flex flex-col gap-2 mt-2">
            {/* Title lines */}
            <div className="h-4 w-full bg-c3/50 rounded-lg" />
            <div className="h-4 w-3/4 bg-c3/50 rounded-lg" />
            
            {/* Author line */}
            <div className="flex items-center gap-3 mt-px">
              <div className="w-8 h-8 rounded-lg bg-c3/50" />
              <div className="h-6 w-2/4 bg-c3/50 rounded-md" />
            </div>
          </div>
        </div>
        
        {/* Footer badge */}
        <div className="flex items-center gap-2 mt-auto">
            <div className="w-4 h-4 rounded-md bg-c3/50" />
            <div className="h-4 w-2/4 bg-c3/50 rounded-md" />
        </div>
      </div>
    );
  };
