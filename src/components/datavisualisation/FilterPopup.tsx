import { useState } from 'react';
import {
  Button,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from '@nextui-org/react';
import { ArrowIcon, AddIcon, CrossIcon, PlusIcon, DotsIcon, TrashIcon, CopyIcon } from '@/components/utils/icons';

interface FilterPopupProps {
  itemsDataviz: any[];
  // onSearch: (results: any[]) => void;
  // onItemSelect: (item: any) => void;
}

type DataLink = {
  id: string;
  type: string;
  title: string;
  links: string[];
};

type DataLinks = {
  [key: string]: DataLink;
};

type FilterCondition = {
  type: string;
  value: string;
  operator: string;
};

type FilterGroup = {
  name: string;
  isExpanded: boolean;
  conditions: FilterCondition[];
};

const FilterPopup: React.FC<FilterPopupProps & { onSearch: (results: any[]) => void }> = ({
  itemsDataviz,
  onSearch,
}) => {
  const AVAILABLE_TYPES = ['conf', 'actant', 'bibliographies', 'médiagraphies', 'citations', 'keyword'];
  const OPERATORS = [
    { key: 'equals', label: 'Égal à' },
    { key: 'contains', label: 'Contient' },
    { key: 'notEquals', label: 'Autre que' },
  ];
  const FIELD_TYPES = [
    { key: 'type', label: 'Type' },
    { key: 'title', label: 'Titre' },
    { key: 'links', label: 'Liens' },
  ];

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState<string>('');

  const openModal = (groupIndex: number, currentName: string) => {
    setActiveGroupIndex(groupIndex);
    setNewGroupName(currentName);
    onOpen();
  };

  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  const applyFilters = () => {
    let filteredData = itemsDataviz;
    console.log(filteredData);
    filterGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        switch (condition.operator) {
          case 'equals':
            filteredData = filteredData.filter((item) => item[condition.type] === condition.value);
            break;
          case 'contains':
            filteredData = filteredData.filter((item) => item[condition.type]?.toString().includes(condition.value));
            break;
          case 'notEquals':
            filteredData = filteredData.filter((item) => item[condition.type] !== condition.value);
            break;
          default:
            break;
        }
      });
    });

    console.log('filteredData');
    console.log(filteredData);
    onSearch(filteredData);
  };

  const addGroup = () => {
    const newGroupNumber = filterGroups.length + 1;
    setFilterGroups([
      ...filterGroups,
      {
        name: `Groupe ${newGroupNumber}`,
        isExpanded: true,
        conditions: [],
      },
    ]);
  };

  const removeGroup = (groupIndex: number) => {
    setFilterGroups(filterGroups.filter((_, i) => i !== groupIndex));
  };

  const duplicateGroup = (groupIndex: number) => {
    const groupToDuplicate = filterGroups[groupIndex];
    const newGroupNumber = filterGroups.length + 1;
    setFilterGroups([
      ...filterGroups,
      {
        ...groupToDuplicate,
        name: `${groupToDuplicate.name} (copie)`,
        conditions: [...groupToDuplicate.conditions],
      },
    ]);
  };

  const renameGroup = (groupIndex: number, newName: string) => {
    const updatedGroups = [...filterGroups];
    updatedGroups[groupIndex].name = newName;
    setFilterGroups(updatedGroups);
    onClose();
  };

  const toggleGroupExpansion = (groupIndex: number) => {
    const newGroups = [...filterGroups];
    newGroups[groupIndex].isExpanded = !newGroups[groupIndex].isExpanded;
    setFilterGroups(newGroups);
  };

  const addCondition = (groupIndex: number) => {
    const newGroups = [...filterGroups];
    newGroups[groupIndex].conditions.push({
      type: 'type',
      value: AVAILABLE_TYPES[0],
      operator: 'equals',
    });
    setFilterGroups(newGroups);
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const newGroups = [...filterGroups];
    newGroups[groupIndex].conditions.splice(conditionIndex, 1);
    setFilterGroups(newGroups);
  };

  const updateCondition = (
    groupIndex: number,
    conditionIndex: number,
    field: keyof (typeof filterGroups)[0]['conditions'][0],
    value: string,
  ) => {
    const updatedGroups = [...filterGroups];
    updatedGroups[groupIndex].conditions[conditionIndex][field] = value;
    setFilterGroups(updatedGroups);
  };

  const getDropdownLabel = (field: string, condition: FilterCondition) => {
    switch (field) {
      case 'type':
        return FIELD_TYPES.find((f) => f.key === condition.type)?.label || 'Type';
      case 'operator':
        return OPERATORS.find((op) => op.key === condition.operator)?.label || 'Égal à';
      case 'value':
        if (condition.type === 'type') {
          return condition.value || AVAILABLE_TYPES[0];
        }
        return condition.value || 'Sélectionner...';
      default:
        return 'Sélectionner...';
    }
  };

  return (
    <div className='w-full flex flex-col gap-20 h-full overflow-hidden'>
      <div className='flex flex-col gap-10'>
        <Button onClick={applyFilters}>recherche</Button>

        <Button
          onClick={addGroup}
          className='text-14 flex justify-start w-full gap-2 rounded-0 text-default-600 bg-transparent'>
          <PlusIcon size={12} />
          Ajouter un groupe de filtres
        </Button>
        <Divider />
      </div>
      <div className='flex flex-col gap-10 overflow-y-auto'>
        {filterGroups.map((group, groupIndex) => (
          <div key={groupIndex} className='border rounded-lg gap-4 p-4 bg-default-200 rounded-8'>
            <div className='flex items-center justify-between  '>
              <div className='flex items-center gap-2'>
                <Button className='text-default-600' onClick={() => toggleGroupExpansion(groupIndex)}>
                  <ArrowIcon
                    size={14}
                    className={`transition-all ease-in-out duration-200 ${group.isExpanded ? 'rotate-90' : 'rotate-0'}`}
                  />
                </Button>
                <span className='font-medium'>{group.name}</span>
              </div>
              <Dropdown className='min-w-0 w-fit p-2'>
                <DropdownTrigger>
                  <Button size='md'>
                    <DotsIcon size={14} className='text-default-600' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className='w-32'>
                  <DropdownItem key='rename' className='w-32' onClick={() => openModal(groupIndex, group.name)}>
                    Renommer
                  </DropdownItem>
                  <DropdownItem
                    key='duplicate'
                    className='w-32'
                    startContent={<CopyIcon size={12} />}
                    onClick={() => duplicateGroup(groupIndex)}>
                    Dupliquer
                  </DropdownItem>
                  <DropdownItem
                    key='delete'
                    className='flex gap-1.5 w-32'
                    startContent={<TrashIcon size={12} />}
                    onClick={() => removeGroup(groupIndex)}>
                    <p className='text-default-600 text-16'>Supprimer</p>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            {group.isExpanded && (
              <>
                <div className='space-y-2 flex flex-col gap-1 py-4'>
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className='flex items-center gap-2'>
                      <Dropdown className='min-w-0 w-fit p-2'>
                        <DropdownTrigger>
                          <Button
                            endContent={<ArrowIcon size={12} className='text-default-600' />}
                            className='px-2 py-2 flex gap-10 border-default-400 border-2 rounded-8 min-w-[80px]'>
                            {getDropdownLabel('type', condition)}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          variant='flat'
                          disallowEmptySelection
                          selectionMode='single'
                          selectedKeys={new Set([condition.type])}
                          onSelectionChange={(selectedKey) => {
                            const value = Array.from(selectedKey)[0];
                            updateCondition(groupIndex, conditionIndex, 'type', value as string);
                          }}>
                          {FIELD_TYPES.map((type) => (
                            <DropdownItem key={type.key}>{type.label}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>

                      <Dropdown className='min-w-0 w-fit p-2'>
                        <DropdownTrigger>
                          <Button
                            endContent={<ArrowIcon size={12} className='text-default-600' />}
                            className='px-2 py-2 flex justify-between gap-10 border-default-400 border-2 rounded-8 min-w-[105px]'>
                            {getDropdownLabel('operator', condition)}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          variant='flat'
                          disallowEmptySelection
                          selectionMode='single'
                          selectedKeys={new Set([condition.operator])}
                          onSelectionChange={(selectedKey) => {
                            const value = Array.from(selectedKey)[0];
                            updateCondition(groupIndex, conditionIndex, 'operator', value as string);
                          }}>
                          {OPERATORS.map((op) => (
                            <DropdownItem key={op.key}>{op.label}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>

                      {condition.type === 'type' ? (
                        <Dropdown className='flex flex-start min-w-0 w-fit p-2'>
                          <DropdownTrigger className='w-full flex flex-start'>
                            <Button
                              endContent={<ArrowIcon size={12} className='text-default-600' />}
                              className='justify-between px-2 py-2 flex gap-10 border-default-400 border-2 rounded-8 w-[120px] '>
                              {getDropdownLabel('value', condition)}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            variant='flat'
                            disallowEmptySelection
                            selectionMode='single'
                            selectedKeys={new Set([condition.value])} // Ajoutez ceci
                            onSelectionChange={(selectedKey) => {
                              const value = Array.from(selectedKey)[0];
                              updateCondition(groupIndex, conditionIndex, 'value', value as string);
                            }}>
                            {AVAILABLE_TYPES.map((type) => (
                              <DropdownItem key={type}>{type}</DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      ) : (
                        <Input
                          classNames={{
                            mainWrapper: 'h-full',
                            input: 'text-default-400 ',
                            inputWrapper:
                              'shadow-none bg-default-100 border-1 border-default-100 group-data-[focus=true]:bg-default-100 rounded-8 font-normal text-default-600 bg-default-100 dark:bg-default-100 h-full',
                          }}
                          placeholder='Nom ...'
                          onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                          type='search'
                          fullWidth
                        />
                      )}

                      <Button variant='ghost' size='sm' onClick={() => removeCondition(groupIndex, conditionIndex)}>
                        <CrossIcon size={14} className='text-default-600' />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => addCondition(groupIndex)}
                  className='text-14 flex justify-start w-full gap-2 rounded-0 bg-default-transparent text-default-600'>
                  <PlusIcon size={12} className='text-default-600' />
                  Ajouter une condition
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      <Modal closeButton aria-labelledby='modal-title' isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <span>Renommer le groupe</span>
          </ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder='Entrez un nouveau nom'
            />
            <Button
              onClick={() => {
                if (newGroupName.trim() !== '') {
                  renameGroup(activeGroupIndex!, newGroupName);
                }
              }}>
              Renommer
            </Button>
            <Button onClick={onClose}>Annuler</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FilterPopup;
