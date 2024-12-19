import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiSettings, FiGrid, FiLink, FiEdit, FiUpload, FiDownload } from 'react-icons/fi';
import SearchPopup from './SearchPopup';
import FiltragePopup from './FiltragePopup';

const GridPopup: React.FC = () => (
  <div className='p-4 bg-white shadow-lg rounded-lg'>
    <p>Affichage en grille.</p>
  </div>
);

const LinkPopup: React.FC = () => (
  <div className='p-4 bg-white shadow-lg rounded-lg'>
    <p>Gestion des liens.</p>
  </div>
);

const EditPopup: React.FC = () => (
  <div className='p-4 bg-white shadow-lg rounded-lg'>
    <p>Mode édition activé.</p>
  </div>
);

const UploadPopup: React.FC = () => (
  <div className='p-4 bg-white shadow-lg rounded-lg'>
    <p>Upload de fichiers.</p>
  </div>
);

const DownloadPopup: React.FC = () => (
  <div className='p-4 bg-white shadow-lg rounded-lg'>
    <p>Téléchargement en cours...</p>
  </div>
);

interface ItemsProps {
  itemsDataviz: any[];
  onSearch: (selectedItems: any[]) => void; // Définition du type
}

export const Toolbar: React.FC<ItemsProps> = ({ itemsDataviz, onSearch }) => {
  const [activeIcon, setActiveIcon] = useState<string | null>(null); // Départ à null
  const [position, setPosition] = useState<{ left: number }>({ left: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleItemSelect = (item: any) => {
    console.log('Selected item in Toolbar:', item);
    console.log(showPopup);
    onSearch([item]); // Remonte l'élément sélectionné
    setActiveIcon(null); // Fermer la popup
  };

  const icons = [
    {
      id: 'search',
      component: <FiSearch size={22} />,
      popup: <SearchPopup itemsDataviz={itemsDataviz} onSearch={onSearch} onItemSelect={handleItemSelect} />,
    },
    { id: 'filtrage', component: <FiSettings size={22} />, popup: <FiltragePopup /> },
    { id: 'grid', component: <FiGrid size={22} />, popup: <GridPopup /> },
    { id: 'link', component: <FiLink size={22} />, popup: <LinkPopup /> },
    { id: 'edit', component: <FiEdit size={22} />, popup: <EditPopup /> },
    { id: 'upload', component: <FiUpload size={22} />, popup: <UploadPopup /> },
    { id: 'download', component: <FiDownload size={22} />, popup: <DownloadPopup /> },
  ];

  useEffect(() => {
    if (activeIcon && iconRefs.current[activeIcon]) {
      const iconElement = iconRefs.current[activeIcon]!;
      const container = containerRef.current!;
      const iconRect = iconElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Mise à jour de la position relative
      setPosition({
        left: iconRect.left - containerRect.left + iconRect.width / 2 - 20,
      });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [activeIcon]);

  return (
    <div className='fixed bottom-0 left-0 right-0 p-20 flex justify-center items-center'>
      <div className='relative flex items-center gap-[20px] p-10 bg-default-200 rounded-[12px]' ref={containerRef}>
        {/* Fond mobile */}
        {activeIcon && (
          <div
            className='absolute w-[40px] h-[40px] bg-default-action rounded-[8px] transition-all duration-300'
            style={{ left: position.left, top: '10px' }}
          />
        )}

        {activeIcon && (
          <div className='absolute left-0 bg-default-200 bottom-[80px] w-[100%] flex flex-col p-20 gap-20 rounded-12'>
            {icons.find((icon) => icon.id === activeIcon)?.popup}
          </div>
        )}
        {/* Icônes */}
        {icons.map((icon) => (
          <div
            key={icon.id}
            ref={(el) => (iconRefs.current[icon.id] = el)}
            onClick={() => setActiveIcon((prev) => (prev === icon.id ? null : icon.id))}
            className={`relative z-10 cursor-pointer flex items-center justify-center w-[40px] h-[40px] ${
              activeIcon === icon.id ? 'bg-opacity-50' : ''
            }`}>
            {React.cloneElement(icon.component, {
              className: 'text-white text-xl',
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
