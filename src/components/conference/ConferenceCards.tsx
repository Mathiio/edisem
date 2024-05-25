import React, { useState } from 'react';
import { LinkIcon, ImageIcon, SoundIcon, CameraIcon } from '../Utils/icons';
import { Link } from 'react-router-dom';
import { Button } from "@nextui-org/button";


interface MediaCardProps {
  title: string;
  author: string;
  year: number;
  type: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({ title, author, year, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'video':
        return <CameraIcon size={22} />;
      case 'sound':
        return <SoundIcon size={22} />;
      case 'image':
        return <ImageIcon size={22} />;
    }
  };

  return (
    <Link
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to='https://github.com/nextui-org/nextui'
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
        isHovered ? 'border-default-action' : 'border-default-300'
      }`}>
      <div
        className={`   transition-transform-colors-opacity ${isHovered ? 'text-default-action' : 'text-default-300'}`}>
        {getIcon()}
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
        ${isHovered ? 'border-default-action' : 'border-default-300'} 
        ${isHovered ? 'text-default-action' : 'text-default-300'}`}>
        <LinkIcon size={22} />
      </div>
    </Link>
  );
};




interface BibliographieCardProps {
  author: string;
  content: string;
  year: number;
}

export const BibliographieCard: React.FC<BibliographieCardProps> = ({ author, content, year }) => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 items-start gap-10 transition-transform-colors-opacity'>
      <div className='w-full flex flex-col gap-5 '>
          <div className='text-default-500 text-16 font-semibold'>{author}</div>
          <div className='text-default-400 text-16'>{content}</div>
      </div>
      <div className='text-default-400 text-14'>{year}</div>
    </div>
  );
};




interface CitationCardProps {
  timecode: string;
  author: string;
  content: string;
}

export const CitationCard: React.FC<CitationCardProps> = ({ timecode, author, content }) => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 items-start gap-10 transition-transform-colors-opacity'>
      <div className='w-full flex justify-start items-center gap-10'>
          <Button className='p-10 text-16 rounded-6 text-default-500 hover:text-default-500 bg-default-200 hover:bg-default-300 transition-all ease-in-out duration-200'>{timecode}</Button>
          <div className='text-default-500 text-16 font-semibold'>{author}</div>
      </div>
      <div className='text-default-400 text-16'>{content}</div>
    </div>
  );
};