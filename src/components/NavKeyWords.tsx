import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowIcon } from './icons';

interface ButtonProps {
  onClick?: () => void;
}
interface ButtonGeneratorProps {
  numberOfButtons: number;
}

export const NavKeyWords: React.FC<ButtonGeneratorProps & ButtonProps> = ({ numberOfButtons, onClick }) => {
  const buttons = [];
  const [translate, setTranslate] = useState(0);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(false);
  const translateAmount = 200; // Adjust this value as needed

  for (let i = 0; i < numberOfButtons; i++) {
    buttons.push(
      <Button
        style={{ transform: `translateX(-${translate}px)` }}
        key={i}
        onClick={onClick}
        radius='none'
        className='px-25 text-16 h-[32px] rounded-8 font-regular bg-transparent border-2 border-default-300 hover:border-default-action hover:opacity-100 text-default-400 hover:text-default-action transition-all ease-in-out duration-200'>
        Press me
      </Button>,
    );
  }

  const handleLeftClick = () => {
    setTranslate((prevTranslate) => Math.max(prevTranslate - translateAmount, 0));
  };
  const handleRightClick = () => {
    setTranslate((prevTranslate) => prevTranslate + translateAmount);
  };

  useEffect(() => {
    const container = document.querySelector('.button-container');
    if (container) {
      setIsLeftVisible(translate > 0);
      setIsRightVisible(container.scrollWidth > container.clientWidth + translate);
    }
  }, [translate]);

  return (
    <div className='w-full flex flex-row gap-10'>
      {isLeftVisible && (
        <Button
          onClick={handleLeftClick}
          size='sm'
          className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action'>
          <ArrowIcon size={20} transform='rotate(180deg)' />
        </Button>
      )}
      <div className='button-container flex gap-10 overflow-x-auto scrollbar-hide'>{buttons}</div>
      {isRightVisible && (
        <Button
          onClick={handleRightClick}
          size='sm'
          className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action'>
          <ArrowIcon size={20} />
        </Button>
      )}
    </div>
  );
};
