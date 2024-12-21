import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from '@nextui-org/react';
import { UserIcon, DataIcon, SettingsIcon, Logout, VisualisationIcon } from '@/components/utils/icons';
import { User, Link as NextLink, Avatar } from '@nextui-org/react';
import { Link } from 'react-router-dom';

export const ProfilDropdown: React.FC = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

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
        <DropdownSection showDivider className={isAuthenticated ? 'block' : 'hidden'}>
          <DropdownItem isReadOnly key='profile' className='h-14 gap-2 opacity-100'>
            <User
              name='API'
              description='Admin'
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
          <DropdownItem key='omeka' className='hover:bg-default-200'>
            <NextLink href='https://tests.arcanes.ca/omk/login' className='w-full'>
              <p className='text-default-500 text-16'>Omeka S</p>
            </NextLink>
          </DropdownItem>

          <DropdownItem key='visualisation' className='hover:bg-default-200 text-default-300 hover:text-default-400'>
            <Link to='/visualisation' className='flex justify-between items-center w-full'>
              <VisualisationIcon size={15} />
              <p className='text-default-500 text-16'>Datavisualisation</p>
            </Link>
          </DropdownItem>

          {isAuthenticated ? (
            <>
              <DropdownItem
                key='logout'
                className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
                <Link onClick={handleLogout} to='/login' className='flex justify-start gap-2 items-center w-full'>
                  <Logout size={15} />
                  <p className='text-default-500 text-16'>Se déconnecter</p>
                </Link>
              </DropdownItem>

              <DropdownItem
                key='database'
                className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
                <Link to='/database' className='flex justify-start items-center w-full'>
                  <DataIcon size={15} />
                  <p className='text-default-500 text-16'>Données</p>
                </Link>
              </DropdownItem>
            </>
          ) : (
            <DropdownItem key='login' className='hover:bg-default-200 text-default-300 hover:text-default-400'>
              <Link to='/login' className='flex justify-start gap-2 items-center w-full'>
                <Logout size={15} />
                <p className='text-default-500 text-16'>Se connecter</p>
              </Link>
            </DropdownItem>
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
