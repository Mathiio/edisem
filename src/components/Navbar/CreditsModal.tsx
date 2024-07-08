import { CreditIcon, CloseIcon } from '@/components/utils/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tooltip } from '@nextui-org/react';
import { CreditCard } from '@/components/Navbar/CreditCard';
import { Scrollbar } from '../utils/Scrollbar';

const CreditsModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };

  return (
    <>
      <div className='flex flex-wrap'>
        <Tooltip content='voir les crédits'>
          <Link onPress={handleOpen} className='cursor-pointer'>
            <CreditIcon size={22} className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200' />
          </Link>
        </Tooltip>
      </div>

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
              <ModalHeader className='flex justify-between p-25 border-b-2 border-default-300'>
                <h2 className='text-default-500 text-32 font-semibold'>Crédits</h2>
                <Link onPress={onClose}>
                  <CloseIcon
                    className='text-default-500 cursor-pointer hover:text-default-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <Scrollbar withGap>
                  <div className='flex flex-col gap-25'>
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <div className='text-default-400'>Equipe Arcanes</div>
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
                    <CreditCard name='Junior Garcia' job='Software Engineer' />
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
