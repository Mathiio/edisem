import React from 'react';
import { CreditIcon, CloseIcon } from '@/components/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, ModalProps, useDisclosure } from '@nextui-org/react';
import { ContentCreditCard } from './ContentMediaCard';
import { Scrollbar } from './Scrollbar';

const CreditsModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scrollBehavior, setScrollBehavior] = React.useState<ModalProps['scrollBehavior']>('inside');

  const handleOpen = () => {
    onOpen();
  };

  return (
    <>
      <div className='flex flex-wrap'>
        <Link onPress={handleOpen} className='cursor-pointer'>
          <CreditIcon className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200' />
        </Link>
      </div>
      <Modal
        className='bg-default-100'
        size='2xl'
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={true}
        scrollBehavior='inside'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-between p-25 border-b-2 border-default-300'>
                <h2 className='text-default-500 text-32 font-semibold'>Crédits</h2>
                <Link onPress={onClose}>
                  <CloseIcon className='text-default-500 cursor-pointer hover:text-default-600' size={24} />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <Scrollbar>
                  <div className='flex flex-col gap-25'>
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
                    <ContentCreditCard name='Junior Garcia' job='Software Engineer' />
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

export default CreditsModal;
