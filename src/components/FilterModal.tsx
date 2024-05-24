import { useRef, useEffect } from 'react';
import { FilterIcon, SearchIcon, CloseIcon, CalendarIcon } from '@/components/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import { DateRangePicker } from '@nextui-org/date-picker';

import { Button } from '@nextui-org/button';

export const FilterModal = () => {
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
        className='bg-default-200 hover:bg-default-300 data-[hover=true]:opacity-100 items-center gap-25 p-25 h-[50px] hidden sm:flex'>
        <FilterIcon className='text-default-600' size={22} />
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
                <div className='flex flex-row gap-25 items-center text-24'>Filtres</div>
                <Link onPress={onClose}>
                  <CloseIcon
                    className='text-default-500 cursor-pointer hover:text-default-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <div className='flex flex-col gap-25'>
                  <div>
                    <div className='flex flex-row items-center gap-10'>
                      <CalendarIcon size={20} />
                      <div>Date de publication</div>
                    </div>
                    <div className='h-[80px]'>
                      <DateRangePicker />
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
