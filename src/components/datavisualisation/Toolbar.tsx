import React, { useEffect, useRef, useState } from 'react';
import FilterPopup from './FilterPopup';
import { Button, Divider } from '@nextui-org/react';
import { AnotateIcon, ExportIcon, SearchIcon, ImportIcon, NewItemIcon, HideIcon, AssociateIcon } from '../utils/icons';
import { IconSvgProps } from '@/types/types';
import HidePopup from './HidePopup';

interface ItemsProps {
  itemsDataviz: any[];
  onSearch: (selectedItems: any[], isAdvancedSearch: boolean) => void;
}

export const Toolbar: React.FC<ItemsProps> = ({ itemsDataviz, onSearch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [filteredItems, setFilteredItems] = useState(itemsDataviz); // filteredItems state to keep track of visible items
  const iconRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]);

  const handleItemSelect = (item: any) => {
    onSearch([item], false); // Simple search with isAdvancedSearch = false
    setActiveIcon(null);
    setShowPopup(false);
  };

  const handleAdvancedSearch = (items: any[]) => {
    onSearch(items, true); // Advanced search with isAdvancedSearch = true
    setActiveIcon(null);
    setShowPopup(false);
  };

  // Function to handle hiding items based on the selected masks
  const handleHide = (hiddenTypes: string[]) => {
    // hiddenTypes contient maintenant directement les valeurs (ex: ['conference', 'citation'])
    const newFilteredItems = itemsDataviz.filter((item) => {
      // Vérifie si le type de l'item n'est pas dans les types à cacher
      const shouldHide = !hiddenTypes.includes(item.type);

      // Pour les objets imbriqués comme motcles qui contiennent des éléments avec leur propre type
      if (item.motcles && item.motcles.length > 0) {
        const hasMatchingKeyword = item.motcles.some((keyword: any) => hiddenTypes.includes(keyword.type));
        return shouldHide && !hasMatchingKeyword;
      }

      return shouldHide;
    });

    setFilteredItems(newFilteredItems); // Update the filteredItems state
    onSearch(newFilteredItems, true); // Update the search with filtered items
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
        return <HidePopup onHide={handleHide} />; // Pass filtered items and handleHide
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
