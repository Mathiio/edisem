import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { Link } from '@nextui-org/link';
import { ChangeThemeButton } from '@/components/change-theme';
import CreditsModal from '@/components/CreditsModal';
import { SearchModal } from './SearchModal';

export const Navbar = () => {

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
      <div className='flex items-center gap-6'>
        <SearchModal />
        <ChangeThemeButton />
        <CreditsModal />
      </div>
    </nav>
  );
};
