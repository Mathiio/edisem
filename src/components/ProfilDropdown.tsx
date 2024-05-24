import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from '@nextui-org/react';
import { UserIcon } from './icons';
import { User, Link, Avatar } from '@nextui-org/react';

export const ProfilDropdown: React.FC = () => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Link className='cursor-pointer flex flex-col items-center'>
          <UserIcon
            size={22}
            className='text-default-600 hover:text-default-action transition-all ease-in-out duration-200'
          />
        </Link>
      </DropdownTrigger>
      <DropdownMenu variant='light' aria-label='Dropdown menu with description' className='p-10'>
        <DropdownSection showDivider>
          <DropdownItem isReadOnly key='profile' className='h-14 gap-2 opacity-100'>
            <User
              name='Junior Garcia'
              description='@jrgarciadev'
              className='cursor-default'
              classNames={{
                name: 'text-default-600',
                description: 'text-default-500',
              }}
              avatarProps={{
                as: Avatar,
                showFallback: true,
                src: 'https://images.unsplash.com/broken',
                fallback: <UserIcon className='text-default-300' size={25} />,
                size: 'sm',
                radius: 'md',
              }}
            />
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
            classNames={{
              shortcut: 'p-[5px] rounded-8',
            }}
            className='hover:bg-default-100'
            endContent={'+'}>
            Nouveau cahier
          </DropdownItem>
          <DropdownItem key='copy' className='hover:bg-default-100'>
            Préférence
          </DropdownItem>

          <DropdownItem key='edit' className='hover:bg-default-100'>
            Aide
          </DropdownItem>
          <DropdownItem key='edit' className='hover:bg-default-100'>
            Déconnexion
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
/*
<DropdownItem isReadOnly key='theme' className='cursor-default  ' endContent={<ChangeThemeButton />}>
          Thème
        </DropdownItem>

        */
