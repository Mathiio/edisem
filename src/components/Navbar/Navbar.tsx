import React, { useState } from 'react';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';

import { ChangeThemeButton } from '@/components/Navbar/change-theme';
import CreditsModal from '@/components/Navbar/CreditsModal';

import { ProfilDropdown } from '@/components/Navbar/ProfilDropdown';

import { motion, Variants } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Kbd } from '@nextui-org/react';
import { SearchIcon } from '../Utils/icons';

const navbarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const Navbar: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && search.trim() !== '') {
      navigate(`/recherche?query=${encodeURIComponent(search)}`);
      setSearch('');
    }
  };

  return (
    <motion.nav
      className='w-full flex justify-between items-center'
      initial='hidden'
      animate='visible'
      variants={containerVariants}>
      <motion.div className='flex items-center gap-20' variants={navbarVariants}>
        <Link to='/' className='flex items-center gap-5'>
          <Image width={40} src={Logo} alt='Logo' />
          <div className='text-24 text-default-600 font-bold'>Arcanes</div>
        </Link>
        <div className='h-20 border-1 border-default-400'>
        </div>
        <div className='flex flex-wrap justify-between items-center gap-15'>
          <img className='h-[15px] object-contain' src='/crilcq.png' alt='CRILCQ logo' />
          <img className='h-[25px] object-contain' src='/laval.png' alt='Laval logo' />
          <img className='h-[25px] object-contain' src='/univmtl.png' alt='Université de Montréal logo' />
          <img className='h-[30px] object-contain' src='/uqam.png' alt='UQAM logo' />
          <img className='h-[25px] object-contain' src='/paris8.png' alt='Paris 8 logo' />
          <img className='h-[25px] object-contain' src='/paragraphe.png' alt='Paragraphe logo' />
          <img className='h-[30px] object-contain' src='/sshrc.png' alt='SSHRC CRSH logo' />
        </div>
      </motion.div>

      <motion.div className='flex items-center gap-6' variants={navbarVariants}>
      <Input
          classNames={{
            base: 'md:w-[320px] w-[300px]',
            clearButton: 'bg-default-600',
            mainWrapper: 'h-full',
            input: 'text-default-600 Inter font-semibold text-16 nav_searchbar',
            inputWrapper:
              'group-data-[focus=true]:bg-default-200 rounded-12 font-normal text-default-600 bg-default-200 dark:bg-default-200 p-25 h-[50px]',
          }}
          placeholder='Recherche avancée...'
          size='sm'
          startContent={<SearchIcon size={18} />}
          endContent={
            <Kbd
              className='flex sm:flex text-default-600 text-14 px-[8px] py-5 bg-default-200 gap-5'
              keys={['command']}>
              K
            </Kbd>
          }
          type='search'
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <CreditsModal />
        <ChangeThemeButton />
        <ProfilDropdown />
      </motion.div>
    </motion.nav>
  );
};
