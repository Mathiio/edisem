import React from 'react';
import { UniversityIcon, SchoolIcon, LaboritoryIcon } from '@/components/ui/icons';
import { Skeleton } from '@heroui/react';

interface AffiliationItem {
  name?: string;
  url?: string;
}

interface AffiliationCardProps {
  title: string;
  icon: React.ReactNode;
  items?: AffiliationItem[];
  emptyMessage: string;
  loading?: boolean;
}

const AffiliationCard: React.FC<AffiliationCardProps> = ({ title, icon, items, emptyMessage, loading }) => {
  return (
    <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-25 rounded-20 flex flex-col gap-1.5 h-full'>
      <div className='flex items-center gap-10 border-b border-c3 pb-15'>
        <div className='text-c6'>
          {icon}
        </div>
        <h3 className='text-16 font-medium text-c6'>{title}</h3>
      </div>
      
      <div className='flex flex-col gap-10'>
        {loading ? (
           <div className="flex flex-col gap-10">
              <Skeleton className="h-6 w-3/4 rounded-8" />
              <Skeleton className="h-6 w-1/2 rounded-8" />
           </div>
        ) : items && items.length > 0 ? (
          items.map((item, index) => (
            <a 
              key={index} 
              href={item.url || '#'} 
              target={item.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`text-14 text-c5 font-light transition-colors duration-300 px-4 py-3 hover:bg-c3 rounded-10 ${!item.url ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {item.name}
            </a>
          ))
        ) : (
          <p className='text-14 text-c5 italic opacity-50 px-4 py-3'>{emptyMessage}</p>
        )}
      </div>
    </div>
  );
};

interface IntervenantAffiliationsProps {
  universities?: AffiliationItem[];
  doctoralSchools?: AffiliationItem[];
  laboratories?: AffiliationItem[];
  loading?: boolean;
}

export const IntervenantAffiliations: React.FC<IntervenantAffiliationsProps> = ({ 
  universities, 
  doctoralSchools, 
  laboratories, 
  loading 
}) => {
  return (
    <div className='w-full flex justify-center'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-25 w-[1000px]'>
            <AffiliationCard 
                title="Université(s)" 
                icon={<UniversityIcon size={22} />}
                items={universities}
                emptyMessage="Aucune université affiliée"
                loading={loading}
            />
            <AffiliationCard 
                title="École(s) doctorale(s)" 
                icon={<SchoolIcon size={22} />}
                items={doctoralSchools}
                emptyMessage="Aucune école doctorale affiliée"
                loading={loading}
            />
            <AffiliationCard 
                title="Laboratoire(s)" 
                icon={<LaboritoryIcon size={22} />}
                items={laboratories}
                emptyMessage="Aucun laboratoire affilié"
                loading={loading}
            />
        </div>
    </div>
  );
};
