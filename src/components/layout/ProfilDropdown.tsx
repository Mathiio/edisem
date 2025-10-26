import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { UserIcon, VisualisationIcon, DataIcon, Logout, SunIcon, MoonIcon } from '@/components/ui/icons';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, User } from '@heroui/react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useAuth } from '@/hooks/useAuth';

export const ProfilDropdown = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData, logout } = useAuth();
  const { isDark, toggleThemeMode } = useThemeMode();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Optimiser l'accès aux propriétés de userData
  const userFirstName = userData?.firstname;
  const userLastName = userData?.lastname;
  const userTypeValue = userData?.type;

  // Full name for profile triger
  const displayName = useMemo(() => {
    if (userFirstName && userLastName)
      // If userData exist, return full name
      return `${userFirstName} ${userLastName.charAt(0)}.`;
    return userFirstName || userLastName || 'Profil'; // Return whichever is available
  }, [userFirstName, userLastName]);

  // Full name for profile dropdown
  const fullName = useMemo(() => {
    if (userFirstName && userLastName)
      // If userData exist, return full name
      return `${userFirstName} ${userLastName}`;
    return userFirstName || userLastName || 'Utilisateur'; // Return whichever is available
  }, [userFirstName, userLastName]);

  // Convert user type label
  const userType = useMemo(() => {
    switch (userTypeValue) {
      case 'actant':
        return 'Actant';
      case 'etudiant':
        return 'Étudiant';
      default:
        return 'Type non spécifié';
    }
  }, [userTypeValue]);

  return (
    <Dropdown>
      {/* Button trigger for opening the dropdown */}
      <DropdownTrigger className='p-3'>
        <div className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c3 items-center justify-center px-15 py-10 text-16 gap-10 text-c6 transition-all ease-in-out duration-200'>
          {/* User avatar if authenticated, otherwise fallback icon */}
          {isAuthenticated && userData?.picture ? (
            <img src={userData.picture} alt='Avatar' className='w-6 h-6 rounded-[6px] object-cover' />
          ) : (
            <UserIcon size={16} className='text-c6' />
          )}
          {/* Display name or "Profil" */}
          <span className='text-16 font-normal text-c6'>{isAuthenticated ? displayName : 'Profil'}</span>
        </div>
      </DropdownTrigger>

      {/* Main dropdown menu content */}
      <DropdownMenu aria-label='User menu' className='p-10 bg-c2 rounded-12'>
        {isAuthenticated ? (
          // When the user is authenticated
          <>
            {/* Top section with user profile info (readonly) */}
            <DropdownSection showDivider>
              <DropdownItem isReadOnly key='profile' className='opacity-100 p-0'>
                <div className='flex gap-2 items-center w-full bg-c2 hover:bg-c3 px-4 py-2 rounded-8 transition-all ease-in-out duration-200'>
                  <User
                    name={fullName}
                    description={userType}
                    classNames={{
                      name: 'text-c6',
                      description: 'text-c5',
                    }}
                    avatarProps={{
                      src: userData?.picture || undefined,
                      fallback: <UserIcon className='text-c6' size={20} />,
                      size: 'sm',
                      radius: 'sm',
                    }}
                  />
                </div>
              </DropdownItem>
            </DropdownSection>

            <DropdownSection>
              {/* Link to the data visualization page */}
              <DropdownItem key='visualisation' className='p-0 hover:text-c6 text-c5'>
                <Link to='/visualisation' className='flex justify-start gap-2 hover:bg-c3 items-center w-full p-2 rounded-8 transition-all ease-in-out duration-200'>
                  <VisualisationIcon size={14} />
                  <p className='text-16 text-extralight'>Datavisualisation</p>
                </Link>
              </DropdownItem>

              {/* Link to the OmekaS page */}
              <DropdownItem key='database' className='p-0 hover:text-c6 text-c5'>
                <Link to='/database' className='flex justify-start gap-2 hover:bg-c3 items-center w-full p-2 rounded-8 transition-all ease-in-out duration-200'>
                  <DataIcon size={14} />
                  <p className='text-16 text-extralight'>Données</p>
                </Link>
              </DropdownItem>

              {/* Theme toggle button */}
              <DropdownItem key='theme' className='p-0 hover:text-c6 text-c5'>
                <button onClick={toggleThemeMode} className='flex justify-start gap-2 hover:bg-c3 items-center w-full p-2 rounded-8 transition-all ease-in-out duration-200'>
                  {isDark ? <SunIcon size={14} /> : <MoonIcon size={15} />}
                  <span className='text-16 text-extralight'>{isDark ? 'Thème clair' : 'Thème sombre'}</span>
                </button>
              </DropdownItem>

              {/* Logout button */}
              <DropdownItem key='logout' className='p-0 hover:text-c6 text-c5'>
                <button onClick={handleLogout} className='flex justify-start gap-2 hover:bg-c3 items-center w-full p-2 rounded-8 transition-all ease-in-out duration-200'>
                  <Logout size={14} />
                  <p className='text-16 text-extralight'>Se déconnecter</p>
                </button>
              </DropdownItem>
            </DropdownSection>
          </>
        ) : (
          // When the user is not authenticated
          <DropdownSection className='mb-0'>
            {/* Link to Login page */}
            <DropdownItem key='login' className='p-0 hover:text-c6 text-c5'>
              <Link to='/login' className='flex justify-start gap-2 hover:bg-c3 items-center w-full p-2 rounded-8 transition-all ease-in-out duration-200'>
                <UserIcon size={14} />
                <p className='text-16 text-extralight'>Connexion</p>
              </Link>
            </DropdownItem>

            {/* Theme toggle for unauthenticated users */}
            <DropdownItem key='theme' className='p-0 hover:text-c6 text-c5'>
              <button onClick={toggleThemeMode} className='flex justify-start gap-2 hover:bg-c3 items-center w-full p-2 rounded-8 transition-all ease-in-out duration-200'>
                {isDark ? <SunIcon size={14} /> : <MoonIcon size={15} />}
                <span className='text-16 text-extralight'>{isDark ? 'Thème clair' : 'Thème sombre'}</span>
              </button>
            </DropdownItem>
          </DropdownSection>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
