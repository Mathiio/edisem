import React from 'react';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';

import { ChangeThemeButton } from '@/components/Navbar/change-theme';
import CreditsModal from '@/components/Navbar/CreditsModal';

import { ProfilDropdown } from '@/components/Navbar/ProfilDropdown';

import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

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
  // const [searchQuery, setSearchQuery] = useState('');
  // const navigate = useNavigate();

  // const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter' && searchQuery.trim() !== '') {
  //     navigate(`/recherche?query=${encodeURIComponent(searchQuery)}`);
  //   }
  // };

  return (
    <motion.nav
      className='w-full flex justify-between items-center'
      initial='hidden'
      animate='visible'
      variants={containerVariants}>
      <motion.div className='flex items-center gap-4' variants={navbarVariants}>
        <Link to='/' className='flex items-center'>
          <Image width={40} src={Logo} alt='Logo' />
        </Link>
        <div className='hidden lg:flex flex-col justify-center items-start'>
          <div className='text-24 text-default-500 font-semibold'>Arcanes</div>
        </div>
      </motion.div>

      <motion.div className='flex justify-center items-start gap-10' variants={navbarVariants}>
        {/* <Input
          classNames={{
            base: 'md:w-[400px] w-[300px]',
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <FilterModal /> */}
        <div className='flex flex-wrap justify-between items-center gap-[25px]'>
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
        <CreditsModal />
        <ChangeThemeButton />
        <ProfilDropdown />
      </motion.div>
    </motion.nav>
  );
};
