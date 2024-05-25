import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { CloseIcon } from '../Utils/icons';

interface ButtonProps {
  onClick?: (index: number) => void;
}
interface ButtonGeneratorProps {
  buttonNames: string[]; // Liste des noms de boutons
}

export const NavTypeFilter: React.FC<ButtonGeneratorProps & ButtonProps> = ({ buttonNames, onClick }) => {
  const [selectedButtons, setSelectedButtons] = useState<number[]>([]);

  const handleButtonClick = (index: number) => {
    setSelectedButtons((prevSelected) =>
      prevSelected.includes(index) ? prevSelected.filter((i) => i !== index) : [...prevSelected, index],
    );
    if (onClick) {
      onClick(index);
    }
  };

  const buttons = buttonNames.map((name, index) => (
    <Button
      key={index}
      onClick={() => handleButtonClick(index)}
      radius='none'
      className={`h-[32px] text-16 rounded-8 ${
        selectedButtons.includes(index)
          ? 'bg-default-action text-default-100'
          : 'text-default-500 bg-default-200 hover:text-default-500 hover:bg-default-300'
      } transition-all ease-in-out duration-200 navfilter flex items-center`}
      endContent={selectedButtons.includes(index) ? <CloseIcon size={18} /> : null}>
      {name}
    </Button>
  ));

  return (
    <div className='w-full flex flex-row gap-10'>
      <div className='button-container flex gap-10 overflow-x-auto scrollbar-hide'>{buttons}</div>
    </div>
  );
};
