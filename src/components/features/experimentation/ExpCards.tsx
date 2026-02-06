import React from 'react';

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { ResourceCard, ResourceCardSkeleton } from '@/components/features/corpus/ResourceCard';
import { Conference } from '@/types/ui';
import { ExperimentationIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { getResourceAuthors, getResourceSubtitle } from '@/lib/resourceUtils';

interface ExpCardProps extends Omit<Conference, 'type'> {
  type?: string;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ExpCard: React.FC<ExpCardProps> = (props) => {
  const { type = 'experimentation', showActions = false, onEdit, onDelete, ...experimentation } = props;


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

  // Actions Dropdown
  const actions = showActions ? (
     <Dropdown shouldBlockScroll={false}>
        <DropdownTrigger>
          <button
            onClick={(e) => e.stopPropagation()}
            className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c4 items-center justify-center p-2 text-c6 transition-all ease-in-out duration-200'
          >
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
            onPress={handleEdit}
          >
            Modifier
          </DropdownItem>
          <DropdownItem
            key='delete'
            className='hover:bg-c3 text-c6 px-3 py-2 rounded-8 transition-all duration-200'
            startContent={<TrashIcon size={14} className='text-c5' />}
            onPress={handleDelete}
          >
            Supprimer
          </DropdownItem>
        </DropdownMenu>
     </Dropdown>
  ) : undefined;

  return (
    <ResourceCard 
        title={experimentation.title}
        thumbnailUrl={experimentation.thumbnail}
        authors={getResourceAuthors(experimentation)}
        subtitle={getResourceSubtitle(experimentation)}
        type={type}
        TypeIcon={ExperimentationIcon}
        actions={actions}
        item={{ ...experimentation, type }}
    />
  );
};

export const ExpCardSkeleton: React.FC = () => {
    return <ResourceCardSkeleton />;
};
