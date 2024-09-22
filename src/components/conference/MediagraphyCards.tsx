import React, { useState } from 'react';
import { Skeleton } from '@nextui-org/react';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { LinkIcon, ImageIcon, SoundIcon, CameraIcon, FileIcon } from '@/components/Utils/icons';
import { Link } from 'react-router-dom';

interface MediagraphyCardProps {
  mediagraphy: string;
  author: string;
  date: string;
  type: string;
  url: string;
}

export const MediagraphyCard: React.FC<MediagraphyCardProps> = ({ author, mediagraphy, date, type, url }) => {
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
      to={url}
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
        isHovered ? 'border-default-action' : 'border-default-300'
      }`}>
      <div
        className={`   transition-transform-colors-opacity ${isHovered ? 'text-default-action' : 'text-default-300'}`}>
        {getIcon()}
      </div>

      <div className='w-full flex flex-col gap-10 '>
        <div className='flex-col gap-5 flex'>
          <h3 className='text-default-500 text-16 font-semibold'>{mediagraphy}</h3>
          <p className='text-default-400 text-16'>{author}</p>
        </div>
        <p className='text-default-400 text-14'>{date}</p>
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

export const MediagraphySkeleton: React.FC = () => {
  return (
    <div className='w-full flex  justify-between rounded-12 items-center bg-default-200 gap-25 p-25'>
      <Skeleton className='w-[30px] h-[24px] rounded-6' />
      <div className='w-full flex flex-col gap-10'>
        <div className='flex-col gap-5 flex'>
          <Skeleton className='w-[100%] rounded-6'>
            <p className='text-16'>_</p>
          </Skeleton>
          <Skeleton className='w-[80%] rounded-6'>
            <p className='text-16'>_</p>
          </Skeleton>
          <Skeleton className='w-[50%] rounded-6'>
            <p className='text-14'>_</p>
          </Skeleton>
        </div>
        <Skeleton className='w-[30%] rounded-6'>
          <p className='text-14'>_</p>
        </Skeleton>
      </div>
      <Skeleton className='w-[30px] h-[24px] rounded-6' />
    </div>
  );
};

interface MediagraphiesProps {
  mediagraphies: { mediagraphy: string; author: string; date: string; type: string; url: string }[];
  loading: boolean;
}

export const Mediagraphies: React.FC<MediagraphiesProps> = ({ mediagraphies, loading }) => {
  return (
    <div className='w-full lg:h-[700px] xl:h-[750px] overflow-hidden flex flex-col gap-20'>
      <Scrollbar withGap>
        <div className='flex flex-col gap-20'>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <MediagraphySkeleton key={index} />)
          ) : mediagraphies.length === 0 ? (
            <UnloadedCard />
          ) : (
            mediagraphies.map((mediagraphies, index) => (
              <MediagraphyCard
                key={index}
                mediagraphy={mediagraphies.mediagraphy}
                author={mediagraphies.author}
                date={mediagraphies.date}
                type={mediagraphies.type}
                url={mediagraphies.url}
              />
            ))
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px] sm:h-[450px] flex flex-col justify-center items-center gap-20 transition-transform-colors-opacity'>
      <FileIcon size={42} className='text-default-200' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-default-400 text-32 font-semibold'>Oups !</h2>
        <p className='text-default-400 text-16 text-regular text-center'>
          Aucune médiagraphie n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer
          d'autres sections de notre site.
        </p>
      </div>
    </div>
  );
};
