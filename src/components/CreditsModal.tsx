import React from "react";
import { CreditIcon, CloseIcon } from '@/components/icons';
import { Link, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";

const CreditsModal = () => { 
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };

  return (
    <>
      <div className="flex flex-wrap">
        <Link onPress={handleOpen} className='cursor-pointer'>
          <CreditIcon className='text-default-500 hover:text-default-600 transition-all ease-in-out duration-200' />
        </Link>
      </div>
      <Modal size="2xl" isOpen={isOpen} onClose={onClose} hideCloseButton={true}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between">
                <h2 className="text-default-500 font-semibold">Crédits du site</h2>
                <Link onPress={onClose}>
                  <CloseIcon className='text-default-500 cursor-pointer hover:text-default-600' size={24}/>
                </Link>
              </ModalHeader>
              <ModalBody>
                Yess
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreditsModal;
