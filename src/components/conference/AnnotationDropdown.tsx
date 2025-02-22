import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import React, { useState } from 'react';
import { CrossIcon, DotsIcon } from '../utils/icons';

export const AnnotationDropdown = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const handleOpen = () => {
    onOpen();
    setIsDropdownOpen(false);
  };

  return (
    <div>
      <Dropdown isOpen={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownTrigger className='cursor-pointer'>
          <div>
            <DotsIcon className='mx-1' size={15} />
          </div>
        </DropdownTrigger>

        <DropdownMenu aria-label='User menu' className='p-4'>
          <DropdownItem key='Annoter' onClick={handleOpen} className='gap-2'>
            Annoter
          </DropdownItem>
          <DropdownItem key='VoirAnnoter' className='gap-2 '>
            Voir les annotations
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal
        backdrop='blur'
        className='bg-c1'
        size='lg'
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
              <ModalHeader className='flex justify-between p-25 border-b-2 border-gray-200'>
                <h1 className='text-32 font-semibold'>Annotation</h1>
                <Link onPress={onClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <form className='flex flex-col w-full max-w-lg gap-25'>
                  <Input
                    size='lg'
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                      input: 'h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    type='email'
                    label='Titre de l’annotation *'
                    labelPlacement='outside'
                    placeholder='Entrez un titre..'
                  />
                  <Textarea
                    size='lg'
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
                      input: ' h-[50px]',
                      mainWrapper: 'w-full',
                    }}
                    className='min-h-[50px]'
                    type='password'
                    label='Description *'
                    labelPlacement='outside'
                    placeholder='Entrez votre mot de passe'
                  />
                </form>
              </ModalBody>
              <ModalFooter className='flex w-full flex-row p-25 justify-end items-center'>
                <Button className='w-fit px-3 h-[40px] bg-c2 text-c6 rounded-8'>Annuler</Button>
                <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected rounded-8 '>
                  Annoter
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
