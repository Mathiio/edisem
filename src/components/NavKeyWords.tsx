import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowIcon } from './icons';

interface ButtonProps {
  onClick?: () => void;
}

interface ButtonGeneratorProps {
  numberOfButtons: number;
}

export const NavKeyWords: React.FC<ButtonGeneratorProps & ButtonProps> = ({ numberOfButtons, onClick }) => {
  const [translate, setTranslate] = useState(0);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(false);
  const translateAmount = 200; // Adjust this value as needed
  const containerRef = useRef<HTMLDivElement>(null);
  const parentWidth = useRef<number>(0); // Référence pour stocker la largeur du parent

  const handleLeftClick = () => {
    setTranslate((prevTranslate) => Math.max(prevTranslate - translateAmount, 0));
  };

  const handleRightClick = () => {
    setTranslate((prevTranslate) => prevTranslate + translateAmount);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      setIsLeftVisible(translate > 0);
      setIsRightVisible(container.scrollWidth > container.clientWidth + translate);
    }
  }, [translate]);

  useEffect(() => {
    const updateParentWidth = () => {
      if (containerRef.current?.parentElement) {
        parentWidth.current = containerRef.current.parentElement.clientWidth;
      }
    };

    updateParentWidth(); // Met à jour la largeur du parent lors du montage du composant

    // Met à jour la largeur du parent lors du redimensionnement de la fenêtre
    window.addEventListener('resize', updateParentWidth);

    return () => {
      window.removeEventListener('resize', updateParentWidth); // Nettoie l'écouteur d'événement lors du démontage du composant
    };
  }, []);

  return (
    <div className='flex flex-row gap-10 items-center' ref={containerRef}>
      {isLeftVisible && (
        <Button
          onClick={handleLeftClick}
          size='sm'
          className='p-0 min-w-[32px] min-h-[32px] text-default-50 bg-default-action'>
          <ArrowIcon size={20} />
        </Button>
      )}

      <div className='flex gap-10' style={{ width: parentWidth.current, overflow: 'scroll' }}>
        {Array.from({ length: numberOfButtons }).map((_, index) => (
          <Button
            key={index}
            onClick={onClick}
            radius='none'
            className='px-25 text-16 h-[32px] rounded-8 font-regular bg-transparent border-2 border-default-300 hover:border-default-action hover:opacity-100 text-default-400 hover:text-default-action transition-all ease-in-out duration-200'
            style={{ flexShrink: 0 }}>
            Press me
          </Button>
        ))}
      </div>

      {isRightVisible && (
        <Button
          onClick={handleRightClick}
          size='sm'
          className='p-0 min-w-[32px] min-h-[32px] text-default-50 bg-default-action'>
          <ArrowIcon size={20} />
        </Button>
      )}
    </div>
  );
};
