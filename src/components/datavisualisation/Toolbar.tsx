import React from 'react';
import { useEffect, useRef, useState } from 'react';
import SearchPopup from './SearchPopup';
import FilterPopup from './FilterPopup';
import { Button, Divider } from '@nextui-org/react';
import {
  AnotateIcon,
  ExportIcon,
  FilterIcon,
  ImportIcon,
  NewItemIcon,
  SearchIcon,
  AssociateIcon,
} from '../utils/icons';
import { IconSvgProps } from '@/types/types';

interface ItemsProps {
  itemsDataviz: any[];
  onSearch: (selectedItems: any[]) => void;
}

export const Toolbar: React.FC<ItemsProps> = ({ itemsDataviz, onSearch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const iconRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]);

  const handleItemSelect = (item: any) => {
    onSearch([item]);
    setActiveIcon(null);
    setShowPopup(false);
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
      case 'search':
        return <SearchPopup itemsDataviz={itemsDataviz} onSearch={onSearch} onItemSelect={handleItemSelect} />;
      case 'filter':
        return <FilterPopup itemsDataviz={itemsDataviz} onSearch={onSearch} />;
      default:
        return null;
    }
  };

  const renderButton = (key: string, IconComponent: React.FC<IconSvgProps>) => (
    <Button
      size='md'
      key={key}
      ref={(el) => (iconRefs.current[key] = el)}
      className={`cursor-pointer group text-16 p-10 rounded-8 ${
        activeIcon === key
          ? 'text-default-selected bg-default-action'
          : 'text-default-500 bg-transparent hover:bg-default-action hover:text-default-selected'
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
        {renderButton('search', SearchIcon)}
        {renderButton('filter', FilterIcon)}
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
