import React, { useEffect, useRef, useState } from 'react';
import FilterPopup from './FilterPopup';
import { Button, Divider } from "@heroui/react";
import { AnotateIcon, SearchIcon, ImportIcon, NewItemIcon, HideIcon, AssociateIcon, ExportIcon } from '../utils/icons';
import { IconSvgProps } from '@/types/types';
import HidePopup from './HidePopup';
import { getItemByID } from '@/services/api';
import ImportPopup from './ImportPopup';
//import { ExportPopup } from './ExportPopup';
import { GeneratedImage } from '@/pages/visualisation';

interface ItemsProps {
  itemsDataviz: any[];
  onSearch: (selectedItems: any[], isAdvancedSearch: boolean) => void;
  handleExportClick: () => void;
  generatedImage: GeneratedImage | null;
}

export const Toolbar: React.FC<ItemsProps> = ({ itemsDataviz, onSearch }) => {
  console.log(itemsDataviz);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentResults, setCurrentResults] = useState<any[]>([]);
  const iconRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]);

  const applyHiddenTypesFilter = async (items: any[]): Promise<any[]> => {
    if (!items?.length) return [];

    const hiddenTypes = localStorage.getItem('hideGroups');

    try {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          if (!item) return null;

          const { links = [], ...rest } = item;

          if (!links.length) {
            return rest;
          }

          const linkedItems = await Promise.all(
            links.map(async (linkId: string) => {
              try {
                const linkedItem = await getItemByID(linkId);

                if (linkedItem && hiddenTypes?.includes(linkedItem.type)) {
                  return null;
                }

                return linkId;
              } catch (error) {
                console.error(`Error fetching linked item ${linkId}:`, error);
                return null;
              }
            }),
          );

          const filteredLinks = linkedItems.filter((link): link is string => link !== null && link !== undefined);

          return {
            ...rest,
            links: filteredLinks,
          };
        }),
      );

      return filteredItems.filter((item): item is any => item !== null && item !== undefined);
    } catch (error) {
      console.error('Error in applyHiddenTypesFilter:', error);
      throw error;
    }
  };

  const handleAdvancedSearch = async (searchResults: any[]) => {
    setCurrentResults(searchResults);
    const filteredResult = await applyHiddenTypesFilter(searchResults);
    onSearch(filteredResult, true);
  };

  const handleHide = async () => {
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
        return <FilterPopup onSearch={handleAdvancedSearch} />;
      case 'hide':
        return <HidePopup onHide={handleHide} />;
      case 'import':
        return <ImportPopup onSearch={handleAdvancedSearch} />;
      case 'export':
       // return <ExportPopup generatedImage={generatedImage} handleExportClick={handleExportClick} />;
      default:
        return null;
    }
  };

  const renderButton = (key: string, IconComponent: React.FC<IconSvgProps>) => (
    <Button
      key={key}
      ref={(el) => (iconRefs.current[key] = el)}
      className={`cursor-pointer group text-16 p-10 rounded-8 h-11 w-11 ${
        activeIcon === key
          ? 'text-selected bg-action'
          : 'text-c6 bg-transparent hover:bg-c3 hover:text-selected'
      } transition-all ease-in-out duration-200`}
      onPress={() => setActiveIcon((prev) => (prev === key ? null : key))}>
      <IconComponent className={` ${
        activeIcon === key
          ? 'text-selected'
          : 'text-c6 hover:text-c6'
      } transition-all ease-in-out duration-200`} size={18} />
    </Button>
  );

  return (
    <div className='fixed bottom-0 left-0 right-0 p-25 gap-2 flex flex-col justify-center items-center'>
      {activeIcon && showPopup && (
        <div className='flex bg-c2 h-96 p-4 rounded-12 shadow-lg' style={{ width: `${containerWidth}px` }}>
          {getActivePopup()}
        </div>
      )}
      <div
        className='relative w-auto flex items-center rounded-12 p-2 bg-c2 gap-4 shadow-lg'
        ref={containerRef}>
        {renderButton('filter', SearchIcon)}
        {renderButton('hide', HideIcon)}
        <Divider orientation='vertical' className='h-4 w-0.5 bg-c4 mx-4' />
        {renderButton('add', NewItemIcon)}
        {renderButton('link', AssociateIcon)}
        {renderButton('anotate', AnotateIcon)}
        <Divider orientation='vertical' className='h-4 w-0.5 bg-c4 mx-4' />
        {renderButton('export', ExportIcon)}
        {renderButton('import', ImportIcon)}
      </div>
    </div>
  );
};
