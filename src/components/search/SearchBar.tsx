import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';
import { UserIcon } from '@/components/Utils/icons';

interface SearchBarProps {
  Nombre: number;
  onSelectionChange: (keys: Set<string>) => void; // Prop de fonction de rappel
}

export const SearchBar: React.FC<SearchBarProps> = ({ Nombre, onSelectionChange }) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(['Croissant']));

  const selectedValue = React.useMemo(() => {
    const keysArray = Array.from(selectedKeys);
    return keysArray.join(', ').replace(/_/g, ' ');
  }, [selectedKeys]);

  const handleSelectionChange = (keys: Set<string>) => {
    setSelectedKeys(keys); 
    onSelectionChange(keys);
  };

  return (
    <div className='flex flex-row place-content-between'>
      <h1 className='text-32 text-default-400'>{Nombre} résultats trouvés</h1>
      <Dropdown>
        <DropdownTrigger>
          <Button startContent={<UserIcon size={15} />} variant='bordered' className='capitalize h-[40px]'>
            {selectedValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label='Single selection example'
          variant='flat'
          disallowEmptySelection
          selectionMode='single'
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => handleSelectionChange(new Set(keys as Set<string>))} 
          className='p-10'>
          <DropdownItem key='croissant'>A-Z</DropdownItem>
          <DropdownItem key='decroissant'>Z-A</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
