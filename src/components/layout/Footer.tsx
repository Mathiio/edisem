import React from 'react';
import { Image } from '@/theme/components';
import CreditsModal from '@/components/utils/CreditsModal';
import { motion, Variants } from 'framer-motion';
import { Link as RoutLink } from 'react-router-dom';
import Logo from '@/assets/svg/logo.svg';
import { Link } from '@heroui/react';
import { LocationIcon, MailIcon } from '@/components/utils/icons';

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

export const Footer: React.FC = () => {
  return (
    <motion.div
      className='w-full col-span-10 grid grid-cols-12 gap-16 rounded-12 py-16'
      initial='hidden'
      animate='visible'
      variants={containerVariants}>
      <motion.div className='flex col-span-3 flex-col items-start gap-8' variants={navbarVariants}>
        <RoutLink to='/' className='flex items-center gap-2'>
          <Image width={34} src={Logo} alt='Logo' />
          <div className='text-24 text-c6 font-medium'>Arcanes</div>
        </RoutLink>
        <p className='text-16 text-c4 font-extralight transition-all ease-in-out duration-200'>
          Une plateforme d’éditorialisation des séminaires. Une autre manière d’explorer les conférences et les
          conférenciers des séminaires Arcanes.
        </p>
      </motion.div>
      <motion.div className='flex col-span-3 flex-col items-start gap-8' variants={navbarVariants}>
        <h3 className='text-16 text-c6 font-semibold'>Liens</h3>
        <div className='flex flex-col gap-6'>
          <Link href='https://crilcq.arcanes.ca/' className='text-14 text-c5 font-extralight'>
            <div>Arcanes</div>
          </Link>
          <CreditsModal />
          <Link
            href='https://www.youtube.com/channel/UCZT71fTyQaxqf13sNCPZSIA/featured'
            className='flex items-center gap-2'>
            <p className='text-16 text-c5 font-medium'>Youtube</p>
          </Link>
        </div>
      </motion.div>
      <motion.div className='flex col-span-3 flex-col items-start gap-8' variants={navbarVariants}>
        <h3 className='text-16 text-c6 font-semibold'>Support</h3>
        <div className='flex flex-col gap-6'>
          <Link
            href='https://www.youtube.com/channel/UCZT71fTyQaxqf13sNCPZSIA/featured'
            className='flex items-center gap-2'>
            <MailIcon width={12} className='text-c5' />
            <p className='text-16 text-c5 font-medium'>contact@arcanes.ca</p>
          </Link>
          <Link
            href='https://www.youtube.com/channel/UCZT71fTyQaxqf13sNCPZSIA/featured'
            className='flex items-center gap-2'>
            <LocationIcon width={14} className='text-c5' />
            <p className='text-16 text-c5 font-medium'>
              295 Boul. Charest <br />
              Laval QC, G1K 3G8
            </p>
          </Link>
        </div>
      </motion.div>
      <motion.div className='flex col-span-3 flex-col items-start gap-8' variants={navbarVariants}>
        <h3 className='text-16 text-c6 font-semibold'>Nous contacter</h3>
        <div className='flex flex-col gap-6'>
          <Link href='mailto:contact@arcanes.ca' className='text-14 text-c5 font-extralight'>
            <div>Signaler un bug</div>
          </Link>
        </div>
      </motion.div>
      <motion.div
        className='flex col-span-12 justify-center border-t-1 border-c3'
        variants={navbarVariants}></motion.div>
      <p className='w-full col-span-12 text-center text-14 text-c5 font-extralight'>
        Copyright © 2025 Arcanes. Tous droits réservés.
      </p>
    </motion.div>
  );
};
