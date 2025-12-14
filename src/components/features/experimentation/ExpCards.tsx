import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { Conference } from '@/types/ui';
import { ExperimentationIcon, ThumbnailIcon, UserIcon } from '@/components/ui/icons';


export const ExpCard: React.FC<Conference> = (props) => {
  const experimentation = props;
  const navigate = useNavigate();

  const openConf = () => {
    navigate(`/corpus/experimentation/${experimentation.id}`);
  };

  return (
     <div
      onClick={openConf}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-20 rounded-18 justify-between flex flex-col gap-20 hover:bg-c2 h-full transition-all ease-in-out duration-300'>
      <div className="flex flex-col gap-10 justify-between">
        {/* Thumbnail or placeholder */}
        <div
          className={`w-full h-150 rounded-12 justify-center items-center flex ${experimentation.thumbnail ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'}`}
          style={experimentation.thumbnail ? { backgroundImage: `url(${experimentation.thumbnail})` } : {}}>
            {!experimentation.thumbnail && <ThumbnailIcon className="text-c4/20" size={40}/>}
        </div>

          {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title */}
          <div className='relative'>
            <p className='text-16 text-c6 font-medium line-clamp-2 overflow-hidden'>
              {experimentation.title}
            </p>
          </div>

          {/* Author */}
          <div className='flex gap-1.5 items-center'>
            <div className="w-7 h-7 flex items-center justify-center bg-c3 rounded-8">
              <UserIcon className="text-c4" size={12} />
            </div>
            <p className='text-14 text-c4 font-extralight'>{experimentation.acteurs?.[0]?.name ? experimentation.acteurs?.[0]?.name : "Aucun intervenant"}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 items-center">
        <ExperimentationIcon className="text-c4/60" size={14} />
        <p className='text-14 text-c4/60 font-medium'>Expérimentation</p>
      </div>
    </div>
  );
};

export const ExpCardSkeleton: React.FC = () => {
  return (
    <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-20 rounded-18 justify-between flex flex-col gap-20 h-full'>
      <div className="flex flex-col gap-10 justify-between">
        {/* Image placeholder */}
        <Skeleton className="w-300 h-150 rounded-12">
          <div className="w-300 h-150 rounded-12 bg-gradient-to-br from-c2 to-c3 flex items-center justify-center">
            <ThumbnailIcon className="text-c4/20" size={40} />
          </div>
        </Skeleton>

        {/* Content */}
        <div className='flex flex-col gap-2 w-full'>
          {/* Title (2 lines) */}
          <div className='flex flex-col gap-2'>
            <Skeleton className="h-4 w-full rounded-6" />
            <Skeleton className="h-4 w-full rounded-6" />
          </div>

          {/* Actants section */}
          <div className='flex items-center gap-5 mt-2'>
            <Skeleton className="h-4 w-28 rounded-6" />
          </div>
        </div>
      </div>

      {/* Badge "Experimentation" at the bottom */}
      <div className="flex gap-1.5 items-center">
        <Skeleton className="w-4 h-4 rounded-6" />
        <Skeleton className="h-4 w-16 rounded-6" />
      </div>
    </div>
  );
};
