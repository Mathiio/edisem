import { SearchIcon } from '@/components/Utils/icons';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Kbd, Modal, ModalContent, ModalBody, useDisclosure, Button } from '@nextui-org/react';
import { ActantCard, ActantSkeleton } from '@/components/search/ActantCard';
import { ConfCard, ConfSkeleton } from '@/components/search/ConfCard';
import { motion, Variants } from 'framer-motion';
import { filterActants, filterConfs } from '@/services/api';


const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};



const SearchModal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActants, setFilteredActants] = useState<any[]>([]);
  const [loadingActants, setLoadingActants] = useState(true);
  const [filteredConfs, setFilteredConfs] = useState<any[]>([]);
  const [loadingConfs, setLoadingConfs] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
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
      fetchActants(searchQuery); 
      fetchConfs(searchQuery);
    }
  }, [searchQuery, fetchActants, fetchConfs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); 
  };

  const handleOpen = () => {
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

  const getResultText = (filteredActants: any[], filteredConfs: any[]) => {
    const totalResults = filteredActants.length + filteredConfs.length;
  
    if (totalResults === 0) {
      return 'Aucun résultat trouvé';
    } else if (totalResults === 1) {
      return '1 Résultat trouvé';
    } else {
      return `${totalResults} Résultats trouvés`;
    }
  };

  return (
    <>
      <Button
          size='md'
          className='cursor-pointer h-[32px] text-16 p-25 gap-10 rounded-8 text-default-500 hover:text-default-500 bg-default-200 hover:bg-default-300 transition-all ease-in-out duration-200'
          onPress={handleOpen}>
          <SearchIcon
              size={16}
              className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200'
          />
          Recherche avancée...
      </Button>

      <Modal
        backdrop='blur'
        className='bg-default-100'
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
              <ModalBody className='flex justify-between p-25'>
                <Input
                  ref={inputRef}
                  classNames={{
                    base: 'w-full',
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
                    <Kbd className='flex sm:flex font-semibold text-default-600 text-12 px-[8px] py-5 bg-default-200 gap-5'>
                      ESC
                    </Kbd>
                  }
                  type='search'
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className='relative overflow-scroll'>
                    <motion.main
                      className='w-full p-25 transition-all ease-in-out duration-200'
                      initial='hidden'
                      animate='visible'
                      variants={fadeIn}>
                        <div className='w-full flex flex-col gap-50'>
                          <h2>{getResultText(filteredActants, filteredConfs)}</h2> 
                          {filteredActants.length > 0 && !loadingActants && (
                            <div className='w-full flex flex-col gap-25'>
                              <h2 className='text-24 font-semibold text-default-500'>Conférencier{filteredActants.length > 1 ? 's' : '' }</h2>
                              <div className='w-full flex flex-col gap-15'>
                                {loadingActants
                                  ? Array.from({ length: 8 }).map((_, index) => <ActantSkeleton key={index} />)
                                  : filteredActants.map((item, index) => (
                                    <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeIn} custom={index} onClick={handleClose}>
                                      <ActantCard
                                        key={item.id}
                                        id={item.id}
                                        firstname={item.firstname}
                                        lastname={item.lastname}
                                        picture={item.picture}
                                        interventions={item.interventions}
                                        universities={item.universities.map((uni: { name: string; logo: string; }) => ({
                                          name: uni.name,
                                          logo: uni.logo,
                                        }))}
                                      />
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          )}
                          {filteredConfs.length > 0 && !loadingConfs && (
                            <div className='w-full flex flex-col gap-25'>
                              <h2 className='text-24 font-semibold text-default-500'>Conférence{filteredConfs.length > 1 ? 's' : '' }</h2>
                              <div className='w-full flex flex-col gap-15'>
                                {loadingConfs
                                  ? Array.from({ length: 8 }).map((_, index) => <ConfSkeleton key={index} />)
                                  : filteredConfs.map((item, index) => (
                                    <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeIn} custom={index} onClick={handleClose}>
                                      <ConfCard
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        actant={item.actant.firstname + ' ' + item.actant.lastname}
                                        date={item.date}
                                        url={item.url}
                                        universite={item.actant.universities && item.actant.universities.length > 0 ? item.actant.universities[0].name : ''}
                                      />
                                    </motion.div>
                                  ))}
                              </div>
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
};

export default SearchModal;
