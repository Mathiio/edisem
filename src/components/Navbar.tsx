import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';

import { Link } from '@nextui-org/link';

import { ChangeThemeButton } from '@/components/change-theme';
import CreditsModal from '@/components/CreditsModal';

import { SearchModal } from './SearchModal';

export const Navbar = () => {
  return (
    <nav className='w-full flex justify-between'>
      <div className='flex justify-between items-center gap-10'>
        <Link href='/' className='flex items-center'>
          <Image width={40} src={Logo} alt='Logo' />
        </Link>
        <div className='flex flex-col justify-center items-start gap-5'>
          <h2 className='text-24 text-default-500 font-semibold'>Séminaire ARCANES</h2>
          <p className='text-16 text-default-400 font-regular'>
            Images trompeuses et modèles d'intelligence artificielle
          </p>
        </div>
      </div>
      <div className='flex justify-between items-center gap-25'>
        <SearchModal />

        <ChangeThemeButton />
        <CreditsModal />
      </div>
    </nav>
  );
};
