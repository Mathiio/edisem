import { SearchIcon } from '@/components/ui/icons';
import React, { useState, useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Input, Kbd, Modal, ModalContent, ModalBody, useDisclosure } from '@heroui/react';
import { IntervenantLongCard, IntervenantLongCardSkeleton } from '@/components/features/intervenants/IntervenantCards';
import { ConfCard, ConfSkeleton } from '@/components/layout/ConfCard';
import { motion, Variants } from 'framer-motion';
import { filterActants, filterConfs } from '@/lib/api';

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
}

const SearchModal = forwardRef<SearchModalRef>((_props, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredActants, setFilteredActants] = useState<any[]>([]);
  const [loadingActants, setLoadingActants] = useState(false);
  const [filteredConfs, setFilteredConfs] = useState<any[]>([]);
  const [loadingConfs, setLoadingConfs] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Exposer la méthode pour ouvrir avec une recherche
  useImperativeHandle(ref, () => ({
    openWithSearch: (searchTerm: string) => {
      setSearchQuery(searchTerm);
      onOpen();
    },
  }));

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchActants = useCallback(async (query: string) => {
    if (!query) return;
    setLoadingActants(true);
    const filteredActants = await filterActants(query);
    setFilteredActants(filteredActants);
    setLoadingActants(false);
  }, []);

  const fetchConfs = useCallback(async (query: string) => {
    if (!query) return;
    setLoadingConfs(true);
    const filteredConfs = await filterConfs(query);
    setFilteredConfs(filteredConfs as any);
    setLoadingConfs(false);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setHasSearched(true);
      fetchActants(searchQuery);
      fetchConfs(searchQuery);
    }
  }, [searchQuery, fetchActants, fetchConfs]);

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
    setFilteredConfs([]);
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


  return (
    <>
      <button
        className='focus:outline-none focus-visible:outline-none hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 text-16 p-15 border-c3 border-2 rounded-8 text-c6 transition-colors ease-in-out duration-200'
        onClick={handleSearch}>
        <SearchIcon size={15} className='text-c6' />
      </button>

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
                    inputWrapper:
                      'group-data-[focus=true]:bg-c1 rounded-12 font-normal text-c6 bg-c1 px-20 py-15 h-auto',
                    innerWrapper: 'h-auto'
                  }}
                  placeholder='Conférences, actant, mots clés...'
                  size='sm'
                  startContent={<SearchIcon size={18} />}
                  endContent={
                    <Kbd className='flex sm:flex font-semibold text-c6 text-12 px-[8px] py-5 bg-c3 gap-5'>ESC</Kbd>
                  }
                  type='search'
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className={`relative ${hasSearched ? 'overflow-scroll' : 'hidden'}`}>
                  <motion.main
                    className='w-full py-20 transition-all ease-in-out duration-200'
                    initial='hidden'
                    animate='visible'
                    variants={fadeIn}>
                    <div className='w-full flex flex-col gap-50'>
                      {filteredConfs.length > 0 && !loadingConfs && (
                        <div className='w-full flex flex-col gap-20'>
                          <h2 className='text-24 font-medium text-c6'>
                            Conférence{filteredConfs.length > 1 ? 's' : ''}
                          </h2>
                          <div className='w-full flex flex-col gap-10'>
                            {loadingConfs
                              ? Array.from({ length: 8 }).map((_, index) => <ConfSkeleton key={index} />)
                              : filteredConfs.map((item, index) => (
                                  <motion.div
                                    key={item.id}
                                    initial='hidden'
                                    animate='visible'
                                    variants={fadeIn}
                                    custom={index}
                                    onClick={handleClose}>
                                    <ConfCard
                                      key={item.id}
                                      id={item.id}
                                      title={item.title}
                                      actant={item.actant.firstname + ' ' + item.actant.lastname}
                                      date={item.date}
                                      url={item.url}
                                      universite={
                                        item.actant.universities && item.actant.universities.length > 0
                                          ? item.actant.universities[0].name
                                          : ''
                                      }
                                    />
                                  </motion.div>
                                ))}
                          </div>
                        </div>
                      )}
                      {filteredActants.length > 0 && !loadingActants && (
                        <div className='w-full flex flex-col gap-20'>
                          <h2 className='text-24 font-medium text-c6'>
                            Intervenant{filteredActants.length > 1 ? 's' : ''}
                          </h2>
                          <div className='w-full flex flex-col gap-10'>
                            {loadingActants
                              ? Array.from({ length: 8 }).map((_, index) => <IntervenantLongCardSkeleton key={index} />)
                              : filteredActants.map((item, index) => (
                                  <motion.div
                                    key={item.id}
                                    initial='hidden'
                                    animate='visible'
                                    variants={fadeIn}
                                    custom={index}
                                    onClick={handleClose}>
                                    <IntervenantLongCard key={item.id} {...item} />
                                  </motion.div>
                                ))}
                          </div>
                        </div>
                      )}
                      {hasSearched &&
                        filteredActants.length === 0 &&
                        filteredConfs.length === 0 &&
                        !loadingActants &&
                        !loadingConfs && (
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
