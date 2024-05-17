import { Image } from '@/theme/components';
import { useState } from 'react';
import Logo from '@/assets/svg/logo.svg';
import { Kbd } from '@nextui-org/kbd';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';
import { ChangeThemeButton } from '@/components/change-theme';
import  CreditsModal from '@/components/CreditsModal';
import { SearchIcon } from '@/components/icons';

export const Navbar = () => {
  return (
    <nav className='w-full flex justify-between'>
      <div className='flex justify-between items-center gap-2.5'>
        <Link href='/' className='flex space-x-4'>
          <Image width={40} src={Logo} alt='Logo' />
        </Link>
        <div className='flex flex-col justify-center items-start'>
          <h2 className='text-md text-black text-default-600 font-semibold'>Séminaire ARCANES</h2>
          <p className='text-sm text-black text-default-500 font-normal'>
            Images trompeuses et modèles d'intelligence artificielle
          </p>
        </div>
      </div>
      <div className='flex justify-between items-center gap-6'>
        <Button className='bg-default-200 hover:bg-default-300 flex items-center gap-xs'>
          <SearchIcon className='text-default-600' size={20}/>
          <p className='text-default-600 text-sm'>Recherche avancée... </p>
          <Kbd className='default-600 text-sm' keys={['command']}>
            K
          </Kbd>
        </Button>
        <CreditsModal/>
        <ChangeThemeButton className='text-default-600 hover:text-secondary-400' />
      </div>
    </nav>
  );
};
