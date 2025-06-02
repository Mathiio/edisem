import React, { useEffect, useMemo, useState } from 'react';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { ChangeThemeButton } from '@/components/navbar/change-theme';
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
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setHasScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`flex flex-row w-full transition-all ease-in-out duration-200 sticky top-0 z-50 ${
        hasScrolled ? 'bg-c1/90 backdrop-blur-lg' : 'bg-transparent backdrop-blur-none'
      }`}
      initial='hidden'
      animate='visible'
      variants={containerVariants}
      style={{
        backdropFilter: `brightness(${hasScrolled ? 150 : 100}%)  blur(${hasScrolled ? 20 : 0}px)`,
        WebkitBackdropFilter: `brightness(${hasScrolled ? 150 : 100}%)  blur(${hasScrolled ? 20 : 0}px)`,
      }}>
      <div className='flex flex-row max-w-screen-2xl w-full justify-between col-span-10 p-25   mx-auto'>
        <motion.div className='flex items-center gap-20' variants={navbarVariants}>
          <RoutLink to='/' className='flex items-center gap-2'>
            <Image width={26} src={Logo} alt='Logo' />
            <div className='text-24 text-c6 font-medium'>Arcanes</div>
          </RoutLink>
          <div className='h-20 border-1 border-c6'></div>
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
        <motion.div className='flex items-center gap-10' variants={navbarVariants}>
          <SearchModal />
          <AuthDropdown />
          <ChangeThemeButton isDark={isDark} toggleTheme={toggleThemeMode} />
        </motion.div>
      </div>
    </motion.nav>
  );
};
