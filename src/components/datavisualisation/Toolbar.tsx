import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPopup, { FilterGroup } from './FilterPopup';
import { Button, Divider } from '@heroui/react';
import { AnotateIcon, SearchIcon, ImportIcon, NewItemIcon, AssociateIcon, ExportIcon } from '@/components/Utils/icons';
import { IconSvgProps } from '@/types/types';

import { getItemByID } from '@/services/api';

import { GeneratedImage } from '@/pages/visualisation';
import { ExportPopup } from './ExportPopup';
import ImportPopup from './ImportPopup';

// Ajout de l'interface pour la visibilité des groupes
interface GroupVisibility {
  groupId: string;
  groupName: string;
  baseType: string;
  visibleTypes: string[];
}

interface ItemsProps {
  itemsDataviz: any[];
  onSearch: (selectedItems: any[], typesearch: FilterGroup[], isAdvancedSearch: boolean) => void;
  handleExportClick: () => Promise<GeneratedImage>;
  generatedImage: GeneratedImage | null;
  resetActiveIconRef?: (resetFunc: () => void) => void;
  onSelect: (groups: FilterGroup[]) => void;
  exportEnabled: boolean;
  // Ajout des nouvelles props
  groupsVisibility?: GroupVisibility[];
  availableTypes?: string[];
  updateGroupTypeVisibility?: (groupId: string, type: string, isVisible: boolean) => void;
}

export const Toolbar: React.FC<ItemsProps> = ({
  onSearch,
  resetActiveIconRef,
  generatedImage,
  handleExportClick,
  onSelect,
  exportEnabled,
  // Ajouter des valeurs par défaut pour les nouvelles props
  groupsVisibility = [],
  availableTypes = [],
  updateGroupTypeVisibility = () => {}, // No-op par défaut
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [, setCurrentResults] = useState<any[]>([]);
  const iconRefs = useRef<Record<string, HTMLElement | null>>({});
  const [, setDirection] = useState(1);

  // Fonction pour réinitialiser l'icône active
  const handleResetActiveIcon = useCallback(() => {
    setActiveIcon(null);
  }, []);

  // Exposer la fonction via la ref
  useEffect(() => {
    if (resetActiveIconRef) {
      resetActiveIconRef(handleResetActiveIcon);
    }
  }, [resetActiveIconRef, handleResetActiveIcon]);

  useEffect(() => {
    if (!activeIcon) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside toolbar or popup
      const isToolbarClick = containerRef.current?.contains(event.target as Node);
      const isPopupClick = popupRef.current?.contains(event.target as Node);

      if (!isToolbarClick && isPopupClick) {
        setActiveIcon(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIcon]);

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
  const handleAdvancedSearch = async (searchResults: any[], typesearch: FilterGroup[]) => {
    setCurrentResults(searchResults);
    const filteredResult = await applyHiddenTypesFilter(searchResults);
    onSearch(filteredResult, typesearch, true);
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
            onSearch={handleAdvancedSearch}
            groupsVisibility={groupsVisibility}
            availableTypes={availableTypes}
            updateGroupTypeVisibility={updateGroupTypeVisibility}
          />
        );

      case 'import':
        return <ImportPopup onSelect={onSelect} />;
      case 'export':
        return (
          <ExportPopup
            generatedImage={generatedImage}
            handleExportClick={handleExportClick}
            exportEnabled={exportEnabled}
          />
        );
      default:
        return null;
    }
  };

  const renderButton = (key: string, IconComponent: React.FC<IconSvgProps>) => (
    <Button
      key={key}
      ref={(el) => (iconRefs.current[key] = el)}
      className={`cursor-pointer group text-16 p-10 rounded-8 h-11 w-11 ${
        activeIcon === key ? 'text-selected bg-action' : 'text-c6 bg-transparent hover:bg-c3 hover:text-selected'
      } transition-all ease-in-out duration-200`}
      onPress={() => {
        setDirection(() => {
          if (!activeIcon || activeIcon === key) return 1;
          const keys = ['filter', 'hide', 'add', 'link', 'anotate', 'export', 'import'];
          const currentIndex = keys.indexOf(activeIcon);
          const newIndex = keys.indexOf(key);
          return newIndex > currentIndex ? -1 : 1;
        });

        setActiveIcon((prev) => (prev === key ? null : key));
      }}>
      <IconComponent
        className={` ${
          activeIcon === key ? 'text-selected' : 'text-c6 hover:text-c6'
        } transition-all ease-in-out duration-200`}
        size={18}
      />
    </Button>
  );

  return (
    <div className='fixed bottom-0 left-0 right-0 p-25 gap-2 flex flex-col justify-center items-center z-[10]'>
      <AnimatePresence mode='popLayout'>
        {activeIcon && showPopup && (
          <motion.div
            ref={popupRef}
            key={activeIcon} // 🔑 clé unique pour chaque popup
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className='flex bg-c2/50 h-96 p-4 rounded-12 shadow-lg'
            style={{
              width: `${containerWidth}px`,
              backdropFilter: 'blur(50px)  saturate(3)',
              WebkitBackdropFilter: 'blur(50px) brightness(1.5) saturate(3)',
            }}>
            {getActivePopup()}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className='relative w-auto flex items-center rounded-12 p-2 bg-c2 gap-4 shadow-lg'
        ref={containerRef}
        style={{
          backdropFilter: 'blur(50px) brightness(1.5) saturate(3)',
          WebkitBackdropFilter: 'blur(50px) brightness(1.5) saturate(3)',
        }}>
        {renderButton('filter', SearchIcon)}
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
