import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';
import { UserIcon } from '../Utils/icons';

interface RechercheBarProps {
  Nombre: number;
}

export const RechercheBar: React.FC<RechercheBarProps> = ({ Nombre }) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(['Trier']));

  const selectedValue = React.useMemo(() => {
    const keysArray = Array.from(selectedKeys);
    return keysArray.join(', ').replace(/_/g, ' '); // Use replace with a regex as a workaround
  }, [selectedKeys]);

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
          onSelectionChange={(keys) => setSelectedKeys(new Set(keys as Set<string>))} // Ensure proper type casting
          className='p-10'>
          <DropdownItem key='populaire'>Les plus populaires</DropdownItem>
          <DropdownItem key='croissant'>A-Z</DropdownItem>
          <DropdownItem key='decroissant'>Z-A</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
