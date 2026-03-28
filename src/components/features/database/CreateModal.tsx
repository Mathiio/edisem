import React, { useState, useEffect } from 'react';
import { Input, Spinner, Button, ModalBody, ModalFooter, ModalContent, Modal, Link, ModalHeader, addToast } from '@heroui/react';
import { useFetchRT } from '@/hooks/useFetchData';
import { SelectionInput } from '@/components/features/database/SelectionInput';
import { Textarea } from '@heroui/react';

import { DatePicker, TimecodeInput } from '@/components/features/database/TimecodeInput';
import { CrossIcon } from '@/components/ui/icons';
import { inputConfigs, InputConfig } from '@/components/features/database/EditModal';
import MultipleInputs from './MultipleInputs';
import Omk from '@/services/Omk';

interface NewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  activeConfig: string | null;
  itemPropertiesData: any;
  propertiesLoading: boolean;
}

export const CreateModal: React.FC<NewModalProps> = ({ isOpen, onClose, itemId, activeConfig, itemPropertiesData, propertiesLoading }) => {
  const { data: itemDetailsData, loading: detailsLoading, error: detailsError, refetch: refetchItemDetails } = useFetchRT(itemId);

  const [itemData, setItemData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const clearState = () => {
    setItemData({});
  };

  const clearDetailsState = () => {
    refetchItemDetails();
  };

  const pa = {
    api: 'https://tests.arcanes.ca/omk/api/',
  };

  const omks = new Omk(pa);
  omks.init();

  useEffect(() => {
    if (detailsError) {
      console.error('Error fetching item details:', detailsError);
    }
  }, [detailsError]);

  const handleInputChange = (path: string, value: any) => {
    setItemData((prevData: any) => {
      const newData = { ...prevData };
      const keys = path;
      let current = newData;

      if (Array.isArray(value)) {
        if (Array.isArray(current[keys])) {
          current[keys] = value;
        } else {
          current[keys] = [value];
        }
      } else {
        current[keys] = value;
      }

      return newData;
    });
  };

  // Version avec toast de promisse + résultat
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      if (!itemId) {
        throw new Error('Item URL is not defined or empty');
      }

      omks.props = itemPropertiesData;
      let object = omks.buildObject(itemDetailsData, itemData);

      // Toast avec promesse pour montrer le loading
      const savePromise = omks.createItem(object);

      addToast({
        title: "Création de l'item",
        description: 'Création en cours...',
        promise: savePromise,
      });

      await savePromise;

      // Toast de succès
      addToast({
        
        title: 'Succès',
        description: "L'item a été créé avec succès",
        color: 'success',
      });

      setSaving(false);
      refetchItemDetails();
      onClose();
    } catch (error) {
      // Toast d'erreur
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      addToast({
        title: 'Erreur',
        description: `Échec de la création : ${errorMessage}`,
        color: 'danger',
      });

      setSaveError(errorMessage);
      setSaving(false);
    }
  };

  if (propertiesLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <Spinner color='secondary' />
          <p>Chargement...</p>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        backdrop='blur'
        className='bg-c2'
        size='2xl'
        isOpen={isOpen}
        onClose={() => {
          clearState();
          clearDetailsState();
          onClose();
        }}
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
              <ModalHeader className='flex justify-between p-6 '>
                <h2 className='text-c6 text-3xl font-medium'>Nouvel item</h2>
                <Link onPress={onClose}>
                  <CrossIcon className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200' size={24} />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-6'>
                <div className='flex flex-col gap-12 items-start scroll-y-auto'>
                  {activeConfig && !detailsLoading ? (
                    itemDetailsData &&
                    inputConfigs[activeConfig]?.map((col: InputConfig) => {
                      if (col.type === 'input') {
                        return (
                          <>
                            <Input
                              key={col.key}
                              size='lg'
                              classNames={{
                                label: 'text-semibold !text-c6 text-2xl',
                                inputWrapper: 'bg-c1',
                                input: 'h-[50px]',
                              }}
                              className='min-h-[50px]'
                              type='text'
                              label={col.label}
                              labelPlacement='outside'
                              placeholder={`Entrez ${col.label}`}
                              isRequired
                              onChange={(e) => handleInputChange(col.dataPath, e.target.value)}
                            />
                          </>
                        );
                      } else if (col.type === 'textarea') {
                        return (
                          <Textarea
                            key={col.key}
                            size='lg'
                            classNames={{
                              label: 'text-semibold text-c6 text-2xl',
                              inputWrapper: 'bg-c1 shadow-none border-1 border-200 rounded-lg',
                              input: 'h-[50px]',
                            }}
                            className='min-h-[50px]'
                            type='text'
                            label={col.label}
                            labelPlacement='outside'
                            placeholder={`Entrez ${col.label}`}
                            isRequired
                            onChange={(e) => handleInputChange(col.dataPath, e.target.value)}
                          />
                        );
                      } else if (col.type === 'time') {
                        return (
                          <>
                            <TimecodeInput label={col.label} handleInputChange={(value) => handleInputChange(col.dataPath, value)} />
                          </>
                        );
                      } else if (col.type === 'date') {
                        return (
                          <>
                            <DatePicker key={col.key} label={col.label} handleInputChange={(value) => handleInputChange(col.dataPath, value)} />
                          </>
                        );
                      } else if (col.type === 'selection') {
                        return <SelectionInput key={col.key} col={col} handleInputChange={handleInputChange} />;
                      } else if (col.type === 'inputs') {
                        return <MultipleInputs key={col.key} col={col} actualData={itemDetailsData} handleInputChange={handleInputChange} />;
                      } else {
                        return null;
                      }
                    })
                  ) : (
                    <Spinner color='secondary' />
                  )}

                  {saveError && <div className='error'>{saveError}</div>}
                </div>
              </ModalBody>
              <ModalFooter className='flex items-center justify-end p-6 '>
                <div className='flex flex-row gap-6'>
                  <Button
                    onPress={onClose}
                    onClick={handleSave}
                    disabled={saving}
                    radius='none'
                    className={`h-[32px] px-2.5 text-base rounded-lg text-selected bg-action transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Créer
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
