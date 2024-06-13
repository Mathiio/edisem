import React from 'react';
import { Link } from 'react-router-dom';
import {
  ConferenceIcon,
  EditionIcon,
  SeanceIcon,
  KeywordIcon,
  UserIcon,
  SunIcon,
  ThemeIcon,
  CollectionIcon,
  CitationIcon,
} from '@/components/Utils/icons';
import { columnConfigs } from './database';
interface GridProps {
  handleCardClick: (cardName: string, cardId: number, configKey: string, columnsConfig: any[]) => void;
}

const GridComponent: React.FC<GridProps> = ({ handleCardClick }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 grid-rows-2 gap-25 font-semibold text-default-600'>
      <Link
        to='#'
        className='flex justify-center items-center min-w-[200px] min-h-[300px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'
        onClick={() => handleCardClick('Conférences', 47, 'conferences', columnConfigs.conferences)}>
        <ConferenceIcon size={24} className='text-default-action' />
        Conférences
      </Link>

      <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <EditionIcon size={24} className='text-default-action' />
          Éditions
        </Link>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <SeanceIcon size={24} className='text-default-action' />
          Séances
        </Link>
      </div>
      <Link
        to='#'
        className='flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
        <KeywordIcon size={24} className='text-default-action' />
        Mots clés
      </Link>
      <Link
        to='#'
        // onClick={() => handleCardClick('Conférenciers', 1375, columnConfigs.conferenciers)}
        className='flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
        <UserIcon size={24} className='text-default-action' />
        Conférenciers
      </Link>
      <div className='grid grid-cols-2 grid-rows-2 aspect-w-1 aspect-h-1 min-w-[200px] min-h-[200px] gap-25'>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <SunIcon size={24} className='text-default-action' />
          Saisons
        </Link>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <ThemeIcon size={24} className='text-default-action' />
          Thèmes
        </Link>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <CollectionIcon size={24} className='text-default-action' />
          Collections
        </Link>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <SunIcon size={24} className='text-default-action' />
          Événements
        </Link>
      </div>
      <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <CitationIcon size={24} className='text-default-action' />
          Citations
        </Link>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <SunIcon size={24} className='text-default-action' />
          Annexes
        </Link>
      </div>
      <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <SunIcon size={24} className='text-default-action' />
          Bibliographies
        </Link>
        <Link
          to='#'
          className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
          <SunIcon size={24} className='text-default-action' />
          Personnes
        </Link>
      </div>
    </div>
  );
};

export default GridComponent;
