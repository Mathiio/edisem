import { FC } from 'react';
// import { ArrowIcon } from '@/components/utils/icons';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { ITEM_TYPES } from './FilterPopup';

interface MasquesProps {
  groupId: string;
  visibleTypes: string[];

  availableTypes: string[];
  availableControl: boolean;
}

const Masques: FC<MasquesProps> = ({ groupId, visibleTypes = [], availableTypes, availableControl }) => {
  return (
    <div
      className={` p-4 rounded-xl transition-opacity duration-300 ${
        availableControl ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
      <Dropdown className=' p-1.5 rounded-12 shadow-lg flex flex-col gap-3 bg-c2'>
        <DropdownTrigger className='bg-c2'>
          <Button size='lg' className='px-4 py-4 flex justify-between gap-2 text-c6 rounded-8 '>
            Masquage {groupId}
          </Button>
        </DropdownTrigger>
        <DropdownMenu variant='flat' className='gap-1.5'>
          {Object.entries(ITEM_TYPES)
            .filter(([, type]) => availableTypes.includes(type))
            .map(([label, type]) => {
              const isActive = visibleTypes.includes(type);
              return (
                <DropdownItem key={type} className='pr-0'>
                  <div
                    className='flex items-center justify-start gap-0.5 transition-opacity duration-150'
                    style={{ opacity: isActive ? 1 : 0.3 }}>
                    <img src={`/bulle-${type}.png`} alt={label} className='w-7' />
                    <p className='text-c6 text-14'>{label.charAt(0).toUpperCase() + label.slice(1)}</p>
                  </div>
                </DropdownItem>
              );
            })}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Masques;
