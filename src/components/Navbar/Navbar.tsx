import React, { useMemo } from 'react';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { ChangeThemeButton } from '@/components/navbar/change-theme';
import CreditsModal from '@/components/navbar/CreditsModal';
import { AuthDropdown } from '@/components/navbar/ProfilDropdown';
import { motion, Variants } from 'framer-motion';
import { Link as RoutLink } from 'react-router-dom';
import SearchModal from '@/components/navbar/SearchModal';
import { useThemeMode } from '@/hooks/use-theme-mode';

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
  const { isDark, toggleThemeMode } = useThemeMode();

  const logos = useMemo(
    () => [
      { name: 'crilcq', height: '15px' },
      { name: 'laval', height: '25px' },
      { name: 'univmtl', height: '25px' },
      { name: 'uqam', height: '30px' },
      { name: 'paris8', height: '25px' },
      { name: 'paragraphe', height: '25px' },
      { name: 'sshrc', height: '30px' },
    ],
    [],
  );

  const getLogo = (logoName: string) => {
    return isDark ? `/dark_${logoName}.png` : `/${logoName}.png`;
  };

  return (
    <motion.nav
      className='w-full flex justify-between items-center'
      initial='hidden'
      animate='visible'
      variants={containerVariants}>
      <motion.div className='flex items-center gap-20' variants={navbarVariants}>
        <RoutLink to='/' className='flex items-center gap-5'>
          <Image width={34} src={Logo} alt='Logo' />
          <div className='text-24 text-600 font-medium'>Arcanes</div>
        </RoutLink>
        <div className='h-20 border-1 border-400'></div>
        <div className='flex flex-wrap justify-between items-center gap-15'>
          {logos.map((logo) => (
            <img
              key={`${logo.name}-${isDark ? 'dark' : 'light'}`}
              className='object-contain'
              style={{ height: logo.height }}
              src={getLogo(logo.name)}
              alt={`${logo.name} logo`}
            />
          ))}
        </div>
      </motion.div>
      <motion.div className='flex items-center gap-6' variants={navbarVariants}>
        <SearchModal />

        <AuthDropdown />
        <ChangeThemeButton isDark={isDark} toggleTheme={toggleThemeMode} />
      </motion.div>
    </motion.nav>
  );
};
