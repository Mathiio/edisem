import { Button, Divider } from '@nextui-org/react';
import { Textarea } from '@nextui-org/input';
import { useEffect, useRef, useState } from 'react';
import { FilterGroup, FilterPopupProps, ITEM_PROPERTIES } from './FilterPopup';
import * as Items from '@/services/Items';
import { getLinksFromType } from '@/services/Links';
const STORAGE_KEY = 'filterGroups';

const getInitialFilterGroups = (): FilterGroup[] => {
  const savedFilters = localStorage.getItem(STORAGE_KEY);
  console.log(savedFilters);
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

export default function ImportPopup({ onSearch }: FilterPopupProps) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(getInitialFilterGroups());
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Création de la ref

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

  const handleSearch = () => {
    const inputText = textareaRef.current?.value; // Accéder à la valeur du Textarea via la ref

    if (inputText) {
      // Sauvegarder le texte dans le localStorage
      localStorage.setItem(STORAGE_KEY, inputText);

      try {
        const parsedConfig = JSON.parse(inputText); // Analyser le texte collé
        // Utilisation de callback pour s'assurer que la mise à jour de filterGroups est terminée
        setFilterGroups(parsedConfig);
      } catch (error) {
        console.error('Erreur lors du parsing de la recherche', error);
        alert("Erreur lors de l'importation de la configuration.");
      }
    } else {
      alert('Veuillez coller une configuration valide.');
    }
  };

  useEffect(() => {
    if (filterGroups.length > 0) {
      applyFilters(); // Appliquer les filtres dès que filterGroups est mis à jour
    }
  }, [filterGroups]);

  return (
    <div className='w-full flex flex-col gap-4 h-full overflow-hidden justify-between'>
      <div className='flex flex-col gap-4'>
        <div className='text-14 flex justify-start leading-[150%] w-full gap-2 rounded-0 text-700 bg-transparent'>
          Importer une recherche
        </div>
        <Divider />
        <Textarea
          ref={textareaRef}
          minRows={14}
          size='lg'
          placeholder='Coller votre recherche ici...'
          className='focus:bg-200 bg-200 h-full'
          classNames={{
            inputWrapper: 'bg-200 !bg-200 h-full',
            base: 'rounded-8 h-full',
            innerWrapper: 'focus:bg-200 bg-200 h-full',
          }}
        />
      </div>
      <div className='flex justify-end gap-2 mt-4'>
        <Button
          className='px-10 py-5 rounded-8 bg-action text-selected'
          onClick={handleSearch} // Lancer la recherche
        >
          Lancer la recherche
        </Button>
      </div>
    </div>
  );
}
