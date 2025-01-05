import React, { useState, useEffect } from 'react';
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
import { ArrowIcon, CrossIcon, PlusIcon, DotsIcon, TrashIcon, CopyIcon } from '@/components/utils/icons';
import { getConfs, getUniversities, getActants, getDoctoralSchools, getLaboratories, 
  getCitations, getBibliographies, getMediagraphies, getCollections, getKeywords, 
  getItemByID, getLinksFromType} from '@/services/api';



  const ITEM_PROPERTIES: any = {
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
      { key: 'actant', label: 'Actant', transform: async (id: any) => {
          const item = await getItemByID(id);
          return item?.title || 'Inconnu';
        }},
      { key: 'motcles', label: 'Mot clé', transform: async (ids: any) => {
          const titles = await Promise.all(ids.map(async (id: any) => {
            const item = await getItemByID(id);
            return item?.title || 'Inconnu';
          }));
          return titles.join(', ');
        }},
      { key: 'date', label: 'Date' },
    ],
    citation: [
      { key: 'actant', label: 'Actant', transform: async (id: any) => {
        const item = await getItemByID(id);
        return item?.title || 'Inconnu';
      }},
      { key: 'citation', label: 'Citation' },
      { key: 'motcles', label: 'Mot clé', transform: async (ids: any) => {
        const titles = await Promise.all(ids.map(async (id: any) => {
          const item = await getItemByID(id);
          return item?.title || 'Inconnu';
        }));
        return titles.join(', ');
      }},
    ],
    collection: [
      { key: 'title', label: 'Nom' }
    ],
    keyword: [
      { key: 'title', label: 'Mot Clé' },
      { key: 'definition', label: 'Définition' }
    ],
    university: [
      { key: 'title', label: 'Nom' },
      { key: 'country', label: 'Pays' }
    ],
    doctoralschool: [
      { key: 'title', label: 'Nom' }
    ],
    laboratory: [
      { key: 'title', label: 'Nom' }
    ],
    bibliography: [
      { key: 'title', label: 'Titre' }
    ],
    mediagraphie: [
      { key: 'title', label: 'Titre' }
    ]
  };


  const ITEM_TYPES = {
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

interface FilterPopupProps {
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

type FilterGroup = {
  name: string;
  isExpanded: boolean;
  itemType: string;
  conditions: FilterCondition[];
};

export default function FilterPopup({
  onSearch,
}: FilterPopupProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      name: 'Groupe 1',
      isExpanded: true,
      itemType: '',
      conditions: [],
    },
  ]);

  const getPropertiesByType = (type: any): any => {
    return ITEM_PROPERTIES[type] || [];
  };

  const getDataByType = async (type: string): Promise<any[]> => {
    switch (type) {
      case 'citation':
        return await getCitations() || [];
      case 'conference':
        return await getConfs() || [];
      case 'actant':
        return await getActants() || [];
      case 'keyword':
        return await getKeywords() || [];
      case 'bibliography':
        return await getBibliographies() || [];
      case 'mediagraphie':
        return await getMediagraphies() || [];
      case 'collection':
        return await getCollections() || [];
      case 'university':
        return await getUniversities() || [];
      case 'laboratory':
        return await getLaboratories() || [];
      case 'doctoralschool':
        return await getDoctoralSchools() || [];
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
    console.log('Getting property:', property, 'from item:', item);
    
    // Vérifie d'abord si la propriété existe directement
    if (property in item) {
        const value = item[property];
        console.log('Direct value found:', value);
        
        // Recherche la configuration pour voir s'il y a une transformation à appliquer
        const propertyConfig = ITEM_PROPERTIES[item.type]?.find((p: any) => p.key === property);
        if (propertyConfig?.transform) {
            console.log('Applying transform to direct value');
            const transformed = await propertyConfig.transform(value);
            console.log('Transformed result:', transformed);
            return transformed;
        }
        
        return value;
    }

    // Si la propriété n'existe pas directement, cherche une config
    const propertyConfig = ITEM_PROPERTIES[item.type]?.find((p: any) => p.key === property);
    console.log('Property config:', propertyConfig);
    
    if (!propertyConfig) return null;

    if (propertyConfig.transform) {
        try {
            const transformed = await propertyConfig.transform(item[property]);
            console.log('Transformed value:', transformed);
            return transformed;
        } catch (error) {
            console.error('Transform error:', error);
            return null;
        }
    }

    return null;
};

const compareValues = async (itemValue: any, searchValue: any, operator: string): Promise<boolean> => {
  console.log('--- Comparing Values ---');
  console.log('Original values:', {
      itemValue: itemValue,
      searchValue: searchValue,
      type: operator
  });

  // Protection contre les valeurs null/undefined
  if (itemValue === null || itemValue === undefined || searchValue === null || searchValue === undefined) {
      console.log('Null/undefined values detected');
      return false;
  }

  // Préparation des valeurs pour la comparaison
  const prepareValue = (value: any): string => {
      if (typeof value === 'string') {
          return value.toLowerCase().trim();
      }
      return String(value).toLowerCase().trim();
  };

  const normalizedSearchValue = prepareValue(searchValue);
  const normalizedItemValue = prepareValue(itemValue);

  console.log('Normalized values:', {
      normalizedItemValue,
      normalizedSearchValue
  });

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

  console.log('Comparison result:', result);
  return result;
};


const applyFilters = async () => {
  const results: any[] = [];

  for (const group of filterGroups) {
      if (!group.itemType) continue;
      console.log('Processing group type:', group.itemType);

      const items = await getDataByType(group.itemType);
      
      for (const item of items) {
          let matchesAllConditions = true;

          for (const condition of group.conditions) {
              if (!condition.property || !condition.value) {
                  continue;
              }

              console.log('Checking condition:', {
                  property: condition.property,
                  value: condition.value,
                  operator: condition.operator
              });

              try {
                  const itemValue = await getPropertyValue(item, condition.property);
                  console.log('Retrieved item value:', itemValue);

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
          }

          if (matchesAllConditions) {
              try {
                  const links = await getLinksFromType(item, group.itemType);
                  const title = item.title || await getPropertyValue(item, 'title') || '';
                  
                  results.push({
                      id: item.id,
                      type: group.itemType,
                      title,
                      links
                  });
              } catch (error) {
                  console.error('Error adding result item:', error);
              }
          }
      }
  }

  onSearch(results);
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
    <div className='w-full flex flex-col gap-20 h-full overflow-hidden'>
      <div className='flex flex-col gap-10'>
        <Button
          onClick={addGroup}
          className='text-14 flex justify-start h-[40px] w-full gap-2 rounded-0 text-default-600 bg-transparent'>
          <PlusIcon size={12} />
          Ajouter un groupe de filtres
        </Button>
        <Divider />
      </div>

      <div className='flex flex-col flex-1 gap-10 overflow-y-auto'>
        {filterGroups.map((group, groupIndex) => (
          <div key={groupIndex} className='border rounded-lg gap-4 p-4 bg-default-200 rounded-8'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <Button className='text-default-600' onClick={() => toggleGroupExpansion(groupIndex)}>
                  <ArrowIcon
                    size={14}
                    className={`transition-all duration-200 ${group.isExpanded ? 'rotate-90' : ''}`}
                  />
                </Button>
                <span className='font-medium'>{group.name}</span>
              </div>

              <Dropdown>
                <DropdownTrigger>
                  <Button size='sm'>
                    <DotsIcon size={14} className='text-default-600' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
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
                <Dropdown>
                  <DropdownTrigger>
                    <Button className='mb-4 w-full justify-between'>
                      {group.itemType
                        ? Object.entries(ITEM_TYPES).find(([, value]) => value === group.itemType)?.[0]
                        : "Sélectionner un type d'item"}
                      <ArrowIcon size={12} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    selectionMode='single'
                    selectedKeys={group.itemType ? [group.itemType] : []}
                    onSelectionChange={(keys) => {
                      const type = Array.from(keys)[0] as string;
                      updateGroupType(groupIndex, type);
                    }}>
                    {Object.entries(ITEM_TYPES).map(([label, value]) => (
                      <DropdownItem key={value}>{label}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                <div className='space-y-2 mb-4'>
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className='flex items-center gap-2'>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button className='flex-1'>
                              {getPropertiesByType(group.itemType).find((prop: any) => prop.key === condition.property)?.label || 'Propriété'}
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
                          {getPropertiesByType(group.itemType).map((prop:any) => (
                            <DropdownItem key={prop.key}>{prop.label}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button className='flex-1'>
                            {OPERATORS.find((op) => op.key === condition.operator)?.label || 'Opérateur'}
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
                        className='flex-1'
                      />

                      <Button size='sm' isIconOnly onClick={() => removeCondition(groupIndex, conditionIndex)}>
                        <CrossIcon size={14} className='text-default-600' />
                      </Button>
                    </div>
                  ))}
                </div>

                {group.itemType && (
                  <Button
                    onClick={() => addCondition(groupIndex)}
                    className='text-14 flex justify-start w-full gap-2 bg-transparent text-default-600'>
                    <PlusIcon size={12} />
                    Ajouter une condition
                  </Button>
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
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder='Nouveau nom...'
              autoFocus
            />
            <div className='flex justify-end gap-2'>
              <Button variant='flat' onClick={onClose}>
                Annuler
              </Button>
              <Button
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
        <Button variant='flat' onClick={resetFilters}>
          Réinitialiser
        </Button>
        <Button color='primary' onClick={applyFilters}>
          Appliquer
        </Button>
      </div>
    </div>
  );
}
