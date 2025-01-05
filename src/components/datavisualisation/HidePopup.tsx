import React, { useState } from 'react';
import { Button, Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Link } from '@nextui-org/react';
import { ArrowIcon, CrossIcon, PlusIcon, TrashIcon } from '@/components/utils/icons';

import { ITEM_TYPES } from './FilterPopup';

type Masque = {
  itemType: string;
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
      },
    ]);
  };

  const removeMasque = (index: number) => {
    setFilterGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const applyMasques = () => {
    const hiddenTypes = filterGroups.map((group) => group.itemType);

    onHide(hiddenTypes);
  };

  return (
    <div className='w-full flex flex-col justify-between gap-20 h-full overflow-hidden'>
      <div className='flex flex-col gap-4'>
        <Link
          onClick={addMasque}
          underline='none'
          size={'sm'}
          className='text-14 flex justify-start w-full gap-2 rounded-0 text-default-700 bg-transparent cursor-pointer'>
          <PlusIcon size={12} />
          Ajouter un masque
        </Link>
        <Divider />
      </div>

      <div className='flex flex-col justify-start h-full gap-2 overflow-y-auto'>
        {filterGroups.map((masque, index) => (
          <div key={index} className='flex flex-row items-center gap-2'>
            <Dropdown className=' w-full p-2'>
              <DropdownTrigger className=' w-full'>
                <Button className='text-14 text-default-600 px-2 py-2 flex bg-transparent justify-between gap-10 border-default-300 border-2 rounded-8 w-full'>
                  {masque.itemType || 'Sélectionner un type'}
                  <ArrowIcon size={12} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                className='w-full'
                aria-label="Sélectionner un type d'item"
                selectionMode='single'
                selectedKeys={[masque.itemType]}
                onSelectionChange={(keys) => {
                  const type = Array.from(keys)[0] as string;
                  const updatedMasques = [...filterGroups];
                  updatedMasques[index].itemType = type;
                  setFilterGroups(updatedMasques);
                }}>
                {Object.entries(ITEM_TYPES).map(([key, _]) => (
                  <DropdownItem className=' w-full' key={key}>
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
        <Button className='px-10 py-5 rounded-8 bg-transparent' variant='flat'>
          Réinitialiser
        </Button>
        <Button
          className='px-10 py-5 rounded-8 bg-default-action text-default-selected'
          color='primary'
          onClick={applyMasques}>
          Appliquer
        </Button>
      </div>
    </div>
  );
};

export default HidePopup;
