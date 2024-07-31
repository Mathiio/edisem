import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { FileIcon } from '@/components/Utils/icons';

interface BibliographyCardProps {
  bibliography: string;
  author: string;
  date: string;
}

export const BibliographyCard: React.FC<BibliographyCardProps> = ({ author, bibliography, date }) => {
  return (
    <div className='w-full flex flex-col justify-start items-start gap-10 transition-transform-colors-opacity'>
      <div className='w-full flex flex-col gap-5 '>
        <h3 className='text-default-500 text-16 font-semibold'>{author}</h3>
        <p className='text-default-400 text-16'>{bibliography}</p>
      </div>
      <p className='text-default-400 text-14'>{date}</p>
    </div>
  );
};

export const BibliographySkeleton: React.FC = () => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 items-start bg-default-200 p-10 gap-10 transition-transform-colors-opacity'>
      <div className='w-full flex flex-col justify-start items-start gap-5'>
        <Skeleton className='w-[30%] rounded-6'>
          <p className='text-16'>_</p>
        </Skeleton>
        <Skeleton className='w-[100%] rounded-6'>
          <p className='text-14'>_</p>
        </Skeleton>
        <Skeleton className='w-[80%] rounded-6'>
          <p className='text-14'>_</p>
        </Skeleton>
      </div>
      <Skeleton className='w-[30%] rounded-6'>
        <p className='text-14'>_</p>
      </Skeleton>
    </div>
  );
};

interface BibliographiesProps {
  bibliographies: { bibliography: string; author: string; date: string }[];
  loading: boolean;
}

export const Bibliographies: React.FC<BibliographiesProps> = ({ bibliographies, loading }) => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px] sm:h-[450px] overflow-hidden flex flex-col gap-20'>
      <Scrollbar withGap>
        <div className='flex flex-col gap-20'>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <BibliographySkeleton key={index} />)
          ) : bibliographies.length === 0 ? (
            <UnloadedCard />
          ) : (
            bibliographies.map((bibliography, index) => (
              <BibliographyCard
                key={index}
                bibliography={bibliography.bibliography}
                author={bibliography.author}
                date={bibliography.date}
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
    <div className='w-full lg:h-[400px] xl:h-[450px] sm:h-[450px] flex flex-col justify-center items-center gap-20'>
      <FileIcon size={42} className='text-default-200' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-default-400 text-32 font-semibold'>Oups !</h2>
        <p className='text-default-400 text-16 text-regular text-center'>
          Aucune bibliographie n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer
          d'autres sections de notre site.
        </p>
      </div>
    </div>
  );
};
