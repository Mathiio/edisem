import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { FileIcon } from '@/components/Utils/icons';
import { Link } from 'react-router-dom';

interface BibliographyCardProps {
  title: string;
  author: string;
  date: string;
  source?: string;
  type: number;
  thumbnail?: string;
  url?: string;
}


export const BibliographyCard: React.FC<BibliographyCardProps> = ({
  author,
  date,
  title,
  source,
  type,
  thumbnail,
  url,
}) => {
  const hasContent = (value: string | undefined) => value && value.trim() !== '';

  return (
    <div className='w-full flex flex-col justify-start items-start gap-10 transition-transform-colors-opacity'>
      <div className={`flex ${thumbnail ? 'flex-row' : 'flex-col'} gap-4 items-start`}>
        {thumbnail && (
          <div className='flex-shrink-0'>
            <img src={thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
          </div>
        )}
        <div className='w-full flex flex-col gap-10'>
          {type === 40 || type === 41 ? (
            <p className='text-default-600 text-16'>
              {hasContent(author) && <span>{author}.</span>}
              {hasContent(date) && <span> ({date}).</span>}
              {hasContent(title) && <span className='italic'> {title}.</span>}
              {hasContent(source) && <span> {source}.</span>}
            </p>
          ) : (
            <p className='text-default-600 text-16'>{title}</p>
          )}
          {url && (
            <Link to={url} className='text-default-500 underline'>
              Voir la source
            </Link>
          )}
        </div>
      </div>
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
  bibliographies: {
    author: string;
    date: string;
    title: string;
    source?: string;
    type: number;
    thumbnail?: string;
    url?: string;
  }[];
  loading: boolean;
}

export const Bibliographies: React.FC<BibliographiesProps> = ({ bibliographies, loading }) => {
  return (
    <div className='w-full lg:h-[700px] xl:h-[750px] overflow-hidden flex flex-col gap-20'>
      <Scrollbar withGap>
        <div className='flex flex-col gap-50'>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <BibliographySkeleton key={index} />)
          ) : bibliographies.length === 0 ? (
            <UnloadedCard />
          ) : (
            bibliographies.map((bibliography, index) => (
              <BibliographyCard
                key={index}
                title={bibliography.title}
                author={bibliography.author}
                date={bibliography.date}
                type={bibliography.type}
                source={bibliography.source}
                thumbnail={bibliography.thumbnail}
                url={bibliography.url}
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
