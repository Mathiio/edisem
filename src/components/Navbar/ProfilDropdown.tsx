import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from '@nextui-org/react';
import { UserIcon, DataIcon, SettingsIcon } from '../utils/icons';
import { User, Link as NextLink, Avatar } from '@nextui-org/react';
import { Link } from 'react-router-dom';

export const ProfilDropdown: React.FC = () => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <NextLink className='cursor-pointer flex flex-col items-center'>
          <UserIcon
            size={22}
            className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200'
          />
        </NextLink>
      </DropdownTrigger>
      <DropdownMenu variant='light' aria-label='Dropdown menu with description' className='p-10'>
        <DropdownSection showDivider>
          <DropdownItem isReadOnly key='profile' className='h-14 gap-2 opacity-100'>
            <User
              name='Junior Garcia'
              description='Étudiant'
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
          {/* <DropdownItem
            classNames={{
              shortcut: 'p-[5px] rounded-8',
            }}
            className='hover:bg-default-200 text-default-300 hover:text-default-400'
            endContent={<AddIcon size={15} />}>
            <p className='text-default-500'>Nouveau cahier</p>
          </DropdownItem> */}

          <DropdownItem
            key='copy'
            classNames={{
              shortcut: 'p-[5px] rounded-8',
            }}
            className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'
            endContent={<SettingsIcon size={15} />}>
            <p className='text-default-500 text-16'>Préférences</p>
          </DropdownItem>

          <DropdownItem className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
            <Link to='/database' className='flex justify-between items-center w-full'>
              <p className='text-default-500 text-16'>Données</p>
              <DataIcon size={15} />
            </Link>
          </DropdownItem>

          <DropdownItem key='edit' className='hover:bg-default-200'>
            <NextLink href='https://tests.arcanes.ca/omk/login' className='w-full'>
              <p className='text-default-500 text-16 '>Omeka S</p>
            </NextLink>
          </DropdownItem>

          {/* <DropdownItem key='edit' className='hover:bg-default-200 text-default-500'>
            Aide
          </DropdownItem> */}
          {/* <DropdownItem
            key='edit'
            classNames={{
              shortcut: 'p-[5px] rounded-8',
            }}
            className='hover:bg-default-200 text-default-300 hover:text-default-400'
            endContent={<ExitIcon size={15} />}>
            <p className='text-default-500'>Déconnexion</p>
          </DropdownItem> */}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
