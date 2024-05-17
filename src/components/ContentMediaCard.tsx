import React, { useState } from 'react';
import { ArrowIcon } from './icons';
import { Link } from 'react-router-dom';

interface ContentMediaCardProps {
  title: string;
  author: string;
  year: number;
}

export const ContentMediaCard: React.FC<ContentMediaCardProps> = ({ title, author, year }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to='https://github.com/nextui-org/nextui'
      className={`w-full flex flex-row justify-between border-2 rounded-sm p-sm items-center gap-sm transition-transform-colors-opacity ${
        isHovered ? 'border-secondary-400' : 'border-default-300'
      }`}>
      <div
        className={`   transition-transform-colors-opacity ${isHovered ? 'text-secondary-400' : 'text-default-300'}`}>
        <ArrowIcon transform='rotate(180deg)'/>
      </div>

      <div className='w-full flex flex-col gap-vs'>
        <div className='flex-col gap-vvs flex'>
          <div className='text-default-600 text-other font-semibold'>{title}</div>
          <div className='text-default-500 text-other'>{author}</div>
        </div>
        <div className='text-default-500 text-date'>{year}</div>
      </div>

      <div
        className={`flex min-w-[40px] min-h-[40px] border-2 rounded-[12px] justify-center items-center transition-transform-colors-opacity 
        ${isHovered ? 'border-secondary-400' : 'border-default-300'} 
        ${isHovered ? 'text-secondary-400' : 'text-default-300'}`}>
        <ArrowIcon/>
      </div>
    </Link>
  );
};
