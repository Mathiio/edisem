import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from '@heroui/react';
import { InputConfig } from '@/components/features/database/EditModal';
import { AddIcon, SortIcon } from '@/components/ui/icons';

interface SelectionInputProps {
  col: InputConfig;
  actualData?: any;
  handleInputChange: (path: string, value: any) => void;
}

type InputValue = {
  values: string;
  language?: string; // Make language optional
};

const MultipleInputs: React.FC<SelectionInputProps> = ({ col, actualData, handleInputChange }) => {
  const [inputValues, setInputValues] = useState<InputValue[]>([]);
  const isLanguageField = col.options && col.options[0] === 'language';

  useEffect(() => {
    if (actualData && actualData[0] && actualData[0][col.key] && actualData[0][col.key].length > 0) {
      let initialValues: InputValue[] = [];
      if (isLanguageField) {
        initialValues = actualData[0][col.key].map((data: any) => ({
          values: data['@value'] || '',
          language: data['@language'] || 'fr', // Assuming default language is 'fr'
        }));
      } else {
        initialValues = actualData[0][col.key].map((data: any) => ({
          values: data['@value'] || '',
        }));
      }

      setInputValues(initialValues);
    }
  }, [actualData, col.key, isLanguageField]);

  const handleChange = (index: number, newValue: string) => {
    const updatedValues = [...inputValues];
    updatedValues[index].values = newValue;
    setInputValues(updatedValues);
    if (isLanguageField) {
      handleInputChange(col.dataPath, updatedValues);
    } else {
      handleInputChange(
        col.dataPath,
        updatedValues.map((value) => value.values),
      );
    }
  };

  const handleLanguageChange = (index: number, newLanguage: string) => {
    const updatedValues = [...inputValues];
    updatedValues[index].language = newLanguage;
    setInputValues(updatedValues);
    handleInputChange(col.dataPath, updatedValues);
  };

  const handleAddInput = () => {
    setInputValues([...inputValues, { values: '', language: 'fr' }]);
  };

  const canAddMoreInputs = !isLanguageField || inputValues.length < 2;

  return (
    <div className='flex flex-col gap-2.5 w-full'>
      <div className='text-semibold'>{col.label}</div>
      {inputValues.map((value, index) => (
        <div key={`${col.key}-${index}`} className=' w-full flex flex-row gap-2.5 '>
          <Input
            classNames={{
              label: 'text-semibold !text-c6 text-2xl',
              inputWrapper: 'bg-c1 shadow-none border-1 border-200 w-full min-h-[50px]',
              input: 'h-[50px] min-h-[50px] w-full',
            }}
            className='min-h-[50px] w-full '
            type='text'
            labelPlacement='outside'
            placeholder={`Entrez ${col.label}`}
            defaultValue={value.values || ''}
            onChange={(e) => handleChange(index, e.target.value)}
          />
          {isLanguageField && (
            <div className='flex flex-row gap-2.5 mb-4'>
              <Dropdown
                classNames={{
                  base: 'w-fit',
                  backdrop: 'w-fit',
                  content:
                    'w-fit min-w-[80px] shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 rounded-xl border-2 border-c3',
                }}>
                <DropdownTrigger>
                  <Button startContent={<SortIcon size={16} className='text-c6' />} className='px-[15px] py-2.5 flex gap-2.5 bg-c3 border-none rounded-lg'>
                    {value.language === 'fr' ? 'Fr' : 'En'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label='Language selection'
                  variant='flat'
                  disallowEmptySelection
                  selectionMode='single'
                  className='p-2'
                  classNames={{
                    base: 'w-fit bg-transparent shadow-none border-0',
                    list: 'w-fit bg-transparent',
                  }}>
                  <DropdownItem
                    key='fr'
                    className='cursor-pointer text-c6 rounded-lg py-2 px-3 data-[hover=true]:!bg-c3 data-[selectable=true]:focus:!bg-c3'
                    onClick={() => {
                      handleLanguageChange(index, 'fr');
                    }}>
                    Fr
                  </DropdownItem>
                  <DropdownItem
                    key='en'
                    className='cursor-pointer text-c6 rounded-lg py-2 px-3 data-[hover=true]:!bg-c3 data-[selectable=true]:focus:!bg-c3'
                    onClick={() => {
                      handleLanguageChange(index, 'en');
                    }}>
                    En
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </div>
      ))}
      {canAddMoreInputs && (
        <Button
          startContent={<AddIcon size={16} />}
          className='px-[15px] py-2.5 min-h-[50px] flex gap-2.5 bg-c3 border-none rounded-lg w-full hover:text-action text-c6 font-medium'
          onClick={handleAddInput}>
          Ajouter {col.label}
        </Button>
      )}
    </div>
  );
};

export default MultipleInputs;
