import React, { useState, useEffect } from 'react';
import { InputConfig } from '@/components/database/EditModal';
import { usegetDataByClass } from '@/hooks/useFetchData';
import { Button, Input, Spinner } from '@heroui/react';
import { CrossIcon, SearchIcon, SortIcon } from '@/components/Utils/icons';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';

interface SelectionInputProps {
  col: InputConfig;
  actualData?: any;
  handleInputChange: (dataPath: string, value: string[]) => void;
}

// Reducer function to slice the result and append '...'
const reducer = (text: any, maxLength = 70) => {
  const str = String(text); // Convert text to a string
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const SelectionInput: React.FC<SelectionInputProps> = ({ col, actualData, handleInputChange }) => {
  if (col.dataPath === 'cito:AuthorSelfCitation') {
    col.dataPath = 'cito:hasCitedEntity';
  }

  const initialValues = actualData?.[0]?.[col.dataPath] || [];

  const [selectedValues, setSelectedValues] = useState<string[]>(
    initialValues.map((item: any) => item.value_resource_id),
  );
  //console.log('selectedValues', selectedValues);

  const [idToDisplayNameMap, setIdToDisplayNameMap] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // State for sorting order
  const [nonSelectedValues, setNonSelectedValues] = useState<string[]>([]); // State for non-selected values

  const selectionId = col.selectionId?.[0] ?? null;

  const { data: speakersData, loading } = usegetDataByClass(selectionId);

  useEffect(() => {
    if (speakersData) {
      let filteredData = speakersData;

      // Apply filtering based on selectionId and item_set
      if (selectionId === 34 && col.options?.[1]) {
        console.log(filteredData);
        filteredData = speakersData.filter((item: any) => item['o:item_set'][0]?.['o:id'] === col.options?.[1]);
      }

      const map: { [key: string]: string } = {};
      if (filteredData[0]?.['@type']?.[1] === 'cito:AuthorSelfCitation') {
        filteredData.forEach((item: any) => {
          if (item['o:id'] && item['cito:hasCitedEntity']?.[0]?.['@value']) {
            map[item['o:id']] = item['cito:hasCitedEntity'][0]['@value'];
          }
        });
      } else {
        filteredData.forEach((item: any) => {
          if (item['o:id'] && item['dcterms:title'] && item['dcterms:title'][0]) {
            map[item['o:id']] = item['dcterms:title'][0]['@value'];
          }
        });
      }

      //console.log('map', map);
      setIdToDisplayNameMap(map);

      const allValues = filteredData.map((item: any) => item['o:id']);
      const nonSelectedValues = allValues.filter((value) => !selectedValues.includes(value));
      setNonSelectedValues(nonSelectedValues);
      //console.log('nonSelectedValues', nonSelectedValues);
    }
  }, [speakersData, selectionId, selectedValues]);

  if (loading) {
    return (
      <div className='flex items-center flex-col w-full'>
        <Spinner label={`Chargement des ${col.label}`} color='secondary' size='md' />
      </div>
    );
  }

  if (!speakersData || !Array.isArray(speakersData) || speakersData.length === 0) {
    return <div>Données non disponibles pour {col.label}</div>;
  }

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
    console.log(newSelectedValues);
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
    <div className='flex flex-col gap-10 w-full' key={col.key}>
      <label>{col.label}</label>
      <div className='flex flex-row gap-10 items-center'>
        <Input
          classNames={{
            base: '',
            clearButton: 'bg-600',
            mainWrapper: ' h-[40px] ',
            input: 'text-c5  Inter  text-16 nav_searchbar h-[40px] px-[10px]',
            inputWrapper:
              ' shadow-none border-1 border-200 group-data-[focus=true]:bg-c3 rounded-8 font-normal text-c6 bg-c1 dark:bg-c3 px-[15px] py-[10px] h-[40px] ',
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
              startContent={<SortIcon size={16} className='text-c6' />}
              className='px-[15px] py-10 h-full flex gap-10 bg-c3 border-none rounded-8'>
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
            <DropdownItem key='asc' className='text-c6'>
              A - Z
            </DropdownItem>
            <DropdownItem key='desc' className='text-c6'>
              Z - A
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className='flex flex-col w-full'>
        <ul className='flex items-center gap-10 pt-10 pb-20 flex-wrap'>
          <p className='text-c5'>Selection :</p>
          {selectedValues.map((id, index) => (
            <Button
              key={index}
              onClick={() => handleDeselect(id)}
              radius='none'
              className={`py-10 h-full px-10 gap-10 text-14 rounded-8 bg-action text-selected transition-all ease-in-out duration-200 navfilter flex items-center`}
              endContent={<CrossIcon size={18} />}>
              {reducer(idToDisplayNameMap[id], 30)}
            </Button>
          ))}
        </ul>
        <ul className='flex items-center gap-20 py-10 flex-wrap max-h-[150px] overflow-y-auto'>
          {filteredNonSelectedValues.map((id, index) => (
            <Button
              key={index}
              onClick={() => handleSelect(id)}
              radius='none'
              className={` py-10 h-full px-10 text-14 rounded-8 text-c6 bg-c1 hover:text-selected hover:bg-action transition-all ease-in-out duration-200  flex items-center`}>
              {reducer(idToDisplayNameMap[id])}
            </Button>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectionInput;
