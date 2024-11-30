import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from '@nextui-org/react';
import { UserIcon, DataIcon, SettingsIcon, Logout, VisualisationIcon } from '@/components/utils/icons';
import { User, Link as NextLink, Avatar } from '@nextui-org/react';
import { Link } from 'react-router-dom';

export const ProfilDropdown: React.FC = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated'); // Supprime l'authentification
    window.location.href = '/'; // Redirige vers la page de connexion
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
        {isAuthenticated ? (
          <DropdownSection showDivider>
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
        ) : (
          <DropdownSection>
            <DropdownItem key='login' className='hover:bg-default-200 text-default-300 hover:text-default-400 hidden'>
              <Link to='/login' className='flex justify-between items-center w-full'>
                <p className='text-default-500 text-16'>Se connecter</p>
                <Logout size={15} />
              </Link>
            </DropdownItem>
          </DropdownSection>
        )}
        <DropdownSection>
          <DropdownItem
            key='preferences'
            classNames={{
              shortcut: 'p-[5px] rounded-8',
            }}
            className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'
            endContent={<SettingsIcon size={15} />}>
            <p className='text-default-500 text-16'>Préférences</p>
          </DropdownItem>
          <DropdownItem key='omeka' className='hover:bg-default-200'>
            <NextLink href='https://tests.arcanes.ca/omk/login' className='w-full'>
              <p className='text-default-500 text-16 '>Omeka S</p>
            </NextLink>
          </DropdownItem>
          <DropdownItem key='visualisation' className='hover:bg-default-200 text-default-300 hover:text-default-400'>
            <Link to='/visualisation' className='flex justify-between items-center w-full'>
              <p className='text-default-500 text-16'>Datavisualisation</p>
              <VisualisationIcon size={15} />
            </Link>
          </DropdownItem>

          {isAuthenticated ? ( // Si l'utilisateur est authentifié, afficher les options de données
            <DropdownItem
              key='database'
              className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
              <Link to='/database' className='flex justify-between items-center w-full'>
                <p className='text-default-500 text-16'>Données</p>
                <DataIcon size={15} />
              </Link>
            </DropdownItem>
          ) : (
            // Si l'utilisateur n'est pas authentifié
            <DropdownItem key='login' className='hover:bg-default-200 text-default-300 hover:text-default-400'>
              <Link to='/login' className='flex justify-between items-center w-full'>
                <p className='text-default-500 text-16'>Se connecter</p>
                <Logout size={15} />
              </Link>
            </DropdownItem>
          )}

          {isAuthenticated ? ( // Si l'utilisateur est authentifié, afficher les options de données
            <DropdownItem
              key='logout'
              className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
              <Link onClick={handleLogout} to='/login' className='flex justify-between items-center w-full'>
                <p className='text-default-500 text-16'>Se déconnecter</p>
                <Logout size={15} />
              </Link>
            </DropdownItem>
          ) : (
            // Si l'utilisateur n'est pas authentifié
            <DropdownItem key='sdqsdqs' className='hover:bg-default-200 text-default-300 hover:text-default-400 hidden'>
              <Link to='/login' className='flex justify-between items-center w-full'>
                <p className='text-default-500 text-16'>Se connecter</p>
                <Logout size={15} />
              </Link>
            </DropdownItem>
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
