import { useState } from 'react';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { Link } from '@nextui-org/link';
import { ChangeThemeButton } from '@/components/change-theme';
import CreditsModal from '@/components/CreditsModal';
import { SearchModal } from './SearchModal';
import { FaBars, FaTimes } from 'react-icons/fa';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className='w-full flex justify-between items-center'>
      <div className='flex items-center gap-4'>
        <Link href='/' className='flex items-center'>
          <Image width={40} src={Logo} alt='Logo' />
        </Link>
        <div className='hidden lg:flex flex-col justify-center items-start'>
          <h2 className='text-2xl text-default-500 font-semibold'>Séminaire ARCANES</h2>
          <p className='text-lg text-default-400 font-regular'>
            Images trompeuses et modèles d'intelligence artificielle
          </p>
        </div>
      </div>
      <div className='hidden sm:flex items-center gap-6'>
        <SearchModal />
        <ChangeThemeButton />
        <CreditsModal />
      </div>
      <div className='sm:hidden flex items-center'>
        <button onClick={toggleMenu} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className='absolute top-16 right-0 mt-2 w-48 bg-default-100 shadow-lg rounded-lg p-4 flex flex-col gap-4 sm:hidden'>
          <SearchModal />
          <ChangeThemeButton />
          <CreditsModal />
        </div>
      )}
    </nav>
  );
};
