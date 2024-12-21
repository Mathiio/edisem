import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowIcon, CrossIcon } from '@/components/utils/icons';

interface ButtonProps {
  onClick?: (index: number) => void;
  reset: boolean;
  selected: number[];
}
interface ButtonGeneratorProps {
  numberOfButtons: number;
}

export const NavConferencierFilter: React.FC<ButtonGeneratorProps & ButtonProps> = ({
  numberOfButtons,
  onClick,
  reset,
  selected,
}) => {
  const [translate, setTranslate] = useState(0);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState<number[]>(selected); // Use selected prop
  const translateAmount = 200; // Adjust this value as needed

  useEffect(() => {
    if (reset) {
      setSelectedButtons([]);
    }
  }, [reset]);

  const handleButtonClick = (index: number) => {
    setSelectedButtons((prevSelected) =>
      prevSelected.includes(index) ? prevSelected.filter((i) => i !== index) : [...prevSelected, index],
    );
    if (onClick) {
      onClick(index);
    }
  };

  useEffect(() => {
    const container = document.querySelector('.button-container');
    if (container) {
      setIsLeftVisible(translate > 0);
      setIsRightVisible(container.scrollWidth > container.clientWidth + translate);
    }
  }, [translate]);

  const handleLeftClick = () => {
    setTranslate((prevTranslate) => Math.max(prevTranslate - translateAmount, 0));
  };

  const handleRightClick = () => {
    setTranslate((prevTranslate) => prevTranslate + translateAmount);
  };

  const sortedButtons = Array.from({ length: numberOfButtons }, (_, i) => i).sort((a, b) => {
    if (selectedButtons.includes(a) && !selectedButtons.includes(b)) {
      return -1;
    }
    if (!selectedButtons.includes(a) && selectedButtons.includes(b)) {
      return 1;
    }
    return a - b;
  });

  const buttons = sortedButtons.map((i) => (
    <Button
      style={{ transform: `translateX(-${translate}px)` }}
      key={i}
      onClick={() => handleButtonClick(i)}
      radius='none'
      className={`h-[32px]  text-16 rounded-8 ${
        selectedButtons.includes(i)
          ? 'bg-default-action text-default-100'
          : 'text-default-500 bg-default-200 hover:text-default-500 hover:bg-default-300'
      } transition-all ease-in-out duration-200 navfilter flex items-center`}
      endContent={selectedButtons.includes(i) ? <CrossIcon size={18} /> : null}>
      Button {i + 1}
    </Button>
  ));

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
