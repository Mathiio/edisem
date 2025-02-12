import React, { useEffect, useState } from 'react';
import { Button, Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Link } from '@nextui-org/react';
import { ArrowIcon, CrossIcon, PlusIcon } from '@/components/utils/icons';
import { ITEM_TYPES } from './FilterPopup';

type Masque = {
  itemType: string;
  displayType: string;
};

interface HidePopupProps {
  onHide: () => void;
}

const getDisplayKeyByValue = (value: string): string => {
  return Object.entries(ITEM_TYPES).find(([_, val]) => val === value)?.[0] || value;
};

const getInitialMasques = (): Masque[] => {
  const savedMasques = localStorage.getItem('hideGroups');
  if (savedMasques) {
    try {
      const parsedMasques = JSON.parse(savedMasques);
      return parsedMasques.map((masque: any) => ({
        itemType: masque.itemType,
        displayType: getDisplayKeyByValue(masque.itemType)
      }));
    } catch (e) {
      console.error('Error parsing saved masques:', e);
    }
  }
  return [];
};

const updateLocalStorage = (masques: Masque[]) => {
  console.log('Updating local storage');
  const masquesToSave = masques.map(({ itemType }) => ({ itemType }));
  localStorage.setItem('hideGroups', JSON.stringify(masquesToSave));
};

const HidePopup: React.FC<HidePopupProps> = ({ onHide }) => {
  const [filterGroups, setFilterGroups] = useState<Masque[]>(getInitialMasques());

  useEffect(() => {
    updateLocalStorage(filterGroups);
  }, [filterGroups]);

  useEffect(() => {
    const savedMasques = getInitialMasques();
    if (savedMasques.length > 0) {
      setFilterGroups(savedMasques);
    }
  }, []);

  const addMasque = () => {
    const newMasques = [
      ...filterGroups,
      {
        itemType: '',
        displayType: ''
      },
    ];
    setFilterGroups(newMasques);
    updateLocalStorage(newMasques);
  };

  const removeMasque = (index: number) => {
    const newMasques = filterGroups.filter((_, i) => i !== index);
    setFilterGroups(newMasques);
    updateLocalStorage(newMasques);
  };

  const applyMasques = () => {
    updateLocalStorage(filterGroups);
    onHide();
  };

  const resetMasques = () => {
    setFilterGroups([]);
    localStorage.removeItem('hideGroups');
    onHide();
  };

  const handleSelectionChange = (index: number, displayType: string) => {
    const itemType = ITEM_TYPES[displayType as keyof typeof ITEM_TYPES];
    const updatedMasques = [...filterGroups];
    updatedMasques[index] = {
      itemType,
      displayType
    };
    setFilterGroups(updatedMasques);
    updateLocalStorage(updatedMasques);
  };

  return (
    <div className='w-full flex flex-col justify-between gap-20 h-full overflow-hidden'>
      <div className='flex flex-col gap-4'>
        <Link
          onClick={addMasque}
          underline='none'
          size='sm'
          className='text-14 flex justify-start w-full gap-2 rounded-0 text-c6 bg-transparent cursor-pointer'>
          <PlusIcon size={12} />
          Ajouter un masque
        </Link>
        <Divider />
      </div>

      <div className='flex flex-col justify-start h-full gap-2 overflow-y-auto'>
        {filterGroups.map((masque, index) => (
          <div key={index} className='flex flex-row items-center gap-2'>
            <Dropdown className='w-full p-2'>
              <DropdownTrigger className='w-full'>
                <Button className='text-14 text-c6 px-2 py-2 flex bg-transparent justify-between gap-10 bg-c4 border-2 rounded-8 w-full'>
                  {masque.displayType || 'Sélectionner un type'}
                  <ArrowIcon size={12} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                className='w-full'
                aria-label="Sélectionner un type d'item"
                selectionMode='single'
                selectedKeys={[masque.displayType]}
                onSelectionChange={(keys) => {
                  const displayType = Array.from(keys)[0] as string;
                  handleSelectionChange(index, displayType);
                }}>
                {Object.entries(ITEM_TYPES).map(([key, _]) => (
                  <DropdownItem className='w-full' key={key}>
                    {key}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button size='sm' isIconOnly onClick={() => removeMasque(index)}>
              <CrossIcon size={14} className='text-c6' />
            </Button>
          </div>
        ))}
      </div>

      <div className='flex justify-end gap-2 mt-4'>
        <Button className='px-10 py-5 rounded-8 bg-transparent' variant='flat' onClick={resetMasques}>
          Réinitialiser
        </Button>
        <Button
          className='px-10 py-5 rounded-8 bg-action text-selected'
          color='primary'
          onClick={applyMasques}>
          Appliquer
        </Button>
      </div>
    </div>
  );
};

export default HidePopup;