import React, { useState } from 'react';
import { useDisclosure } from '@heroui/react';
import { Layouts } from '@/components/layout/Layouts';
import { CreateView } from './visualisation/components/CreateView';
import { CreateModal } from '@/components/features/database/CreateModal';
import { useLocalStorageProperties } from '@/hooks/useLocalStorageProperties';

export const CreerPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { itemPropertiesData, propertiesLoading } = useLocalStorageProperties();

  const [createItemId, setCreateItemId] = useState<number | null>(null);
  const [selectedConfigKey, setSelectedConfigKey] = useState<string | null>(null);

  const handleCreateItem = (typeNumber: number, config: string) => {
    setCreateItemId(typeNumber);
    setSelectedConfigKey(config);
    onOpen();
  };

  return (
    <Layouts className='flex flex-col col-span-10 gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-medium text-c6'>Créer un élément</h1>
          <p className='text-sm text-c5 mt-1'>Sélectionnez le type d'élément à ajouter à la base de données</p>
        </div>
      </div>

      <CreateView onCreateItem={handleCreateItem} />

      {createItemId && (
        <CreateModal
          isOpen={isOpen}
          onClose={onClose}
          activeConfig={selectedConfigKey}
          itemPropertiesData={itemPropertiesData}
          propertiesLoading={propertiesLoading}
          itemId={createItemId}
        />
      )}
    </Layouts>
  );
};
