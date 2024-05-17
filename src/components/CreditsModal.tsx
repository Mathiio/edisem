import React from "react";
import { CreditIcon, CloseIcon } from '@/components/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

const CreditsModal = () => { 
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Link onPress={handleOpen} className='cursor-pointer'>
          <CreditIcon className='text-default-600 hover:text-secondary-400' />
        </Link>
      </div>
      <Modal size="2xl" isOpen={isOpen} onClose={onClose} hideCloseButton={true}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between">
                <h2 className="text-default-600 font-semibold">Crédits du site</h2>
                <Link onPress={onClose}>
                  <CloseIcon className='text-default-600 cursor-pointer hover:text-secondary-400' size={24}/>
                </Link>
              </ModalHeader>
              <ModalBody>

              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreditsModal;
