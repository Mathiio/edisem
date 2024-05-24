import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { Link, Input, Kbd } from '@nextui-org/react';
import { ChangeThemeButton } from '@/components/change-theme';
import CreditsModal from '@/components/CreditsModal';
import { SearchModal } from './SearchModal';
import { ProfilDropdown } from './ProfilDropdown';
import { SearchIcon } from './icons';

export const Navbar = () => {
  return (
    <nav className='w-full flex justify-between items-center'>
      <div className='flex items-center gap-4'>
        <Link href='/' className='flex items-center'>
          <Image width={40} src={Logo} alt='Logo' />
        </Link>
        <div className='hidden lg:flex flex-col justify-center items-start'>
          <div className='text-24 text-default-500 font-semibold'>Arcanes</div>
        </div>
      </div>

      <Input
        classNames={{
          base: 'md:w-[400px] w-[300px]  ',
          clearButton: 'bg-default-600',
          mainWrapper: 'h-full ',
          input: 'text-default-600 Inter font-semibold text-16 nav_searchbar',
          inputWrapper:
            'group-data-[focus=true]:bg-default-200 rounded-12 font-normal text-default-600 bg-default-200 dark:bg-default-200 p-25 h-[50px]',
        }}
        placeholder='Recherche avancée...'
        size='sm'
        startContent={<SearchIcon size={18} />}
        endContent={
          <Kbd className='flex sm:flex text-default-600 text-14 px-[8px] py-5 bg-default-200 gap-5' keys={['command']}>
            K
          </Kbd>
        }
        type='search'
        fullWidth
      />
      <SearchModal />
      <div className='flex items-center gap-6'>

        <CreditsModal />

        <ChangeThemeButton />

        <ProfilDropdown />
      </div>
    </nav>
  );
};
