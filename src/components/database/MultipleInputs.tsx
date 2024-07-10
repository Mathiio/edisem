import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from '@nextui-org/react';
import { InputConfig } from '@/components/database/EditModal';
import { AddIcon, SortIcon } from '@/components/utils/Icons';

interface SelectionInputProps {
  col: InputConfig;
  actualData?: any;
  handleInputChange: (path: string, value: any) => void;
}

type InputValue = {
  values: string;
  language: string;
};

const MultipleInputs: React.FC<SelectionInputProps> = ({ col, actualData, handleInputChange }) => {
  const [inputValues, setInputValues] = useState<InputValue[]>([]);

  useEffect(() => {
    if (actualData && actualData[0] && actualData[0][col.key] && actualData[0][col.key].length > 0) {
      const initialValues: InputValue[] = actualData[0][col.key].map((data: any) => ({
        values: data['@value'] || '',
        language: data['@language'] || 'fr', // Assuming default language is 'fr'
      }));

      setInputValues(initialValues);
    }
  }, [actualData, col.key]);

  const handleChange = (index: number, newValue: string) => {
    const updatedValues = [...inputValues];
    updatedValues[index].values = newValue;
    setInputValues(updatedValues);
    handleInputChange(col.dataPath, updatedValues);
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

  const isLanguageField = col.options && col.options[0] === 'language';
  const canAddMoreInputs = !isLanguageField || inputValues.length < 2;

  return (
    <div className='flex flex-col gap-10 w-full'>
      <div className='text-semibold'>{col.label}</div>
      {inputValues.map((value, index) => (
        <div key={`${col.key}-${index}`} className=' w-full flex flex-row gap-10 '>
          <Input
            classNames={{
              label: 'text-semibold',
              inputWrapper: 'bg-default-50 shadow-none border-1 border-default-200 w-full min-h-[50px]',
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
            <div className='flex flex-row gap-10 mb-4'>
              <Dropdown classNames={{ content: 'w-fit min-w-[10px]', base: 'w-[fit]', backdrop: 'w-fit' }}>
                <DropdownTrigger>
                  <Button
                    startContent={<SortIcon size={16} className='text-default-600' />}
                    className='px-[15px] py-10 flex gap-10 bg-default-200 border-none rounded-8'>
                    {value.language === 'fr' ? 'Fr' : 'En'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  classNames={{ base: 'w-fit', list: 'w-fit' }}
                  aria-label='Language selection'
                  variant='flat'
                  disallowEmptySelection
                  selectionMode='single'>
                  <DropdownItem
                    onClick={() => {
                      handleLanguageChange(index, 'fr');
                    }}
                    key='fr'>
                    Fr
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      handleLanguageChange(index, 'en');
                    }}
                    key='en'>
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
          className='px-[15px] py-10 flex gap-10 bg-default-200 border-none rounded-8 w-full hover:text-default-action text-default-600 font-semibold'
          onClick={handleAddInput}>
          Ajouter {col.label}
        </Button>
      )}
    </div>
  );
};

export default MultipleInputs;
