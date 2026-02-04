import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { ResourceCard, ResourceCardSkeleton } from '@/components/ui/ResourceCard';
import { Conference } from '@/types/ui';
import { ExperimentationIcon, EditIcon, TrashIcon } from '@/components/ui/icons';

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

  // Helper to extract authors for ResourceCard
  const getAuthors = () => {
      const people = experimentation.actants || [];
      if (!Array.isArray(people)) return [];
      
      return people.map(p => ({
          name: `${p.firstname || p.firstName || ''} ${p.lastname || p.lastName || ''}`.trim() || p.title || p.name || '',
          picture: p.picture
      })).filter(a => a.name);
  };

  // Helper to extract universities strings for subtitle
  const getSubtitle = () => {
    const people = experimentation.actants || [];
    if (!Array.isArray(people) || people.length === 0) return undefined;

    const universities = people
      .flatMap((person) => {
        const univs = person?.universite || person?.universities || person?.affiliations || [];
        return Array.isArray(univs) ? univs : [];
      })
      .filter(Boolean);

    if (universities.length === 0) return undefined;

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

  return (
    <ResourceCard 
        title={experimentation.title}
        thumbnailUrl={experimentation.thumbnail}
        onClick={openConf}
        authors={getAuthors()}
        subtitle={getSubtitle()}
        typeLabel="Expérimentation"
        TypeIcon={ExperimentationIcon}
        actions={actions}
    />
  );
};

export const ExpCardSkeleton: React.FC = () => {
    return <ResourceCardSkeleton />;
};
