import React from 'react';
import { Button } from '@nextui-org/react';

interface ButtonProps {
  onClick?: () => void;
}

interface ButtonGeneratorProps {
  numberOfButtons: number;
}

export const NavKeyWords: React.FC<ButtonGeneratorProps & ButtonProps> = ({ numberOfButtons, onClick }) => {
  const buttons = [];

  for (let i = 0; i < numberOfButtons; i++) {
    buttons.push(
      <Button
        key={i}
        onClick={onClick}
        className='p-5 text-16 font-regular bg-default-100 border-2 border-default-300 hover:border-default-600 hover:opacity-100 text-default-400 hover:text-default-600 transition-all ease-in-out duration-200'>
        Press me
      </Button>,
    );
  }

  return <div className='w-full flex gap-10 overflow-x-auto scrollbar-hide'>{buttons}</div>;
};
