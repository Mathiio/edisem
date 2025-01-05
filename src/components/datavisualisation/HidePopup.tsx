import React, { useState } from 'react';
import { Button, Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ArrowIcon, CrossIcon, PlusIcon, TrashIcon } from '@/components/utils/icons';

import { ITEM_TYPES } from './FilterPopup'; 

type Masque = {
  itemType: string;
  itemValue: string;
};

type HidePopupProps = {
  onHide: (filteredItems: any[]) => void; 
};

const HidePopup: React.FC<HidePopupProps> = ({ onHide }) => {
  const [filterGroups, setFilterGroups] = useState<Masque[]>([]);

  const addMasque = () => {
    setFilterGroups((prev) => [
      ...prev,
      {
        itemType: '',
        itemValue: '',
      },
    ]);
  };

  const removeMasque = (index: number) => {
    setFilterGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const applyMasques = () => {
    const hiddenTypes = filterGroups.map((group) => group.itemValue).filter((value) => value !== '');

    onHide(hiddenTypes);
    onHide(hiddenTypes);
  };

  return (
    <div className='w-full flex flex-col justify-between gap-20 h-full overflow-hidden'>
      <div className='flex flex-col gap-10'>
        <Button
          onClick={addMasque}
          className='text-14 flex justify-start h-[40px] w-full gap-2 rounded-0 text-default-600 bg-transparent'>
          <PlusIcon size={12} />
          Ajouter un masque
        </Button>
        <Divider />
      </div>

      <div className='flex flex-col justify-start h-full gap-2 overflow-y-auto'>
        {filterGroups.map((masque, index) => (
                    {masque.itemType || 'Sélectionner un type'}
          <div key={index} className='flex p-10 rounded-8 bg-default-200'>
            <div className='flex flex-row items-center flex-1 gap-10'>
              <Dropdown className='w-full p-2'>
                <DropdownTrigger className='w-full'>
                  <Button className='text-14 text-default-600 px-2 py-2 flex justify-between gap-10 border-default-400 border-2 rounded-8 w-full'>
                    {Object.entries(ITEM_TYPES).find(([_, value]) => value === masque.itemValue)?.[0] ||
                      'Sélectionner un type'}
                    <ArrowIcon size={12} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  className='w-full'
                  aria-label="Sélectionner un type d'item"
                  selectionMode='single'
                  selectedKeys={[masque.itemValue]}
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0] as string;
                    const updatedMasques = [...filterGroups];
                    updatedMasques[index].itemType =
                      Object.entries(ITEM_TYPES).find(([_, value]) => value === selectedValue)?.[0] || '';
                    updatedMasques[index].itemValue = selectedValue;
                    setFilterGroups(updatedMasques);
                  }}>
                  {Object.entries(ITEM_TYPES).map(([key, value]) => (
                    <DropdownItem className='w-full' key={value}>
                      {key}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Button size='sm' isIconOnly onClick={() => removeMasque(index)}>
                <CrossIcon size={14} className='text-default-600' />
              </Button>
            </div>
        ))}
      </div>

      <div className='flex justify-end gap-2 mt-4'>
        <Button className='gap-5 rounded-8 font-14 p-2 text-default-500 hover:text-default-900 hover:bg-default-300 bg-default-300'>
          Réinitialiser
        </Button>
        <Button
          onClick={applyMasques}
          className='gap-5 rounded-8 font-14 p-2 text-default-900 hover:bg-default-action bg-default-action'>
          Appliquer
        </Button>
      </div>
    </div>
  );
};

export default HidePopup;
