import { SearchIcon } from '@/components/ui/icons';
import React, { useState, useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Input, Kbd, Modal, ModalContent, ModalBody, useDisclosure } from '@heroui/react';
import { IntervenantLongCard, IntervenantLongCardSkeleton } from '@/components/features/intervenants/IntervenantCards';
import { ConfCard, ConfSkeleton } from '@/components/layout/ConfCard';
import { motion, Variants } from 'framer-motion';
import * as Items from '@/lib/Items';
import { Conference } from '@/types/ui';
import { SearchModalCard } from '@/components/features/oeuvres/OeuvresCards';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

export interface SearchModalRef {
  openWithSearch: (searchTerm: string) => void;
  notrigger: boolean;
}

interface SearchModalProps {
  notrigger?: boolean;
}

interface FilteredConfs {
  seminars: Conference[];
  colloques: Conference[];
  studyDays: Conference[];
}

const filterConferencesByType = (allConfs: Conference[], actants: any[], keywords: any[], query: string, type: string) => {
  return allConfs
    .filter((conf: any) => conf.type === type)
    .filter((conf: any) => {
      const actant = actants.find((act: any) => act.id === conf.actant);
      const confKeywords = keywords.filter((kw: any) => conf.keywords?.includes(kw.id));

      return (
        conf.title?.toLowerCase().includes(query.toLowerCase()) ||
        conf.description?.toLowerCase().includes(query.toLowerCase()) ||
        (actant &&
          (`${actant.firstname} ${actant.lastname}`.toLowerCase().includes(query.toLowerCase()) ||
            actant.firstname?.toLowerCase().includes(query.toLowerCase()) ||
            actant.lastname?.toLowerCase().includes(query.toLowerCase()))) ||
        confKeywords.some((kw: any) => kw.name?.toLowerCase().includes(query.toLowerCase()))
      );
    })
    .map((conf: any) => {
      const actant = actants.find((act: any) => act.id === conf.actant);
      return { ...conf, actant };
    });
};

const ConferenceSection: React.FC<{
  conferences: Conference[];
  title: string;
  loading: boolean;
  onClose: () => void;
}> = ({ conferences, title, loading, onClose }) => {
  if (loading) {
    return (
      <div className='w-full flex flex-col gap-20'>
        <h2 className='text-24 font-medium text-c6'>{title}</h2>
        <div className='w-full flex flex-col gap-10'>
          {Array.from({ length: 3 }).map((_, index) => (
            <ConfSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (conferences.length === 0) return null;

  return (
    <div className='w-full flex flex-col gap-20'>
      <h2 className='text-24 font-medium text-c6'>
        {title} ({conferences.length})
      </h2>
      <div className='w-full flex flex-col gap-10'>
        {conferences.map((item, index) => (
          <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index} onClick={onClose}>
            <ConfCard
              id={Number(item.id)}
              title={item.title}
              actant={item.actant ? `${item.actant.firstname} ${item.actant.lastname}` : ''}
              date={item.date}
              url={item.url}
              universite={item.actant && item.actant.universities && item.actant.universities.length > 0 ? item.actant.universities[0].name : ''}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Composant pour la section des œuvres
const OeuvresSection: React.FC<{
  oeuvres: any[];
  loading: boolean;
  onClose: () => void;
}> = ({ oeuvres, loading, onClose }) => {
  if (loading) {
    return (
      <div className='w-full flex flex-col gap-20'>
        <h2 className='text-24 font-medium text-c6'>Œuvres</h2>
        <div className='w-full flex flex-col gap-10'>
          {/* Pas de skeleton, juste un indicateur de chargement */}
          <div className='flex justify-center items-center p-40'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-c6'></div>
          </div>
        </div>
      </div>
    );
  }

  if (oeuvres.length === 0) return null;

  return (
    <div className='w-full flex flex-col gap-20'>
      <h2 className='text-24 font-medium text-c6'>Œuvres ({oeuvres.length})</h2>
      <div className='w-full flex flex-col gap-10'>
        {oeuvres.map((oeuvre, index) => (
          <motion.div key={oeuvre.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
            <SearchModalCard id={oeuvre.id} title={oeuvre.title} date={oeuvre.date} thumbnail={oeuvre.thumbnail} acteurs={oeuvre.acteurs} onClose={onClose} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const SearchModal = forwardRef<SearchModalRef, SearchModalProps>(({ notrigger = false }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredActants, setFilteredActants] = useState<any[]>([]);
  const [loadingActants, setLoadingActants] = useState(false);

  // États pour les œuvres
  const [filteredOeuvres, setFilteredOeuvres] = useState<any[]>([]);
  const [loadingOeuvres, setLoadingOeuvres] = useState(false);

  // États pour les conférences
  const [filteredConferences, setFilteredConferences] = useState<FilteredConfs>({
    seminars: [],
    colloques: [],
    studyDays: [],
  });
  const [loadingConferences, setLoadingConferences] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useImperativeHandle(ref, () => ({
    openWithSearch: (searchTerm: string) => {
      setSearchQuery(searchTerm);
      onOpen();
    },
    notrigger: notrigger,
  }));

  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction pour filtrer les actants
  const fetchActants = useCallback(async (query: string) => {
    if (!query) return;
    setLoadingActants(true);
    try {
      const allItems = await Items.getAllItems();
      const actants = allItems.filter((item: any) => item.type === 'actant');
      const keywords = allItems.filter((item: any) => item.type === 'keyword');

      const filtered = actants.filter((actant: any) => {
        const actantKeywords = keywords.filter((kw: any) => (actant.keywords?.includes ? actant.keywords.includes(kw.id) : false));

        return (
          actant.firstname?.toLowerCase().includes(query.toLowerCase()) ||
          actant.lastname?.toLowerCase().includes(query.toLowerCase()) ||
          `${actant.firstname} ${actant.lastname}`.toLowerCase().includes(query.toLowerCase()) ||
          actant.description?.toLowerCase().includes(query.toLowerCase()) ||
          actantKeywords.some((kw: any) => kw.name?.toLowerCase().includes(query.toLowerCase()))
        );
      });

      setFilteredActants(filtered);
    } catch (error) {
      console.error('Error fetching actants:', error);
      setFilteredActants([]);
    } finally {
      setLoadingActants(false);
    }
  }, []);

  // Fonction pour filtrer les œuvres
  const fetchOeuvres = useCallback(async (query: string) => {
    if (!query) return;
    setLoadingOeuvres(true);
    try {
      const oeuvres = await Items.getOeuvres();

      const filtered = oeuvres.filter((oeuvre: any) => {
        return (
          oeuvre.title?.toLowerCase().includes(query.toLowerCase()) ||
          oeuvre.description?.toLowerCase().includes(query.toLowerCase()) ||
          oeuvre.abstract?.toLowerCase().includes(query.toLowerCase()) ||
          (oeuvre.keywords && Array.isArray(oeuvre.keywords) && oeuvre.keywords.some((keyword: string) => keyword.toLowerCase().includes(query.toLowerCase())))
        );
      });

      setFilteredOeuvres(filtered);
    } catch (error) {
      console.error('Error fetching oeuvres:', error);
      setFilteredOeuvres([]);
    } finally {
      setLoadingOeuvres(false);
    }
  }, []);

  // Fonction pour filtrer toutes les conférences
  const fetchAllConferences = useCallback(async (query: string) => {
    if (!query) return;
    setLoadingConferences(true);

    try {
      const [allConfs, actants, keywords] = await Promise.all([Items.getAllConfs(), Items.getActants(), Items.getKeywords()]);

      const seminars = filterConferencesByType(allConfs, actants, keywords, query, 'seminar');
      const colloques = filterConferencesByType(allConfs, actants, keywords, query, 'colloque');
      const studyDays = filterConferencesByType(allConfs, actants, keywords, query, 'studyday');

      setFilteredConferences({
        seminars,
        colloques,
        studyDays,
      });
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setFilteredConferences({
        seminars: [],
        colloques: [],
        studyDays: [],
      });
    } finally {
      setLoadingConferences(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setHasSearched(true);
      fetchActants(searchQuery);
      fetchAllConferences(searchQuery);
      fetchOeuvres(searchQuery);
    } else {
      setHasSearched(false);
      setFilteredActants([]);
      setFilteredConferences({
        seminars: [],
        colloques: [],
        studyDays: [],
      });
      setFilteredOeuvres([]);
    }
  }, [searchQuery, fetchActants, fetchAllConferences, fetchOeuvres]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    onOpen();
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setFilteredActants([]);
    setFilteredConferences({
      seminars: [],
      colloques: [],
      studyDays: [],
    });
    setFilteredOeuvres([]);
    setHasSearched(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Calculer le nombre total de résultats
  const totalConferences = filteredConferences.seminars.length + filteredConferences.colloques.length + filteredConferences.studyDays.length;

  const totalResults = totalConferences + filteredActants.length + filteredOeuvres.length;

  return (
    <>
      {!notrigger && (
        <button
          className='focus:outline-none focus-visible:outline-none hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 text-16 p-15 border-c3 border-2 rounded-8 text-c6 transition-colors ease-in-out duration-200'
          onClick={handleSearch}>
          <SearchIcon size={15} className='text-c6' />
        </button>
      )}
      <Modal
        backdrop='blur'
        className='bg-c2'
        size='3xl'
        isOpen={isOpen}
        onClose={handleClose}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}>
        <ModalContent>
          {() => (
            <>
              <ModalBody className='flex justify-between p-40'>
                <h1 className='font-semibold text-32 text-c6 flex flex-row justify-center py-20'>Rechercher</h1>

                <Input
                  ref={inputRef}
                  classNames={{
                    base: 'w-full',
                    clearButton: 'bg-c3',
                    mainWrapper: 'h-full',
                    input: 'text-100 Inter font-semibold text-16 nav_searchbar block',
                    inputWrapper: 'group-data-[focus=true]:bg-c1 rounded-12 font-normal text-c6 bg-c1 px-20 py-15 h-auto',
                    innerWrapper: 'h-auto',
                  }}
                  placeholder='Conférences, œuvres, intervenants, mots clés...'
                  size='sm'
                  startContent={<SearchIcon size={18} />}
                  endContent={<Kbd className='flex sm:flex font-semibold text-c6 text-12 px-[8px] py-5 bg-c3 gap-5'>ESC</Kbd>}
                  type='search'
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className={`relative ${hasSearched ? 'overflow-scroll' : 'hidden'}`}>
                  <motion.main className='w-full py-20 transition-all ease-in-out duration-200' initial='hidden' animate='visible' variants={fadeIn}>
                    <div className='w-full flex flex-col gap-50'>
                      {/* Sections des conférences */}
                      <ConferenceSection conferences={filteredConferences.seminars} title='Conférences de séminaires' loading={loadingConferences} onClose={handleClose} />

                      <ConferenceSection conferences={filteredConferences.studyDays} title="Conférences de journées d'études" loading={loadingConferences} onClose={handleClose} />

                      <ConferenceSection conferences={filteredConferences.colloques} title='Conférences de colloques' loading={loadingConferences} onClose={handleClose} />

                      {/* Section des œuvres */}
                      <OeuvresSection oeuvres={filteredOeuvres} loading={loadingOeuvres} onClose={handleClose} />

                      {/* Section des intervenants */}
                      {filteredActants.length > 0 && !loadingActants && (
                        <div className='w-full flex flex-col gap-20'>
                          <h2 className='text-24 font-medium text-c6'>
                            Intervenant{filteredActants.length > 1 ? 's' : ''} ({filteredActants.length})
                          </h2>
                          <div className='w-full flex flex-col gap-10'>
                            {filteredActants.map((item, index) => (
                              <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index} onClick={handleClose}>
                                <IntervenantLongCard key={item.id} {...item} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skeleton des intervenants */}
                      {loadingActants && (
                        <div className='w-full flex flex-col gap-20'>
                          <h2 className='text-24 font-medium text-c6'>Intervenants</h2>
                          <div className='w-full flex flex-col gap-10'>
                            {Array.from({ length: 3 }).map((_, index) => (
                              <IntervenantLongCardSkeleton key={index} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message aucun résultat */}
                      {hasSearched && totalResults === 0 && !loadingActants && !loadingConferences && !loadingOeuvres && (
                        <div className='w-full flex justify-center p-50'>
                          <p className='text-c6 text-16'>Aucun résultat trouvé</p>
                        </div>
                      )}
                    </div>
                  </motion.main>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});

export default SearchModal;
