import React from 'react';
import { Conference } from '@/types/ui';
import { ConfCard } from '@/components/features/conference/ConfCards';

interface IntervenantInterventionsProps {
  interventions: Conference[];
}

export const IntervenantInterventions: React.FC<IntervenantInterventionsProps> = ({ interventions }) => {
  
  // Helper to filter by type
  const getInterventionsByType = (type: string) => {
    return interventions.filter(item => item.type === type);
  };

  const studyDays = getInterventionsByType('studyday');
  const colloques = getInterventionsByType('colloque');
  const seminars = getInterventionsByType('seminar');
  const experimentations = getInterventionsByType('experimentation');

  const categories = [
    { title: "Journées d'études", items: studyDays },
    { title: "Colloques", items: colloques },
    { title: "Séminaires", items: seminars },
    { title: "Expérimentations", items: experimentations }
  ];

  // Only render categories with items
  const activeCategories = categories.filter(cat => cat.items.length > 0);

  if (activeCategories.length === 0) return null;

  return (
    <div className='w-full flex flex-col items-center gap-50'>
        <div className='flex flex-col gap-2 justify-center items-center'>
            <h2 className='text-c6 text-32 transition-all ease-in-out'>Interventions</h2>
            <p className='text-16 text-c5'>Retrouvez les participations classées par catégorie</p>
        </div>

        <div className="w-full flex flex-col gap-50">
            {activeCategories.map((category, index) => (
                <div key={index} className="flex flex-col gap-25">
                    <h3 className="text-24 text-c6 font-regular">{category.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-25">
                        {category.items.map((item, i) => (
                            <ConfCard key={i} {...item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
