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
import { useFetchDataDetails } from '@/hooks/useFetchData';

interface EditModalProps {
  itemUrl: string;
  activeConfig: string | null;
}

interface ColumnConfig {
  key: string;
  label: string;
  dataPath: string;
}

const inputConfigs: { [key: string]: ColumnConfig[] } = {
  conferences: [
    { key: 'o:id', label: 'ID', dataPath: 'o:id' },
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
  ],
  conferenciers: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'jdc:hasUniversity', label: 'Université', dataPath: 'jdc:hasUniversity.0.display_title' },
  ],
};

function getValueByPath<T>(object: T[], path: string): any {
  if (!path) return undefined;
  if (!Array.isArray(object) || object.length === 0) return undefined;

  const keys = path.split('.');
  let value: any = object[0]; // Access the first element of the array

  for (const key of keys) {
    if (Array.isArray(value)) {
      value = value[parseInt(key)];
    } else if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

export const EditModal: React.FC<EditModalProps> = ({ itemUrl, activeConfig }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: itemDetailsData, loading: detailsLoading, error: detailsError } = useFetchDataDetails(itemUrl);
  const [itemData, setItemData] = useState<any>({});

  useEffect(() => {
    if (itemDetailsData) {
      setItemData(itemDetailsData);
    }
  }, [itemDetailsData]);

  useEffect(() => {
    if (detailsError) {
      console.error('Error fetching item details:', detailsError);
    }
  }, [detailsError]);

  const handleApplyChanges = () => {
    console.log('Updated Item Data:', itemData);
    onClose();
  };

  return (
    <>
      <div className='flex flex-wrap'>
        <Tooltip content='Voir les crédits'>
          <Link onPress={onOpen} className='cursor-pointer'>
            <CreditIcon
              size={18}
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
          <ModalHeader className='flex justify-between p-25 '>
            <h2 className='text-default-500 text-32 font-semibold'>Édition</h2>
            <Link onPress={onClose}>
              <CloseIcon
                className='text-default-500 cursor-pointer hover:text-default-action transition-all ease-in-out duration-200'
                size={24}
              />
            </Link>
          </ModalHeader>
          <ModalBody>
            {activeConfig && !detailsLoading ? (
              itemDetailsData &&
              inputConfigs[activeConfig]?.map((col: ColumnConfig) => {
                const value = getValueByPath(itemDetailsData, col.dataPath);
                return (
                  <Input
                    key={col.key}
                    size='lg'
                    classNames={{
                      label: 'text-semibold',
                      inputWrapper: 'bg-default-100',
                      input: 'h-[50px]',
                    }}
                    className='min-h-[50px]'
                    type='text'
                    label={col.label}
                    labelPlacement='outside'
                    placeholder={`Entrez ${col.label}`}
                    isRequired
                    defaultValue={value}
                    onChange={(e) => setItemData({ ...itemData, [col.dataPath]: e.target.value })}
                  />
                );
              })
            ) : (
              <Spinner />
            )}
          </ModalBody>
          <ModalFooter className='flex items-center justify-end p-25 '>
            <Button
              onPress={onClose}
              onClick={handleApplyChanges}
              radius='none'
              className={`h-[32px] text-16 rounded-8 text-default-selected bg-default-action transition-all ease-in-out duration-200 navfilter flex items-center`}>
              Appliquer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
