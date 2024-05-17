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
      <div className='flex justify-between items-center gap-10'>
        <Link href='/' className='flex items-center'>
          <Image width={40} src={Logo} alt='Logo' />
        </Link>
        <div className='flex flex-col justify-center items-start gap-5'>
          <h2 className='text-24 text-500 font-semibold'>Séminaire ARCANES</h2>
          <p className='text-16 text-400 font-regular'>
            Images trompeuses et modèles d'intelligence artificielle
          </p>
        </div>
      </div>
      <div className='flex justify-between items-center gap-25'>
        <Button className='bg-default-200 hover:bg-default-300 flex items-center gap-10 p-25'>
          <SearchIcon className='text-500' size={20}/>
          <p className='text-500 text-16 font-regular'>Recherche avancée...</p>
          <Kbd className='text-400 text-sm p-5 bg-200 gap-5' keys={['command']}>
            K
          </Kbd>
        </Button>
        <ChangeThemeButton/>
        <CreditsModal/>
      </div>
    </nav>
  );
};
