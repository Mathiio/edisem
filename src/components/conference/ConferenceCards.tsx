import React, { useState } from 'react';
import { LinkIcon, ImageIcon, SoundIcon, CameraIcon, FileIcon, UserIcon } from '@/components/Utils/icons';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/button';

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
        isHovered ? 'border-action' : 'bg-c4'
      }`}>
      <div className={`   transition-transform-colors-opacity ${isHovered ? 'text-action' : 'text-c4'}`}>
        {getIcon()}
      </div>

      <div className='w-full flex flex-col gap-10 '>
        <div className='flex-col gap-5 flex'>
          <h3 className='text-c6 text-16 font-semibold'>{title}</h3>
          <p className='text-c5 text-16'>{author}</p>
        </div>
        <p className='text-c5 text-14'>{year}</p>
      </div>

      <div
        className={`flex min-w-[40px] min-h-[40px] border-2 rounded-12 justify-center items-center transition-transform-colors-opacity 
        ${isHovered ? 'border-action' : 'bg-c4'} 
        ${isHovered ? 'text-action' : 'text-c4'}`}>
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
        <h3 className='text-c6 text-16 font-semibold'>{author}</h3>
        <p className='text-c5 text-16'>{content}</p>
      </div>
      <p className='text-c5 text-14'>{year}</p>
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
        <Button className='p-10 text-16 rounded-6 text-c6 hover:text-c6 bg-c3 hover:bg-c4 transition-all ease-in-out duration-200'>
          {timecode}
        </Button>
        <h3 className='text-c6 text-16 font-semibold'>{author}</h3>
      </div>
      <p className='text-c5 text-16'>{content}</p>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px]  sm:h-[450px]  flex flex-col justify-center items-center gap-10 transition-transform-colors-opacity'>
      <div className='w-[85%] h-full flex flex-col justify-center items-center gap-10 p-25 transition-transform-colors-opacity'>
        <FileIcon size={42} className='transition-transform-colors-opacity text-c5' />
        <h2 className='text-c6 text-32 font-semibold'>Oups !</h2>
        <h3 className='text-c6 text-16'>Aucun contenu disponible pour cette session...</h3>
        <p className='text-c5 text-14 text-center'>
          Il n'existe actuellement aucun contenu pour cette session vidéo. Veuillez vérifier plus tard ou explorer
          d'autres sections de notre site pour trouver des informations intéressantes.
        </p>
      </div>
    </div>
  );
};

interface MiniCardCoferencierProps {
  Name: string;
}

export const MiniCardCoferencier: React.FC<MiniCardCoferencierProps> = ({ Name }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to='https://github.com/nextui-org/nextui'
      className={`w-fit flex flex-row justify-between border-2 rounded-8 items-center gap-10 p-10  transition-transform-colors-opacity ${
        isHovered ? 'border-action' : 'bg-c4'
      }`}>
      <div className={`   transition-transform-colors-opacity ${isHovered ? 'text-action' : 'text-c4'}`}>
        {<UserIcon size={16} />}
      </div>

      <div className='w-full flex flex-col gap-10 '>
        <p className='text-c6 text-16'>{Name}</p>
      </div>
    </Link>
  );
};
