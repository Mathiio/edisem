import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Conference } from '@/types/ui';
import { ExperimentationIcon, ThumbnailIcon, UserIcon, EditIcon, TrashIcon } from '@/components/ui/icons';

interface ExpCardProps extends Omit<Conference, 'type'> {
  type?: string;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ExpCard: React.FC<ExpCardProps> = (props) => {
  const { type = 'experimentation', showActions = false, onEdit, onDelete, ...experimentation } = props;
  const navigate = useNavigate();

  const openConf = () => {
    if (type === 'experimentation') {
      navigate(`/corpus/experimentation/${experimentation.id}`);
    } else if (type === 'experimentationStudents') {
      navigate(`/espace-etudiant/experimentation/${experimentation.id}`);
    } else if (type === 'tool') {
      navigate(`/espace-etudiant/outil/${experimentation.id}`);
    } else if (type === 'feedback') {
      navigate(`/espace-etudiant/feedback/${experimentation.id}`);
    }
  };

  const handleEdit = () => {
    if (onEdit && experimentation.id) {
      onEdit(experimentation.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && experimentation.id) {
      onDelete(experimentation.id);
    }
  };

  return (
    <div
      onClick={openConf}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between flex flex-col gap-20 hover:bg-c2 h-full transition-all ease-in-out duration-300 relative group'>
      {/* Actions menu */}
      {showActions && (
        <div className='absolute bottom-20 right-20 z-10 opacity-20 group-hover:opacity-100 transition-opacity duration-200'>
          <Dropdown shouldBlockScroll={false}>
            <DropdownTrigger>
              <button
                onClick={(e) => e.stopPropagation()}
                className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c4 items-center justify-center p-2 text-c6 transition-all ease-in-out duration-200  '>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                  <circle cx='12' cy='5' r='2' />
                  <circle cx='12' cy='12' r='2' />
                  <circle cx='12' cy='19' r='2' />
                </svg>
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Actions' className='bg-c2 rounded-12 border-2 border-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] p-2 min-w-[140px]'>
              <DropdownItem
                key='edit'
                className='hover:bg-c3 text-c6 px-3 py-2 rounded-8 transition-all duration-200'
                startContent={<EditIcon size={14} className='text-c5' />}
                onPress={handleEdit}>
                Modifier
              </DropdownItem>
              <DropdownItem
                key='delete'
                className='hover:bg-c3 text-c6 px-3 py-2 rounded-8 transition-all duration-200'
                startContent={<TrashIcon size={14} className='text-c5' />}
                onPress={handleDelete}>
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}

      <div className='flex flex-col gap-10 justify-between'>
        {/* Thumbnail or placeholder */}
        <div
          className={`w-full h-150 rounded-12 justify-center items-center flex ${experimentation.thumbnail ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'}`}
          style={experimentation.thumbnail ? { backgroundImage: `url(${experimentation.thumbnail})` } : {}}>
          {!experimentation.thumbnail && <ThumbnailIcon className='text-c4/20' size={40} />}
        </div>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='relative'>
            <p className='text-16 text-c6 font-medium line-clamp-2 overflow-hidden'>{experimentation.title}</p>
          </div>

          {/* Author */}
          <div className='flex gap-1.5 items-center'>
            <div className='w-7 h-7 flex items-center justify-center bg-c3 rounded-8'>
              {experimentation.actants?.[0]?.picture ? (
                <img src={experimentation.actants?.[0]?.picture} alt={experimentation.actants?.[0]?.title} className='w-7 h-7 rounded-8 object-cover' />
              ) : (
                <UserIcon className='text-c4' size={12} />
              )}
            </div>
            <p className='text-14 text-c4 font-extralight'>{experimentation.actants?.[0]?.title ? experimentation.actants?.[0]?.title : 'Aucun intervenant'}</p>
          </div>
        </div>
      </div>
      <div className='flex gap-1.5 items-center'>
        <ExperimentationIcon className='text-c4/60' size={14} />
        <p className='text-14 text-c4/60 font-medium'>Expérimentation</p>
      </div>
    </div>
  );
};

export const ExpCardSkeleton: React.FC = () => {
  return (
    <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-20 rounded-18 justify-between flex flex-col gap-20 h-full'>
      <div className='flex flex-col gap-10 justify-between'>
        {/* Image placeholder */}
        <Skeleton className='w-300 h-150 rounded-12'>
          <div className='w-300 h-150 rounded-12 bg-gradient-to-br from-c2 to-c3 flex items-center justify-center'>
            <ThumbnailIcon className='text-c4/20' size={40} />
          </div>
        </Skeleton>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title (2 lines) */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-full rounded-6' />
            <Skeleton className='h-4 w-full rounded-6' />
          </div>

          {/* Actants section */}
          <div className='flex items-center gap-5 mt-2'>
            <Skeleton className='h-4 w-28 rounded-6' />
          </div>
        </div>
      </div>

      {/* Badge "Experimentation" at the bottom */}
      <div className='flex gap-1.5 items-center'>
        <Skeleton className='w-4 h-4 rounded-6' />
        <Skeleton className='h-4 w-16 rounded-6' />
      </div>
    </div>
  );
};
