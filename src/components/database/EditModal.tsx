import React, { useState, useEffect } from 'react';
import { CreditIcon, CloseIcon } from '@/components/Utils/icons';
import {
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Tooltip,
  Input,
  Spinner,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { Scrollbar } from '@/components/Utils/Scrollbar';

import { useFetchDataDetails } from '@/hooks/useFetchData';

interface EditModalProps {
  itemUrl: string;
}

export const EditModal: React.FC<EditModalProps> = ({ itemUrl }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [speakers, setSpeakers] = useState<any[]>([]);
  const { data: speakersData, loading: speakersLoading, error: speakersError } = useFetchDataDetails(itemUrl);
  const [value, setValue] = React.useState('');

  useEffect(() => {
    if (speakersData) {
      setSpeakers(speakersData);
    }
  }, [speakersData]);

  const Send = () => {
    console.log(value);
  };

  return (
    <>
      <div className='flex flex-wrap'>
        <Tooltip content='voir les crédits'>
          <Link onPress={onOpen} className='cursor-pointer'>
            <CreditIcon
              size={22}
              className='text-default-500 hover:text-default-action transition-all ease-in-out duration-200'
            />
          </Link>
        </Tooltip>
      </div>

      <Modal
        backdrop='blur'
        className='bg-default-200'
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
              <ModalHeader className='flex justify-between p-25 '>
                <h2 className='text-default-500 text-32 font-semibold'>Édition</h2>
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
                    {speakersLoading ? (
                      <Spinner />
                    ) : (
                      speakers.map((speaker, index) => (
                        <Input
                          size='lg'
                          classNames={{
                            label: 'text-semibold',
                            inputWrapper: 'bg-default-100',
                            input: 'h-[50px]',
                          }}
                          className='min-h-[50px]'
                          key={index}
                          type='text'
                          label='Titre'
                          labelPlacement='outside'
                          placeholder='Entre le titre'
                          isRequired
                          onValueChange={setValue}
                          defaultValue={speaker['o:title']}
                        />
                      ))
                    )}
                  </div>
                </Scrollbar>
              </ModalBody>
              <ModalFooter className='flex items-center justify-end p-25 '>
                <div className='flex flex-row gap-25'>
                  {/* <Button
                    radius='none'
                    onClick={handleReset}
                    className={`h-[32px] text-16 rounded-8 text-default-500 bg-default-200 hover:text-default-500 hover:bg-default-300 transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Réinitialiser
                  </Button> */}
                  <Button
                    onPress={onClose}
                    onClick={Send}
                    radius='none'
                    className={`h-[32px] text-16 rounded-8 text-default-selected bg-default-action transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Appliquer
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
