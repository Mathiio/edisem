import React, { useState } from 'react';
import { LinkIcon, ImageIcon } from './icons';
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
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
        isHovered ? 'border-secondary-400' : 'border-default-300'
      }`}>
      <div
        className={`   transition-transform-colors-opacity ${isHovered ? 'text-secondary-400' : 'text-default-300'}`}>
            <ImageIcon size={22}/>
      </div>

      <div className='w-full flex flex-col gap-10 '>
        <div className='flex-col gap-5 flex'>
          <div className='text-default-500 text-16 font-semibold'>{title}</div>
          <div className='text-default-400 text-16'>{author}</div>
        </div>
        <div className='text-default-400 text-14'>{year}</div>
      </div>

      <div
        className={`flex min-w-[40px] min-h-[40px] border-2 rounded-12 justify-center items-center transition-transform-colors-opacity 
        ${isHovered ? 'border-secondary-400' : 'border-default-300'} 
        ${isHovered ? 'text-secondary-400' : 'text-default-300'}`}>
        <LinkIcon size={22}/>
      </div>
    </Link>
  );
};
