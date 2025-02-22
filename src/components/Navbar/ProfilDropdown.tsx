import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  User,
  Avatar,
} from "@heroui/react";
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, VisualisationIcon, DataIcon, Logout } from '@/components/utils/icons';
import { useEffect, useState } from 'react';

export const AuthDropdown = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      console.log(user);
      const userId = localStorage.getItem('userId');
      setIsAuthenticated(!!user || !!userId);

      if (user) {
        setUserData(JSON.parse(user));
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/login')}
        className='px-3 h-[40px] text-14 rounded-8 border-2 border-c3 hover:border-c4 text-c6 transition-all ease-in-out duration-200'>
        Se connecter
      </button>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger className='p-3'>
        <div className='cursor-pointer flex flex-row rounded-8 border-2 border-c3 hover:border-c4 items-center justify-center h-[40px] gap-10 text-c6 transition-all ease-in-out duration-200'>
          {userData?.picture ? (
            <img src={userData.picture} alt='Avatar' className='w-6 h-6 rounded-[7px] object-cover' />
          ) : (
            <UserIcon
              size={22}
              className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200'
            />
          )}
          <span className='text-14 font-normal text-c6'>
            {userData?.firstname && userData?.lastname
              ? `${userData.firstname} ${userData.lastname.charAt(0)}.`
              : userData?.firstname || userData?.lastname || 'Utilisateur'}
          </span>
        </div>
      </DropdownTrigger>

      <DropdownMenu aria-label='User menu' className='p-15'>
        <DropdownSection showDivider>
          <DropdownItem isReadOnly key='profile' className='h-14 gap-2 opacity-100'>
            <User
              name={
                userData?.firstname && userData?.lastname
                  ? `${userData.firstname} ${userData.lastname}`
                  : userData?.firstname || userData?.lastname || 'Utilisateur'
              }
              description={
                userData?.type === 'actant'
                  ? 'Actant'
                  : userData?.type === 'Student'
                  ? 'Étudiant'
                  : userData?.type || 'Type non spécifié'
              }
              classNames={{
                name: 'text-default-600',
                description: 'text-default-500',
              }}
              avatarProps={{
                src: userData?.picture || undefined,
                fallback: <UserIcon className='text-default-800' size={20} />,
                size: 'sm',
                radius: 'md',
              }}
            />
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem key='visualisation' className='hover:bg-default-200 text-default-300 hover:text-default-400'>
            <Link to='/visualisation' className='flex justify-start gap-2 items-center w-full'>
              <VisualisationIcon size={15} />
              <p className='text-default-500 text-16'>Datavisualisation</p>
            </Link>
          </DropdownItem>

          <DropdownItem
            key='database'
            className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
            <Link to='/database' className='flex justify-start gap-2 items-center w-full'>
              <DataIcon size={15} />
              <p className='text-default-500 text-16'>Données</p>
            </Link>
          </DropdownItem>

          <DropdownItem key='logout' className='rounded-8 hover:bg-default-200 text-default-300 hover:text-default-400'>
            <Link onClick={handleLogout} to='/login' className='flex justify-start gap-2 items-center w-full'>
              <Logout size={15} />
              <p className='text-default-500 text-16'>Se déconnecter</p>
            </Link>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
