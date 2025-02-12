import React, { useState, useEffect } from 'react';
import {
  Button,
  Link,
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
import { ArrowIcon, CrossIcon, PlusIcon, DotsIcon } from '@/components/utils/icons';
import * as Items from '@/services/Items';

import { getItemByID } from '@/services/api';
import { getLinksFromType } from '@/services/Links';

export const ITEM_PROPERTIES: any = {
  actant: [
    { key: 'firstname', label: 'Prénom' },
    { key: 'lastname', label: 'Nom' },
    {
      key: 'laboratories',
      label: 'Laboratoire',
      transform: (labs: any[]) => labs.map((lab) => lab.title).join(', '),
    },
    {
      key: 'doctoralSchools',
      label: 'Ecole doctorale',
      transform: (schools: any[]) => schools.map((school) => school.title).join(', '),
    },
    {
      key: 'universities',
      label: 'Université',
      transform: (universities: any[]) => universities.map((uni) => uni.title).join(', '),
    },
  ],
  conference: [
    { key: 'title', label: 'Titre' },
    {
      key: 'actant',
      label: 'Actant',
      transform: async (id: any) => {
        const item = await getItemByID(id);
        return item?.title || 'Inconnu';
      },
    },
    {
      key: 'motcles',
      label: 'Mot clé',
      transform: async (ids: any) => {
        const titles = await Promise.all(
          ids.map(async (id: any) => {
            const item = await getItemByID(id);
            return item?.title || 'Inconnu';
          }),
        );
        return titles.join(', ');
      },
    },
    { key: 'date', label: 'Date' },
  ],
  citation: [
    {
      key: 'actant',
      label: 'Actant',
      transform: async (id: any) => {
        const item = await getItemByID(id);
        return item?.title || 'Inconnu';
      },
    },
    { key: 'citation', label: 'Citation' },
    {
      key: 'motcles',
      label: 'Mot clé',
      transform: async (ids: any) => {
        const titles = await Promise.all(
          ids.map(async (id: any) => {
            const item = await getItemByID(id);
            return item?.title || 'Inconnu';
          }),
        );
        return titles.join(', ');
      },
    },
  ],
  collection: [{ key: 'title', label: 'Nom' }],
  keyword: [
    { key: 'title', label: 'Mot Clé' },
    { key: 'definition', label: 'Définition' },
  ],
  university: [
    { key: 'title', label: 'Nom' },
    { key: 'country', label: 'Pays' },
  ],
  doctoralschool: [{ key: 'title', label: 'Nom' }],
  laboratory: [{ key: 'title', label: 'Nom' }],
  bibliography: [{ key: 'title', label: 'Titre' }],
  mediagraphie: [{ key: 'title', label: 'Titre' }],
};

export const ITEM_TYPES = {
  citations: 'citation',
  conférences: 'conference',
  actants: 'actant',
  'mots clés': 'keyword',
  bibliographies: 'bibliography',
  médiagraphies: 'mediagraphie',
  collections: 'collection',
  universités: 'university',
  laboratoires: 'laboratory',
  'écoles doctorales': 'doctoralschool',
};

const OPERATORS = [
  { key: 'contains', label: 'Contient' },
  { key: 'notEquals', label: 'Différent de' },
];

export interface FilterPopupProps {
  getConfs: () => any[];
  getUniversities: () => any[];
  getActants: () => any[];
  getDoctoralSchools: () => any[];
  getLaboratories: () => any[];
  getCitations: () => any[];
  getBibliographies: () => any[];
  getMediagraphies: () => any[];
  getCollections: () => any[];
  getKeywords: () => any[];
  onSearch: (results: any[]) => void;
}

type FilterCondition = {
  property: string;
  operator: string;
  value: string;
};

export type FilterGroup = {
  name: string;
  isExpanded: boolean;
  itemType: string;
  conditions: FilterCondition[];
};

const STORAGE_KEY = 'filterGroups';

const getInitialFilterGroups = (): FilterGroup[] => {
  const savedFilters = localStorage.getItem(STORAGE_KEY);
  if (savedFilters) {
    try {
      return JSON.parse(savedFilters);
    } catch (e) {
      console.error('Error parsing saved filters:', e);
    }
  }
  return [
    {
      name: 'Groupe 1',
      isExpanded: true,
      itemType: '',
      conditions: [],
    },
  ];
};

export default function FilterPopup({ onSearch }: FilterPopupProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(getInitialFilterGroups());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filterGroups));
  }, [filterGroups]);

  const getPropertiesByType = (type: any): any => {
    return ITEM_PROPERTIES[type] || [];
  };

  const getDataByType = async (type: string): Promise<any[]> => {
    switch (type) {
      case 'citation':
        return (await Items.getCitations()) || [];
      case 'conference':
        return (await Items.getConfs()) || [];
      case 'actant':
        return (await Items.getActants()) || [];
      case 'keyword':
        return (await Items.getKeywords()) || [];
      case 'bibliography':
        return (await Items.getBibliographies()) || [];
      case 'mediagraphie':
        return (await Items.getMediagraphies()) || [];
      case 'collection':
        return (await Items.getCollections()) || [];
      case 'university':
        return (await Items.getUniversities()) || [];
      case 'laboratory':
        return (await Items.getLaboratories()) || [];
      case 'doctoralschool':
        return (await Items.getDoctoralSchools()) || [];
      default:
        return [];
    }
  };

  const addGroup = () => {
    setFilterGroups((prev) => [
      ...prev,
      {
        name: `Groupe ${prev.length + 1}`,
        isExpanded: true,
        itemType: '',
        conditions: [],
      },
    ]);
  };

  const removeGroup = (groupIndex: number) => {
    setFilterGroups((prev) => prev.filter((_, i) => i !== groupIndex));
  };

  const duplicateGroup = (groupIndex: number) => {
    setFilterGroups((prev) => [
      ...prev,
      {
        ...prev[groupIndex],
        name: `${prev[groupIndex].name} (copie)`,
      },
    ]);
  };

  const toggleGroupExpansion = (groupIndex: number) => {
    setFilterGroups((prev) =>
      prev.map((group, i) => (i === groupIndex ? { ...group, isExpanded: !group.isExpanded } : group)),
    );
  };

  const addCondition = (groupIndex: number) => {
    setFilterGroups((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        return {
          ...group,
          conditions: [
            ...group.conditions,
            {
              property: '',
              operator: 'contains',
              value: '',
            },
          ],
        };
      }),
    );
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    setFilterGroups((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        return {
          ...group,
          conditions: group.conditions.filter((_, j) => j !== conditionIndex),
        };
      }),
    );
  };

  const updateCondition = (groupIndex: number, conditionIndex: number, field: keyof FilterCondition, value: string) => {
    setFilterGroups((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        return {
          ...group,
          conditions: group.conditions.map((condition, j) => {
            if (j !== conditionIndex) return condition;
            return { ...condition, [field]: value };
          }),
        };
      }),
    );
  };

  const updateGroupType = (groupIndex: number, itemType: string) => {
    setFilterGroups((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        return {
          ...group,
          itemType,
          conditions: [],
        };
      }),
    );
  };

  const getPropertyValue = async (item: any, property: string): Promise<any> => {
    if (property in item) {
      const value = item[property];
      const propertyConfig = ITEM_PROPERTIES[item.type]?.find((p: any) => p.key === property);
      if (propertyConfig?.transform) {
        const transformed = await propertyConfig.transform(value);
        return transformed;
      }

      return value;
    }

    const propertyConfig = ITEM_PROPERTIES[item.type]?.find((p: any) => p.key === property);

    if (!propertyConfig) return null;

    if (propertyConfig.transform) {
      try {
        const transformed = await propertyConfig.transform(item[property]);
        return transformed;
      } catch (error) {
        return null;
      }
    }

    return null;
  };

  const compareValues = async (itemValue: any, searchValue: any, operator: string): Promise<boolean> => {
    if (itemValue === null || itemValue === undefined || searchValue === null || searchValue === undefined) {
      return false;
    }

    const prepareValue = (value: any): string => {
      if (typeof value === 'string') {
        return value.toLowerCase().trim();
      }
      return String(value).toLowerCase().trim();
    };

    const normalizedSearchValue = prepareValue(searchValue);
    const normalizedItemValue = prepareValue(itemValue);

    let result;
    switch (operator) {
      case 'contains':
        result = normalizedItemValue.includes(normalizedSearchValue);
        break;
      case 'notEquals':
        result = normalizedItemValue !== normalizedSearchValue;
        break;
      default:
        result = false;
    }

    return result;
  };

  const applyFilters = async () => {
    const results: any[] = [];

    for (const group of filterGroups) {
      if (!group.itemType) continue;

      const items = await getDataByType(group.itemType);

      for (const item of items) {
        let matchesAllConditions = true;

        for (const condition of group.conditions) {
          if (!condition.property || !condition.value) {
            continue;
          }

          try {
            const itemValue = await getPropertyValue(item, condition.property);
            const matches = await compareValues(itemValue, condition.value, condition.operator);

            if (!matches) {
              matchesAllConditions = false;
              break;
            }
          } catch (error) {
            console.error('Error processing condition:', error);
            matchesAllConditions = false;
            break;
          }

          if (matchesAllConditions) {
            try {
              const links = await getLinksFromType(item, group.itemType);
              const title = item.title || (await getPropertyValue(item, 'title')) || '';

              results.push({
                id: item.id,
                type: group.itemType,
                title,
                links,
              });
            } catch (error) {
              console.error('Error adding result item:', error);
            }
          }
        }
      }

      onSearch(results);
    }
  };

  const resetFilters = () => {
    setFilterGroups([
      {
        name: 'Groupe 1',
        isExpanded: true,
        itemType: '',
        conditions: [],
      },
    ]);
  };

  return (
    <div className='w-full flex flex-col gap-4 h-full overflow-hidden'>
      <div className='flex flex-col gap-4'>
        <Link
          onClick={addGroup}
          underline='none'
          size={'sm'}
          className='text-14 flex justify-start w-full gap-2 rounded-0 text-c6 bg-transparent cursor-pointer'>
          <PlusIcon size={12} />
          Ajouter un groupe de filtres
        </Link>
        <Divider />
      </div>

      <div className='flex flex-col flex-1 gap-3 overflow-y-auto'>
        {filterGroups.map((group, groupIndex) => (
          <div key={groupIndex} className='border rounded-lg gap-4 p-4 bg-c3 rounded-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Button className='text-c6' onClick={() => toggleGroupExpansion(groupIndex)}>
                  <ArrowIcon
                    size={14}
                    className={`transition-all duration-200 ${group.isExpanded ? 'rotate-90' : ''}`}
                  />
                </Button>
                <span className='text-14 font-semibold text-c6'>{group.name}</span>
              </div>

              <Dropdown className='min-w-0 w-fit p-2'>
                <DropdownTrigger>
                  <Button size='sm'>
                    <DotsIcon size={14} className='text-c6' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className='w-32'>
                  <DropdownItem
                    className='flex gap-1.5 w-32'
                    onClick={() => {
                      setActiveGroupIndex(groupIndex);
                      setNewGroupName(group.name);
                      onOpen();
                    }}>
                    Renommer
                  </DropdownItem>
                  <DropdownItem onClick={() => duplicateGroup(groupIndex)}>Dupliquer</DropdownItem>
                  <DropdownItem onClick={() => removeGroup(groupIndex)}>Supprimer</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            {group.isExpanded && (
              <>
                <div className='w-full flex gap-2 items-center mt-4 mb-2'>
                  <p className='text-14 text-c6 font-semibold text-c6'>Ou</p>
                  <Dropdown className='min-w-0 w-full p-2'>
                    <DropdownTrigger className='min-w-0 w-full'>
                      <Button className='text-14 text-c6 px-2 py-2 flex justify-between gap-10 bg-c4 border-2 rounded-8 w-full'>
                        {group.itemType
                          ? Object.entries(ITEM_TYPES).find(([, value]) => value === group.itemType)?.[0]
                          : "Sélectionner un type d'item"}
                        <ArrowIcon size={12} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      className='w-full'
                      selectionMode='single'
                      selectedKeys={group.itemType ? [group.itemType] : []}
                      onSelectionChange={(keys) => {
                        const type = Array.from(keys)[0] as string;
                        updateGroupType(groupIndex, type);
                      }}>
                      {Object.entries(ITEM_TYPES).map(([label, value]) => (
                        <DropdownItem className='min-w-0 w-full' key={value}>
                          {label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <div className={`flex flex-col gap-2 ${group.conditions.length > 0 ? 'mb-4' : ''}`}>
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className='flex items-center gap-2'>
                      <Dropdown className='min-w-0 w-fit p-2'>
                        <DropdownTrigger>
                          <Button className='text-14 text-c6 px-2 py-2 flex gap-10 justify-between bg-c4 border-2 rounded-8 min-w-[118px]'>
                            {(() => {
                              const label =
                                getPropertiesByType(group.itemType).find((prop: any) => prop.key === condition.property)
                                  ?.label || 'Propriété';
                              return label.length > 11 ? `${label.slice(0, 9)}...` : label;
                            })()}
                            <ArrowIcon size={12} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          selectionMode='single'
                          selectedKeys={condition.property ? [condition.property] : []}
                          onSelectionChange={(keys) => {
                            const prop = Array.from(keys)[0] as string;
                            updateCondition(groupIndex, conditionIndex, 'property', prop);
                          }}>
                          {getPropertiesByType(group.itemType).map((prop: any) => (
                            <DropdownItem key={prop.key}>{prop.label}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>

                      <Dropdown className='min-w-0 w-fit p-2'>
                        <DropdownTrigger>
                          <Button className='text-14 text-c6 px-2 py-2 flex justify-between gap-10 bg-c4 border-2 rounded-8 min-w-[110px]'>
                            {(() => {
                              const label = OPERATORS.find((op) => op.key === condition.operator)?.label || 'Opérateur';
                              return label.length > 10 ? `${label.slice(0, 8)}...` : label;
                            })()}
                            <ArrowIcon size={12} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          selectionMode='single'
                          selectedKeys={[condition.operator]}
                          onSelectionChange={(keys) => {
                            const op = Array.from(keys)[0] as string;
                            updateCondition(groupIndex, conditionIndex, 'operator', op);
                          }}>
                          {OPERATORS.map((op) => (
                            <DropdownItem key={op.key}>{op.label}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>

                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                        placeholder='Valeur...'
                        classNames={{
                          mainWrapper: 'h-full',
                          input: 'text-c5 ',
                          inputWrapper:
                            'shadow-none bg-c2 border-1 border-100 group-data-[focus=true]:bg-c2 rounded-8 font-normal text-c6 bg-c2 dark:bg-c2 h-full',
                        }}
                      />

                      <Button size='sm' isIconOnly onClick={() => removeCondition(groupIndex, conditionIndex)}>
                        <CrossIcon size={14} className='text-c6' />
                      </Button>
                    </div>
                  ))}
                </div>

                {group.itemType && (
                  <Link
                    onClick={() => addCondition(groupIndex)}
                    underline='none'
                    size={'sm'}
                    className='text-14 flex justify-start w-full gap-2 rounded-0 text-c6 bg-transparent cursor-pointer'>
                    <PlusIcon size={12} />
                    Ajouter une condition
                  </Link>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Renommer le groupe</ModalHeader>
          <ModalBody className='gap-4'>
            <Input
              classNames={{
                mainWrapper: 'h-full',
                input: 'text-c5 ',
                inputWrapper:
                  'shadow-none bg-c2 border-1 border-100 group-data-[focus=true]:bg-c2 rounded-8 font-normal text-c6 bg-c2 dark:bg-c2 h-full',
              }}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder='Nouveau nom...'
              autoFocus
            />
            <div className='flex justify-end gap-2'>
              <Button className='px-10 py-5 rounded-8 bg-transparent' variant='flat' onClick={onClose}>
                Annuler
              </Button>
              <Button
                className='px-10 py-5 rounded-8 bg-action text-selected'
                color='primary'
                onClick={() => {
                  if (activeGroupIndex !== null && newGroupName.trim()) {
                    setFilterGroups((prev) =>
                      prev.map((group, i) =>
                        i === activeGroupIndex ? { ...group, name: newGroupName.trim() } : group,
                      ),
                    );
                    onClose();
                  }
                }}>
                Renommer
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <div className='flex justify-end gap-2 mt-4'>
        <Button className='px-10 py-5 rounded-8 bg-transparent' variant='flat' onClick={resetFilters}>
          Réinitialiser
        </Button>
        <Button
          className='px-10 py-5 rounded-8 bg-action text-selected'
          color='primary'
          onClick={applyFilters}>
          Rechercher
        </Button>
      </div>
    </div>
  );
}
