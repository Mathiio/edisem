import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, ModalContent, ModalBody, useDisclosure, Alert } from '@heroui/react';
import { SearchIcon } from '@/components/ui/icons';
import { Construction } from 'lucide-react';
// import { useSearch } from '@/hooks/useSearch';
// import { SearchInput } from './SearchInput';
// import { SearchResults } from './SearchResults';
// import { useDebounce } from '@/hooks/useDebounce'

export interface SearchModalRef {
  openWithSearch: (searchTerm: string) => void;
  notrigger: boolean;
}

interface SearchModalProps {
  notrigger?: boolean;
}

export const SearchModal = forwardRef<SearchModalRef, SearchModalProps>(
  ({ notrigger = false }, ref) => {
    // const [searchQuery, setSearchQuery] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    // const inputRef = useRef<HTMLInputElement>(null);

    // const {
    //   searchResults,
    //   loading,
    //   hasSearched,
    //   totalResults,
    //   performSearch,
    //   clearSearch
    // } = useSearch();

    // Debounce pour optimiser les performances
    // const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useImperativeHandle(ref, () => ({
      openWithSearch: (_searchTerm: string) => {
        // setSearchQuery(searchTerm);
        onOpen();
      },
      notrigger,
    }));

    // Effectuer la recherche avec debounce
    // useEffect(() => {
    //   performSearch(debouncedSearchQuery);
    // }, [debouncedSearchQuery, performSearch]);

    // Focus sur l'input à l'ouverture
    // useEffect(() => {
    //   if (isOpen && inputRef.current) {
    //     inputRef.current.focus();
    //   }
    // }, [isOpen]);

    const handleClose = () => {
      onClose();
      // setSearchQuery('');
      // clearSearch();
    };

    // Gestion des raccourcis clavier
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
        // Ctrl+K ou Cmd+K pour ouvrir la recherche
        if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isOpen) {
          e.preventDefault();
          onOpen();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onOpen]);

    return (
      <>
        {/* Bouton de déclenchement */}
        {!notrigger && (
          <button
            className="focus:outline-none focus-visible:outline-none hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 text-16 p-15 border-c3 border-2 rounded-8 text-c6 transition-colors ease-in-out duration-200"
            onClick={onOpen}
            title="Rechercher (Ctrl+K)"
          >
            <SearchIcon size={15} className="text-c6" />
          </button>
        )}

        {/* Modal */}
        <Modal
          backdrop="blur"
          className="bg-c2"
          size="3xl"
          isOpen={isOpen}
          onClose={handleClose}
          hideCloseButton={true}
          scrollBehavior="inside"
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.3, ease: 'easeOut' },
              },
              exit: {
                y: -20,
                opacity: 0,
                transition: { duration: 0.2, ease: 'easeIn' },
              },
            },
          }}
        >
          <ModalContent>
            <ModalBody className="flex justify-center items-center p-40">
              <h1 className="font-semibold text-32 text-c6 flex flex-row justify-center py-20">
                Rechercher
              </h1>

              {/* Maintenance message */}
              <div className='max-w-md p-8 rounded-12 border-2 border-c3 bg-c2 shadow-lg flex flex-col items-center'>
                <div className='text-datavisOrange mb-6'>
                  <Construction size={48} />
                </div>
                <h2 className='text-2xl font-bold text-c6 mb-4'>Fonctionnalité indisponible</h2>
                <p className='text-c4 leading-relaxed text-center'>
                  Cette partie est inaccessible de manière temporaire pour restructuration.
                  <br />
                </p>
              </div>

              {/* Commented out search functionality */}
              {/* <SearchInput
                ref={inputRef}
                value={searchQuery}
                onChange={setSearchQuery}
              />

              <div className={`relative ${hasSearched ? 'overflow-scroll' : 'hidden'}`}>
                <SearchResults
                  results={searchResults}
                  loading={loading}
                  hasSearched={hasSearched}
                  totalResults={totalResults}
                  onClose={handleClose}
                />
              </div> */}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }
);

SearchModal.displayName = 'SearchModal';
