import React, { useState, useRef, useEffect } from 'react';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';

import { ChangeThemeButton } from '@/components/Navbar/change-theme';
import CreditsModal from '@/components/Navbar/CreditsModal';

import { ProfilDropdown } from '@/components/Navbar/ProfilDropdown';

import { motion, Variants } from 'framer-motion';
import { Link  as RoutLink } from 'react-router-dom';
import SearchModal from './SearchModal';



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

  return (
    <motion.nav
      className='w-full flex justify-between items-center'
      initial='hidden'
      animate='visible'
      variants={containerVariants}>
      <motion.div className='flex items-center gap-20' variants={navbarVariants}>
        <RoutLink to='/' className='flex items-center gap-5'>
          <Image width={40} src={Logo} alt='Logo' />
          <div className='text-24 text-default-600 font-bold'>Arcanes</div>
        </RoutLink>
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
        <SearchModal/>
        <CreditsModal />
        <ChangeThemeButton />
        <ProfilDropdown />
      </motion.div>
    </motion.nav>
  );
};
