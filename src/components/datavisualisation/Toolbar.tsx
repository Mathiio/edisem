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
  const [currentResults, setCurrentResults] = useState<any[]>([]);
  const iconRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]);

  const applyHiddenTypesFilter = async (items: any[]): Promise<any[]> => {
    if (!items || items.length === 0) return [];
    
    const filteredItems = await Promise.all(
      items.map(async (item) => {
        if (!item) return null;
        
        const newItem = { ...item };
        
        if (!newItem.links || !Array.isArray(newItem.links)) {
          newItem.links = [];
          return newItem;
        }
        
        const filteredLinks = await Promise.all(
          newItem.links.map(async (linkId: string) => {
            try {
              const linkedItem = await getItemByID(linkId);
              return !hiddenTypes.includes(linkedItem.type) ? linkId : null;
            } catch (error) {
              console.error('Error fetching linked item:', error);
              return null;
            }
          })
        );
        
        newItem.links = filteredLinks.filter((link): link is string => link !== null);
        
        return newItem;
      })
    );

    return filteredItems.filter((item): item is any => item !== null);
  };

  const handleAdvancedSearch = async (searchResults: any[]) => {
    setCurrentResults(searchResults);
    const filteredResult = await applyHiddenTypesFilter(searchResults);
    onSearch(filteredResult, true);
  };

  const handleHide = async (newHiddenTypes: string[]) => {
    setHiddenTypes(newHiddenTypes);
    const filteredResult = await applyHiddenTypesFilter(currentResults);
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
        return (
          <FilterPopup 
            itemsDataviz={itemsDataviz} 
            onSearch={handleAdvancedSearch}
          />
        );
      case 'hide':
        return (
          <HidePopup 
            onHide={handleHide} 
            hiddenTypes={hiddenTypes}
          />
        );
      default:
        return null;
    }
  };

  const renderButton = (key: string, IconComponent: React.FC<IconSvgProps>) => (
    <Button
      size='lg'
      key={key}
      ref={(el) => (iconRefs.current[key] = el)}
      className={`cursor-pointer group text-16 p-10 rounded-8 ${
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