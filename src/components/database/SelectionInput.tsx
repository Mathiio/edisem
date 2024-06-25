import React, { useState, useEffect } from 'react';
import { InputConfig } from './EditModal';
import { useFetchData } from '../../hooks/useFetchData';
import { Button, Input } from '@nextui-org/react';
import { CloseIcon, SearchIcon } from '../Utils/icons';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/dropdown';
import { Scrollbar } from '../Utils/Scrollbar';

interface SelectionInputProps {
  col: InputConfig;
  actualData: any;
  handleInputChange: (dataPath: string, value: string[]) => void;
}

export const SelectionInput: React.FC<SelectionInputProps> = ({ col, actualData, handleInputChange }) => {
  const initialValues = actualData[0][col.dataPath] || [];
  const [selectedValues, setSelectedValues] = useState<string[]>(
    initialValues.map((item: any) => item.value_resource_id),
  );
  const [idToDisplayNameMap, setIdToDisplayNameMap] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // State for sorting order

  const selectionId = col.selectionId?.[0] ?? null;
  const { data: speakersData } = useFetchData(selectionId);

  useEffect(() => {
    if (speakersData) {
      const map: { [key: string]: string } = {};
      speakersData.forEach((item: any) => {
        if (item['o:id'] && item['dcterms:title'] && item['dcterms:title'][0]) {
          map[item['o:id']] = item['dcterms:title'][0]['@value'];
        }
      });
      setIdToDisplayNameMap(map);
    }
  }, [speakersData]);

  if (!speakersData || !Array.isArray(speakersData) || speakersData.length === 0) {
    return <div>Données non disponibles pour {col.label}</div>;
  }

  const allValues = speakersData.map((item: any) => item['o:id']);
  const nonSelectedValues = allValues.filter((value) => !selectedValues.includes(value));

  // Function to handle sorting based on sortOrder
  const sortedValues = [...nonSelectedValues].sort((id1, id2) => {
    const displayName1 = idToDisplayNameMap[id1] || '';
    const displayName2 = idToDisplayNameMap[id2] || '';
    if (sortOrder === 'asc') {
      return displayName1.localeCompare(displayName2);
    } else {
      return displayName2.localeCompare(displayName1);
    }
  });

  // Function to handle select action
  const handleSelect = (id: string) => {
    const newSelectedValues = [...selectedValues, id];
    setSelectedValues(newSelectedValues);
    handleInputChange(col.dataPath, newSelectedValues);
  };

  // Function to handle deselect action
  const handleDeselect = (id: string) => {
    const newSelectedValues = selectedValues.filter((item) => item !== id);
    setSelectedValues(newSelectedValues);
    handleInputChange(col.dataPath, newSelectedValues);
  };

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Function to handle sort order change
  const handleSortOrderChange = (key: any) => {
    const selectedKey = Array.from(key)[0];
    if (selectedKey === 'asc') {
      setSortOrder('asc');
    } else if (selectedKey === 'desc') {
      setSortOrder('desc');
    }
  };

  // Function to filter nonSelectedValues based on searchTerm
  const filteredNonSelectedValues = sortedValues.filter((id) => {
    const displayName = idToDisplayNameMap[id] || '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className='flex flex-col gap-10' key={col.key}>
      <label>{col.label}</label>
      <div className='flex flex-row gap-10 items-center'>
        <Input
          classNames={{
            base: '',
            clearButton: 'bg-default-600',
            mainWrapper: ' h-[40px] ',
            input: 'text-default-400  Inter  text-16 nav_searchbar h-[40px] px-[10px]',
            inputWrapper:
              ' shadow-none border-1 border-default-200 group-data-[focus=true]:bg-default-200 rounded-8 font-normal text-default-600 bg-default-50 dark:bg-default-200 px-[15px] py-[10px] h-[40px] ',
          }}
          placeholder='Recherche avancée...'
          startContent={<SearchIcon size={16} />}
          value={searchTerm}
          onChange={handleSearchChange}
          type='search'
          fullWidth
        />

        <Dropdown>
          <DropdownTrigger>
            <Button
              startContent={<SearchIcon size={9} />}
              className='px-[15px] py-10 flex gap-10 bg-default-200 border-none rounded-8'>
              Trier
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Sort order selection'
            variant='flat'
            disallowEmptySelection
            selectedKeys={new Set([sortOrder])}
            onSelectionChange={handleSortOrderChange}
            selectionMode='single'>
            <DropdownItem key='asc'>A - Z</DropdownItem>
            <DropdownItem key='desc'>Z - A</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className='flex flex-col w-full'>
        <ul className='flex items-center gap-10 pt-10 pb-20 flex-wrap'>
          <p className='text-default-400'>Selection :</p>
          {selectedValues.map((id, index) => (
            <Button
              key={index}
              onClick={() => handleDeselect(id)}
              radius='none'
              className={`py-10 px-10 gap-10 text-14 rounded-8 bg-default-action text-default-selected transition-all ease-in-out duration-200 navfilter flex items-center`}
              endContent={<CloseIcon size={18} />}>
              {idToDisplayNameMap[id]}
            </Button>
          ))}
        </ul>
        <Scrollbar>
          <ul className='flex items-center gap-20 py-10 flex-wrap max-h-[150px]'>
            {filteredNonSelectedValues.map((id, index) => (
              <Button
                key={index}
                onClick={() => handleSelect(id)}
                radius='none'
                className={` py-10 px-10 text-14 rounded-8 text-default-600 bg-default-50 hover:text-default-selected hover:bg-default-action transition-all ease-in-out duration-200  flex items-center`}>
                {idToDisplayNameMap[id]}
              </Button>
            ))}
          </ul>
        </Scrollbar>
      </div>
    </div>
  );
};

export default SelectionInput;
