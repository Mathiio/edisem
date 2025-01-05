import React, { useEffect, useRef, useState } from 'react';
import FilterPopup from './FilterPopup';
import { Button, Divider } from '@nextui-org/react';
import { AnotateIcon, ExportIcon, SearchIcon, ImportIcon, NewItemIcon, HideIcon, AssociateIcon } from '../utils/icons';
import { IconSvgProps } from '@/types/types';
import HidePopup from './HidePopup';
import { getItemByID } from '@/services/api';

interface ItemsProps {
  itemsDataviz: any[];
  onSearch: (selectedItems: any[], isAdvancedSearch: boolean) => void;
}

export const Toolbar: React.FC<ItemsProps> = ({ itemsDataviz, onSearch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);
  const [lastSearchResults, setLastSearchResults] = useState<any[]>([]);
  const iconRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]);
  const checkLinkedItemTypes = async (item: any): Promise<boolean> => {
    if (!item.links || item.links.length === 0) {
      console.log('No links for item:', item.id);
      return true;
    }

    console.log('Checking linked item types for item:', item.id, 'with links:', item.links);

    try {
      const linkedItemsPromises = item.links.map((id: string) => getItemByID(id));
      const linkedItems = await Promise.all(linkedItemsPromises);

      console.log('Fetched linked items for item:', item.id, 'linked items:', linkedItems);

      const hasHiddenLinkedType = linkedItems.some((linkedItem) => {
        if (!linkedItem) {
          console.log('Linked item is null or undefined for ID:', linkedItem.id);
          return false;
        }
        const isHidden = hiddenTypes.includes(linkedItem.type);
        if (isHidden) {
          console.log('Linked item with hidden type found:', linkedItem.type, 'for item:', item.id);
        }
        return isHidden;
      });

      return !hasHiddenLinkedType;
    } catch (error) {
      console.error('Error checking linked items for item:', item.id, 'Error:', error);
      return true;
    }
  };

  const applyHiddenTypesFilter = async (items: any[]): Promise<any[]> => {
    const filteredItems = await Promise.all(
      items.map(async (item) => {
        // Call checkLinkedItemTypes first, regardless of item type
        const showLinkedItems = await checkLinkedItemTypes(item);
        if (!showLinkedItems) return null;

        // Then check if the item type is hidden
        const shouldShow = !hiddenTypes.includes(item.type);
        if (!shouldShow) {
          console.log('Item type hidden:', item.type);
          return null;
        }

        // Check keywords if present
        if (item.motcles && item.motcles.length > 0) {
          const hasHiddenKeyword = item.motcles.some((keyword: any) => hiddenTypes.includes(keyword.type));
          if (hasHiddenKeyword) return null;
        }

        return item;
      }),
    );

    return filteredItems.filter((item) => item !== null);
  };

  const handleItemSelect = async (item: any) => {
    const filteredResult = await applyHiddenTypesFilter([item]);
    setLastSearchResults([item]);
    onSearch(filteredResult, false);
    setActiveIcon(null);
    setShowPopup(false);
  };

  const handleAdvancedSearch = async (searchResults: any[]) => {
    setLastSearchResults(searchResults);
    const filteredResult = await applyHiddenTypesFilter(searchResults);
    onSearch(filteredResult, true);
    setActiveIcon(null);
    setShowPopup(false);
  };

  const handleHide = async (newHiddenTypes: string[]) => {
    setHiddenTypes(newHiddenTypes);
    const filteredResult = await applyHiddenTypesFilter(lastSearchResults);
    onSearch(filteredResult, true);
  };

  useEffect(() => {
    if (activeIcon && iconRefs.current[activeIcon]) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [activeIcon]);

  const getActivePopup = () => {
    switch (activeIcon) {
      case 'filter':
        return <FilterPopup itemsDataviz={itemsDataviz} onSearch={handleAdvancedSearch} />;
      case 'hide':
        return <HidePopup onHide={handleHide} hiddenTypes={hiddenTypes} />;
      default:
        return null;
    }
  };

  const renderButton = (key: string, IconComponent: React.FC<IconSvgProps>) => (
    <Button
      size='lg'
      key={key}
      ref={(el) => (iconRefs.current[key] = el)}
      className={`cursor-pointer group text-16 p-10 rounded-8  ${
        activeIcon === key
          ? 'text-default-selected bg-default-action'
          : 'text-default-500 bg-transparent hover:bg-default-300 hover:text-default-selected'
      } transition-all ease-in-out duration-200`}
      onPress={() => setActiveIcon((prev) => (prev === key ? null : key))}>
      <IconComponent size={20} />
    </Button>
  );

  return (
    <div className='fixed bottom-0 left-0 right-0 p-25 gap-2 flex flex-col justify-center items-center'>
      {activeIcon && showPopup && (
        <div className='flex bg-default-100 h-96 p-4 rounded-8 shadow-lg' style={{ width: `${containerWidth}px` }}>
          {getActivePopup()}
        </div>
      )}
      <div
        className='relative w-auto flex items-center rounded-8 p-2 bg-default-100 gap-4 shadow-lg'
        ref={containerRef}>
        {renderButton('filter', SearchIcon)}
        {renderButton('hide', HideIcon)}
        <Divider orientation='vertical' className='h-4 w-0.5 bg-default-300 mx-4' />
        {renderButton('add', NewItemIcon)}
        {renderButton('link', AssociateIcon)}
        {renderButton('anotate', AnotateIcon)}
        <Divider orientation='vertical' className='h-4 w-0.5 bg-default-300 mx-4' />
        {renderButton('export', ExportIcon)}
        {renderButton('import', ImportIcon)}
      </div>
    </div>
  );
};
