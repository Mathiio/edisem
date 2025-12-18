import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image } from '@/theme/components';
import Logo from '@/assets/svg/logo.svg';
import { ProfilDropdown } from '@/components/layout/ProfilDropdown';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import {
  ArrowIcon,
  SeminaireIcon,
  StudyDayIcon,
  PratiqueNarrativeIcon,
  ColloqueIcon,
  ExperimentationIcon,
} from '@/components/ui/icons';

interface DropdownItem {
  to: string;
  label: string;
  icon?: React.ElementType;
  variant?: 'main' | 'secondary' | 'simple';
}

interface DropdownSection {
  items: DropdownItem[];
}

interface CustomDropdownProps {
  trigger: React.ReactNode;
  sections: DropdownSection[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ trigger, sections }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

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
          className='shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] absolute top-full columns-3 gap-40 p-25 shadow-2xl left-1/2 -translate-x-1/2 mt-2 bg-c2 rounded-20 border-2 border-c3 z-50 min-w-max'
          style={{
            animation: isAnimating ? 'dropdownDisappear 200ms ease-in forwards' : 'dropdownAppear 200ms ease-out forwards',
          }}>
          <style>{`
            @keyframes dropdownAppear {
              from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes dropdownDisappear {
              from { opacity: 1; transform: translateX(-50%) translateY(0); }
              to { opacity: 0; transform: translateX(-50%) translateY(-8px); }
            }
          `}</style>

          {sections.map((section, sIdx) => (
            <div key={sIdx} className="break-inside-avoid mb-25 flex flex-col gap-5 max-w-[240px]">
              <div className="flex flex-col">
                {section.items.map(({ to, label, icon: Icon, variant = 'simple' }) => {
                  let linkClasses = "flex items-center gap-10 rounded-8 transition-all duration-200 outline-none ";
                  if (variant === 'main') {
                    linkClasses += "text-16 font-medium text-c6 mb-1.5 px-3 py-2 hover:bg-c3 ";
                  } else if (variant === 'secondary') {
                    linkClasses += "text-16 font-normal text-c6 px-3 py-2 hover:bg-c3 ";
                  } else {
                    linkClasses += "text-14 font-normal text-c4 px-3 py-2 hover:bg-c3 ";
                  }

                  return (
                    <Link
                      key={to}
                      to={to}
                      className={linkClasses}
                      onClick={() => setIsOpen(false)}>
                      {Icon && (
                        <Icon
                          size={variant === 'main' ? 18 : 12}
                          className={variant === 'simple' ? 'text-c4' : 'text-c5'}
                        />
                      )}
                      <span className="flex-1">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [seminarEditions, setSeminarEditions] = useState<{ to: string; label: string }[]>([]);
  const [colloqueEditions, setColloqueEditions] = useState<{ to: string; label: string }[]>([]);
  const [studyDayEditions, setStudyDayEditions] = useState<{ to: string; label: string }[]>([]);
  const searchModalRef = useRef<SearchModalRef>(null);
  const location = useLocation();

  const isActive = useMemo(() => (path: string) => location.pathname === path, [location.pathname]);
  const isCorpusPathValue = useMemo(() => location.pathname.startsWith('/corpus'), [location.pathname]);

  // Fixed link generation without top-level await in map
  useEffect(() => {
    const loadData = async () => {
      const {
        getEditions,
        getSeminarConfs,
        getColloqueConfs,
        getStudyDayConfs
      } = await import('@/services/Items');

      try {
        const [
          allEditions,
          seminarConfs,
          colloqueConfs,
          studyDayConfs
        ] = await Promise.all([
          getEditions(),
          getSeminarConfs(),
          getColloqueConfs(),
          getStudyDayConfs()
        ]);

        const allConfs = [...seminarConfs, ...colloqueConfs, ...studyDayConfs];
        const editionConferencesCount = new Map<string, number>();
        allConfs.forEach((c: any) => {
          const edId = String(c.edition);
          editionConferencesCount.set(edId, (editionConferencesCount.get(edId) || 0) + 1);
        });


        // Filter editions that have at least one conference
        const filteredEditions = allEditions.filter((e: any) => (editionConferencesCount.get(String(e.id)) || 0) > 0);
        const sortedEditions = [...filteredEditions].sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
        const seminars: { to: string; label: string }[] = [];
        const colloques: { to: string; label: string }[] = [];
        const studyDays: { to: string; label: string }[] = [];

        sortedEditions.forEach((e: any) => {
          const type = e.editionType?.toLowerCase() || '';
          const item = {
            to: '',
            // label: e.title,
            label: `Édition ${e.season} ${e.year}`
          };

          if (type.includes('colloque')) {
            item.to = `/corpus/colloques/edition/${e.id}`;
            colloques.push(item);
          } else if (type.includes('journée')) {
            item.to = `/corpus/journees-etudes/edition/${e.id}`;
            studyDays.push(item);
          } else {
            // Assume seminar by default or if explicitly named
            item.to = `/corpus/seminaires/edition/${e.id}`;
            seminars.push(item);
          }
        });

        setSeminarEditions(seminars.slice(0, 6));
        setColloqueEditions(colloques.slice(0, 6));
        setStudyDayEditions(studyDays.slice(0, 6));
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const corpusSections: DropdownSection[] = useMemo(
    () => [
      {
        items: [
          { to: '/corpus/pratiques-narratives', label: 'IA & Pratiques narratives', icon: PratiqueNarrativeIcon, variant: 'main' as const },
          { to: '/corpus/mises-en-recits', label: "Mises en récits de l'IA", icon: PratiqueNarrativeIcon, variant: 'secondary' as const },
          { to: '/corpus/recits-artistiques', label: 'Récits Artistiques/Oeuvres', variant: 'simple' as const },
          { to: '/corpus/recits-scientifiques', label: 'Récits Scientifiques', variant: 'simple' as const },
          { to: '/corpus/recits-techno-industriels', label: 'Récits Techno-industriels', variant: 'simple' as const },
          { to: '/corpus/recits-citoyens', label: 'Récits Citoyens', variant: 'simple' as const },
          { to: '/corpus/recits-mediatiques', label: 'Récits Médiatiques', variant: 'simple' as const },
          { to: '/corpus/experimentations', label: 'Expérimentations', icon: ExperimentationIcon, variant: 'secondary' as const },
        ],
      },
      {
        items: [
          { to: '/corpus/seminaires', label: 'Séminaires', icon: SeminaireIcon, variant: 'main' as const },
          ...seminarEditions.map(e => ({ ...e, variant: 'simple' as const })),
        ],
      },
      {
        items: [
          { to: '/corpus/journees-etudes', label: "Journées d'études", icon: StudyDayIcon, variant: 'main' as const },
          ...studyDayEditions.map(e => ({ ...e, variant: 'simple' as const })),
        ],
      },
      {
        items: [
          { to: '/corpus/colloques', label: 'Colloques', icon: ColloqueIcon, variant: 'main' as const },
          ...colloqueEditions.map(e => ({ ...e, variant: 'simple' as const })),
        ],
      },
    ],
    [seminarEditions, colloqueEditions, studyDayEditions],
  );

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
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
      <nav className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${hasScrolled ? 'bg-c1/90 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
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
                    <ArrowIcon className="text-c6 rotate-90" size={14} />
                  </div>
                }
                sections={corpusSections}
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
