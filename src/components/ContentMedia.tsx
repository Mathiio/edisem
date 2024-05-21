import { ContentMediaCard } from './ContentMediaCard';
import React from 'react';

interface ContentMediaProps {
  numberOfCards: number;
}

export const ContentMedia: React.FC<ContentMediaProps> = ({ numberOfCards }) => {
  const cards = [];

  for (let i = 0; i < numberOfCards; i++) {
    cards.push(<ContentMediaCard key={i} title={`Card ${i + 1}`} author={`Content for card ${i + 1}`} year={1222} />);
  }

  return <div className='w-full h-[460px] overflow-y-auto scrollbar-hide  flex flex-col gap-25'>{cards}</div>;
};
