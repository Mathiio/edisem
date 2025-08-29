import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { ProfilDropdown } from '@/components/layout/ProfilDropdown';
import { Link, useLocation } from 'react-router-dom';
import SearchModal, { SearchModalRef } from '@/components/layout/SearchModal';


export const Navbar: React.FC = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const searchModalRef = useRef<SearchModalRef>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isOneOf = (paths: string[]) => paths.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkBaseClass = 'cursor-pointer flex flex-row items-center justify-center px-15 py-10 text-16 gap-10 text-c6 rounded-8 border-2 transition-all ease-in-out duration-200';
  const activeClass = 'bg-c2 border-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)]';
  const hoverClass = 'hover:bg-c2 hover:border-c3 hover:shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] border-transparent';

  return (
    <nav
      className={`flex w-full sticky top-0 z-50 transition-all duration-200 ${hasScrolled ? 'bg-c1/90 backdrop-blur-lg' : 'bg-transparent backdrop-blur-none'}`}
      style={{
        backdropFilter: `brightness(${hasScrolled ? 150 : 100}%) blur(${hasScrolled ? 20 : 0}px)`,
        WebkitBackdropFilter: `brightness(${hasScrolled ? 150 : 100}%) blur(${hasScrolled ? 20 : 0}px)`,
      }}>
      <div className='flex max-w-screen-2xl w-full justify-between p-25 mx-auto'>
        <div className='flex items-center gap-20 w-64'>
          <Link to='/' className='flex items-center gap-2'>
            <Image width={35} src={Logo} alt='Logo' />
            <div className='text-24 text-c6 font-medium'>Arcanes</div>
          </Link>
        </div>

        <div className='flex items-center gap-20'>
          <Link to='/' className={`${linkBaseClass} ${isActive('/') ? activeClass : hoverClass}`}>
            <div className='font-medium'>Accueil</div>
          </Link>

          <Dropdown>
            <DropdownTrigger>
              <div
                className={`${linkBaseClass} ${isOneOf(['/corpus/seminaires', '/corpus/experimentations', '/corpus/oeuvres', '/corpus/journees-etudes', '/corpus/colloques', '/corpus/etudes-de-cas']) ? activeClass : hoverClass}`}>
                <span className='font-normal'>Corpus</span>
              </div>
            </DropdownTrigger>
            <DropdownMenu className='p-10 bg-c2 rounded-12'>
              {[
                { to: '/corpus/seminaires', label: 'Séminaires' },
                { to: '/corpus/oeuvres', label: 'Œuvres' },
                // { to: '/corpus/pratique-narrative', label: 'Pratique narrative' },
                // { to: '/corpus/journees-etudes', label: "Journées d'études" },
                // { to: '/corpus/colloques', label: 'Colloques' },
                { to: '/corpus/experimentations', label: 'Expérimentations' },
              ].map(({ to, label }) => (
                <DropdownItem key={to} className='p-0 text-c5 hover:text-c6'>
                  <Link to={to} className='flex gap-2 w-full p-2 items-center rounded-8 hover:bg-c3 transition-all'>
                    <div className='font-medium text-16 text-c6'>{label}</div>
                  </Link>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Link to='/intervenants' className={`${linkBaseClass} ${isActive('/intervenants') ? activeClass : hoverClass}`}>
            <div className='font-medium'>Intervenants</div>
          </Link>

          <Link to='/visualisation' className={`${linkBaseClass} ${isActive('/visualisation') ? activeClass : hoverClass}`}>
            <div className='font-medium'>Datavisualisation</div>
          </Link>
        </div>

        <div className='flex items-center justify-end gap-10 w-64'>
          <SearchModal ref={searchModalRef} />
          <ProfilDropdown />
        </div>
      </div>
    </nav>
  );
};
