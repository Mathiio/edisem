import React, { useState, useEffect } from 'react';
import { Spinner, addToast } from '@heroui/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  modalCloseButtonClasses,
} from '@/theme/components';
import { Button } from '@/theme/components/button';
import { useFetchRT } from '@/hooks/useFetchData';
import { SelectionInput } from '@/components/features/database/SelectionInput';
import { DatePicker, TimecodeInput } from '@/components/features/database/TimecodeInput';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { EditIcon } from '@/components/ui/icons';
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

const fieldLabelClass = 'text-semibold text-c6 text-xl';

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
      const current = newData;

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

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      if (!itemId) {
        throw new Error('Item URL is not defined or empty');
      }

      omks.props = itemPropertiesData;
      const object = omks.buildObject(itemDetailsData, itemData);

      const savePromise = omks.createItem(object);

      addToast({
        title: "Création de l'item",
        description: 'Création en cours...',
        promise: savePromise,
      });

      await savePromise;

      addToast({
        title: 'Succès',
        description: "L'item a été créé avec succès",
        color: 'success',
      });

      setSaving(false);
      refetchItemDetails();
      onClose();
    } catch (error) {
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
          <Spinner color='current' className='text-c6' />
          <p>Chargement...</p>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        backdrop='blur'
        size='2xl'
        isOpen={isOpen}
        onClose={() => {
          clearState();
          clearDetailsState();
          onClose();
        }}
        classNames={{ closeButton: modalCloseButtonClasses }}
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
          <>
            <ModalHeader className='p-6'>
              <ModalTitle title='Nouvel item' icon={EditIcon} iconColor='text-action' iconBg='bg-action/20' />
            </ModalHeader>
              <ModalBody className='flex p-6'>
                <div className='flex flex-col gap-12 items-start scroll-y-auto w-full'>
                  {activeConfig && !detailsLoading ? (
                    itemDetailsData &&
                    inputConfigs[activeConfig]?.map((col: InputConfig) => {
                      if (col.type === 'input') {
                        return (
                          <div key={col.key} className='w-full'>
                            <Input
                              size='md'
                              classNames={{
                                label: `${fieldLabelClass} !text-c6`,
                              }}
                              type='text'
                              label={col.label}
                              labelPlacement='outside-top'
                              placeholder={`Entrez ${col.label}`}
                              isRequired
                              onChange={(e) => handleInputChange(col.dataPath, e.target.value)}
                            />
                          </div>
                        );
                      }
                      if (col.type === 'textarea') {
                        return (
                          <div key={col.key} className='w-full'>
                            <Textarea
                              size='md'
                              classNames={{
                                label: fieldLabelClass,
                              }}
                              label={col.label}
                              labelPlacement='outside-top'
                              placeholder={`Entrez ${col.label}`}
                              isRequired
                              minRows={3}
                              onChange={(e) => handleInputChange(col.dataPath, e.target.value)}
                            />
                          </div>
                        );
                      }
                      if (col.type === 'time') {
                        return (
                          <div key={col.key} className='w-full'>
                            <TimecodeInput label={col.label} handleInputChange={(value) => handleInputChange(col.dataPath, value)} />
                          </div>
                        );
                      }
                      if (col.type === 'date') {
                        return <DatePicker key={col.key} label={col.label} handleInputChange={(value) => handleInputChange(col.dataPath, value)} />;
                      }
                      if (col.type === 'selection') {
                        return <SelectionInput key={col.key} col={col} handleInputChange={handleInputChange} />;
                      }
                      if (col.type === 'inputs') {
                        return <MultipleInputs key={col.key} col={col} actualData={itemDetailsData} handleInputChange={handleInputChange} />;
                      }
                      return null;
                    })
                  ) : (
                    <Spinner color='current' className='text-c6' />
                  )}

                  {saveError && <div className='error'>{saveError}</div>}
                </div>
              </ModalBody>
              <ModalFooter className='flex items-center justify-end p-6 '>
                <div className='flex flex-row gap-6'>
                  <Button
                    onPress={handleSave}
                    isDisabled={saving}
                    radius='none'
                    className='h-[32px] px-2.5 text-base rounded-lg text-selected bg-action transition-all ease-in-out duration-200 navfilter flex items-center'>
                    Créer la ressource
                  </Button>
                </div>
              </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};
