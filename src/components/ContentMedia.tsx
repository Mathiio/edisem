import { ContentMediaCard } from './ContentMediaCard';
import { Scrollbar } from './Scrollbar';
import React from 'react';

interface ContentMediaProps {
  numberOfCards: number;
}

export const ContentMedia: React.FC<ContentMediaProps> = ({ numberOfCards }) => {
  const cards = [];

  for (let i = 0; i < numberOfCards; i++) {
    cards.push(<ContentMediaCard key={i} title={`Card ${i + 1}`} author={`Content for card ${i + 1}`} year={1222} />);
  }

  return (
    <div className='w-full h-[460px] '>
      <Scrollbar>
        <div className='flex flex-col gap-25'>{cards}</div>
      </Scrollbar>
    </div>
  );
};
