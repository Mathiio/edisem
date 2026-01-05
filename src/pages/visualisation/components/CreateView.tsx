import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';

// Types d'items disponibles pour la création
const CREATE_TYPES = [
  { key: 'citation', label: 'Citation', image: '/bulle-citation.png', type: 80, config: 'citations' },
  { key: 'conference', label: 'Conférence', image: '/bulle-conference.png', type: 71, config: 'conferences' },
  { key: 'actant', label: 'Conférencier', image: '/bulle-actant.png', type: 72, config: 'conferenciers' },
  { key: 'keyword', label: 'Mot clé', image: '/bulle-keyword.png', type: 34, config: 'motcles' },
  { key: 'pays', label: 'Pays', image: '/bulle-university.png', type: 94, config: 'pays' },
  { key: 'university', label: 'Université', image: '/bulle-university.png', type: 73, config: 'universites' },
  { key: 'laboratory', label: 'Laboratoire', image: '/bulle-university.png', type: 91, config: 'laboratoire' },
  { key: 'doctoralschool', label: 'École doctorale', image: '/bulle-university.png', type: 74, config: 'ecolesdoctorales' },
];

interface CreateViewProps {
  onCreateItem: (typeNumber: number, config: string) => void;
}

export const CreateView: React.FC<CreateViewProps> = ({ onCreateItem }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleTypeSelect = (key: string) => {
    setSelectedType(key);
  };

  const handleCreate = () => {
    if (selectedType) {
      const item = CREATE_TYPES.find((t) => t.key === selectedType);
      if (item) {
        onCreateItem(item.type, item.config);
      }
    }
  };

  const selectedItem = CREATE_TYPES.find((t) => t.key === selectedType);

  return (
    <div className='flex-1 w-full h-full overflow-auto bg-c1 flex flex-col items-center justify-center p-20'>
      <div className='w-full max-w-3xl'>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className='flex flex-col gap-20'>
          {/* Titre */}
          <div className='text-center'>
            <h1 className='text-24 text-c6 font-semibold mb-5'>Créer un élément</h1>
            <p className='text-14 text-c4'>Sélectionnez le type d'élément que vous souhaitez créer</p>
          </div>

          {/* Grille de types - carrés */}
          <div className='grid grid-cols-4 gap-10'>
            {CREATE_TYPES.map((type) => {
              const isSelected = selectedType === type.key;

              return (
                <motion.button
                  key={type.key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTypeSelect(type.key)}
                  className={`
                    aspect-square flex flex-col items-center justify-center gap-8 p-10 rounded-12 border-2 transition-all duration-200 cursor-pointer group
                    ${isSelected ? 'border-action bg-action/10' : 'border-c3 bg-c2 hover:bg-c3 hover:border-c4'}
                  `}>
                  <div className={`w-40 h-40 flex items-center justify-center ${isSelected ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                    <img src={type.image} alt={type.label} className='w-full h-full object-contain' />
                  </div>
                  <span className={`text-12 font-medium text-center leading-tight ${isSelected ? 'text-c6' : 'text-c6'}`}>{type.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Bouton de création */}
          <div className='flex justify-center'>
            <Button
              size='sm'
              color='primary'
              className='bg-action text-selected h-[36px] px-20 disabled:opacity-50 disabled:cursor-not-allowed'
              onPress={handleCreate}
              isDisabled={!selectedType}>
              Créer {selectedItem ? `un(e) ${selectedItem.label}` : 'un élément'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
