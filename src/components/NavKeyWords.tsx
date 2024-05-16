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
        className=' min-w-fit bg-default-50 border-2 border-default-300 hover:border-secondary-400 hover:opacity-100 h-8 text-default-500 hover:text-secondary-400 px-sm'>
        Press me
      </Button>,
    );
  }

  return <div className='w-full flex gap-vs overflow-x-auto scrollbar-hide'>{buttons}</div>;
};
