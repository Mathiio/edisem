import { useRef, useEffect } from 'react';
import { SearchIcon, CloseIcon } from '@/components/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import { Kbd } from '@nextui-org/kbd';
import { Button } from '@nextui-org/button';
import { ContentCreditCard } from './ContentMediaCard';
import { Scrollbar } from './Scrollbar';
import { Select, SelectItem } from '@nextui-org/react';

export const SearchModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null); // Référence pour l'élément input

  const handleOpen = () => {
    onOpen();
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus(); // Focus sur l'élément input lorsque la modal est ouverte
    }
  }, [isOpen]);

  return (
    <>
      <Button
        onPress={handleOpen}
        className='bg-default-200 hover:bg-default-300  data-[hover=true]:opacity-100 flex items-center gap-25 p-25 h-[50px]'>
        <SearchIcon className='text-default-600' size={18} />
        <p className='text-default-600 text-16 font-regular'>Recherche avancée...</p>
        <Kbd className='text-default-600 text-14 px-[8px] py-5 bg-default-200 gap-5' keys={['command']}>
          K
        </Kbd>
      </Button>

      <Modal
        backdrop='blur'
        className='bg-default-100'
        size='2xl'
        isOpen={isOpen}
        onClose={onClose}
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
          {(onClose) => (
            <>
              <ModalHeader className='flex items-center justify-between p-25 border-b-2 border-default-300'>
                <div className='flex flex-row gap-25 items-center'>
                  <SearchIcon className='text-default-600' size={24} />
                  <input
                    ref={inputRef} // Attribuer la référence à l'élément input
                    className='bg-default-100 text-default-500 text-32 font-semibold outline-none' // Retirer le style de focus existant
                    type='text'
                    name=''
                    id=''
                    autoFocus // Focus automatique sur l'élément input
                  />
                </div>
                <Link onPress={onClose}>
                  <CloseIcon
                    className='text-default-500 cursor-pointer hover:text-default-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <div className='flex flex-row gap-25'>
                  <Select color='secondary' label='Date' placeholder='AAAA' startContent={<SearchIcon />}>
                    <SelectItem key={2024} value={2024}>
                      2024
                    </SelectItem>
                  </Select>
                  <Select color='secondary' label='Conférencier' placeholder='John Doe' startContent={<SearchIcon />}>
                    <SelectItem key={1} value={2024}>
                      2024
                    </SelectItem>
                  </Select>
                  <Select color='secondary' label='Type' placeholder='Type' startContent={<SearchIcon />}>
                    <SelectItem key={1} value={2024}>
                      2024
                    </SelectItem>
                  </Select>
                </div>
                <Scrollbar>
                  <div className='flex flex-col gap-25'>
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                  </div>
                </Scrollbar>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
