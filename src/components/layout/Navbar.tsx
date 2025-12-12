import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { ProfilDropdown } from '@/components/layout/ProfilDropdown';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';

interface DropdownItem {
  to: string;
  label: string;
}

interface CustomDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const location = useLocation();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
    setIsAnimating(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsAnimating(true);
      // Attendre la fin de l'animation avant de retirer du DOM
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 200);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={dropdownRef} className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {trigger}

      {isOpen && (
        <div
          className='absolute top-full p-[5px] flex flex-col left-1/2 -translate-x-1/2 mt-2 min-w-[220px] bg-c3 border-2 border-c3 rounded-8 shadow-lg overflow-hidden z-50'
          style={{
            animation: isAnimating ? 'dropdownDisappear 200ms ease-in forwards' : 'dropdownAppear 200ms ease-out forwards',
          }}>
          <style>{`
            @keyframes dropdownAppear {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
            @keyframes dropdownDisappear {
              from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
              to {
                opacity: 0;
                transform: translateX(-50%) translateY(-8px);
              }
            }
          `}</style>

          {items.map(({ to, label }) => {
            const isItemActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`
                  block rounded-8 px-15 py-15 text-14 text-c6 transition-all duration-200
                  ${isItemActive ? 'bg-c1 text-white' : 'hover:bg-c2 hover:text-white'}
                `}
                onClick={() => setIsOpen(false)}>
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Icône chevron personnalisée (pour remplacer lucide-react)
const ChevronDown = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='6 9 12 15 18 9'></polyline>
  </svg>
);

export const Navbar: React.FC = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const searchModalRef = useRef<SearchModalRef>(null);
  const location = useLocation();

  const isActive = useMemo(() => (path: string) => location.pathname === path, [location.pathname]);
  const isCorpusPathValue = useMemo(() => location.pathname.startsWith('/corpus'), [location.pathname]);

  const corpusItems = useMemo(
    () => [
      { to: '/corpus/seminaires', label: 'Séminaires' },
      { to: '/corpus/oeuvres', label: 'Œuvres' },
      { to: '/corpus/journees-etudes', label: "Journées d'études" },
      { to: '/corpus/pratiques-narratives', label: 'IA & Pratiques narratives' },
      { to: '/corpus/colloques', label: 'Colloques' },
      { to: '/corpus/experimentations', label: 'Expérimentations' },
    ],
    [],
  );

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchModalRef.current?.openWithSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const linkBaseClass = 'cursor-pointer flex flex-row items-center justify-center px-15 py-10 text-16 gap-10 text-c6 rounded-8 border-2 transition-all ease-in-out duration-200';
  const activeClass = 'bg-c2 border-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)]';
  const hoverClass = 'hover:bg-c2 hover:border-c3 hover:shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] border-transparent';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${hasScrolled ? 'bg-c1/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
        <div className='max-w-screen-2xl mx-auto px-20 py-15'>
          <div className='flex items-center justify-between'>
            <Link to='/' className='flex items-center gap-15'>
              <Image src={Logo} alt='Arcanes' className='h-40' />
              <div className='text-24 text-c6 font-medium'>Arcanes</div>
            </Link>

            <div className='flex items-center gap-10'>
              <CustomDropdown
                trigger={
                  <div className={`${linkBaseClass} ${isCorpusPathValue ? activeClass : `${hoverClass}`}`}>
                    Corpus
                    <ChevronDown />
                  </div>
                }
                items={corpusItems}
              />

              <Link to='/intervenants' className={`${linkBaseClass} ${isActive('/intervenants') ? activeClass : hoverClass}`}>
                Intervenants
              </Link>

              <Link to='/datavisualisation' className={`${linkBaseClass} ${isActive('/datavisualisation') ? activeClass : hoverClass}`}>
                Datavisualisation
              </Link>
            </div>
            <div className='flex items-center gap-10'>
              <SearchModal ref={searchModalRef} />

              <ProfilDropdown />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
