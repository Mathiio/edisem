import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, SoundIcon, ImageIcon, FileIcon, LinkIcon } from '@/components/Utils/icons';
import { Scrollbar } from '../Utils/Scrollbar';

export interface MediagraphyItem {
  id: number;
  title: string;
  creator: { first_name: string; last_name: string }[]; // tableau pour les créateurs
  director: { first_name: string; last_name: string };
  date: string;
  publisher?: string;
  uri?: string;
  class: string; // Utilisation de 'class' comme vous l'avez mentionné
  medium?: string;
  isPartOf?: string;
  format: string;
  type?: string;
}

const formatAuthors = (creators: { first_name: string; last_name: string }[] = []) => {
  if (!Array.isArray(creators)) {
    console.error("creators n'est pas un tableau");
    return '';
  }

  return creators
    .filter((creator) => creator.last_name) // Filtrer les créateurs avec un nom de famille non vide
    .map((creator) => {
      const lastName = creator.last_name;
      const firstInitial = creator.first_name ? `${creator.first_name[0]}.` : ''; // Prend la première lettre s'il y a un prénom
      return `${lastName}, ${firstInitial}`;
    })
    .join(', ');
};

const formatDirector = (director: { first_name: string; last_name: string }) => {
  const lastName = director.last_name;
  const firstInitial = director.first_name ? `${director.first_name[0]}.` : ''; // Prend la première lettre s'il y a un prénom
  return `${lastName}, ${firstInitial} (réalisateur)`;
};

const getIcon = (mediaType: string) => {
  switch (mediaType) {
    case '85':
    case '56':
    case '977':
      return <CameraIcon size={22} />;
    case '38':
    case '37':
      return <SoundIcon size={22} />;
    case '58':
      return <ImageIcon size={22} />;
    case '49':
      return <FileIcon size={22} />;
    default:
      return <FileIcon size={22} />;
  }
};

const mediagraphyTemplates: { [key: string]: (item: MediagraphyItem) => React.ReactNode } = {
  '58': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <i>{item.publisher}, </i>}
    </>
  ),
  '85': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <i>{item.publisher}, </i>}
    </>
  ),
  '29': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.isPartOf && <span>({item.isPartOf}) </span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  '38': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  '977': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '56': (item) => (
    <>
      {item.director && <span>{formatDirector(item.director)} (réalisateur). </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  '37': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '45': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.isPartOf && <span> (part of: {item.isPartOf})</span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '46': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  '59': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.isPartOf && <span> (part of: {item.isPartOf})</span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  '32': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher}, </span>}
    </>
  ),
  '90': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}

      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  '91': (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}

      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher} </span>}
    </>
  ),
  default: (item) => (
    <>
      {item.creator && <span>{formatAuthors(item.creator)} </span>}
      {item.director && <span>{formatDirector(item.director)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher} </span>}
      {item.isPartOf && <span> (part of: {item.isPartOf})</span>}
    </>
  ),
};

export const MediagraphyCard: React.FC<MediagraphyItem> = ({
  id,
  title,
  creator,
  director,
  date,
  publisher,
  uri,
  class: mediaType,
  medium,
  format,
  isPartOf,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const template = mediagraphyTemplates[mediaType] || mediagraphyTemplates['default'];

  return (
    <Link
      to={uri ?? '#'}
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
        isHovered ? 'border-default-action' : 'border-default-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className={`transition-transform-colors-opacity ${isHovered ? 'text-default-action' : 'text-default-300'}`}>
        {getIcon(mediaType)}
      </div>

      <div className='w-full '>
        {template({
          id,
          title,
          creator,
          format,
          director,
          date,
          publisher,
          uri,
          class: mediaType,
          medium,
          isPartOf,
        })}
      </div>

      <div
        className={`flex min-w-[40px] min-h-[40px] border-2 rounded-12 justify-center items-center transition-transform-colors-opacity ${
          isHovered ? 'border-default-action text-default-action' : 'border-default-300 text-default-300'
        }`}>
        <LinkIcon size={22} />
      </div>
    </Link>
  );
};

export const Mediagraphies: React.FC<{ items: MediagraphyItem[]; loading: boolean }> = ({ items, loading }) => {
  return (
    <div className='w-full lg:h-[700px] xl:h-[750px] overflow-hidden flex flex-col gap-20'>
      <Scrollbar withGap>
        <div className='flex flex-col gap-20'>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <MediagraphySkeleton key={index} />)
          ) : items.length === 0 ? (
            <UnloadedCard />
          ) : (
            items.map((item, index) => <MediagraphyCard key={index} {...item} />)
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

export const UnloadedCard: React.FC = () => (
  <div className='w-full lg:h-[400px] xl:h-[450px] sm:h-[450px] flex flex-col justify-center items-center gap-20'>
    <FileIcon size={42} className='text-default-200' />
    <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
      <h2 className='text-default-400 text-32 font-semibold'>Oups !</h2>
      <p className='text-default-400 text-16 text-center'>
        Aucune médiagraphie n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres
        sections de notre site.
      </p>
    </div>
  </div>
);

export const MediagraphySkeleton: React.FC = () => (
  <div className='w-full flex justify-between rounded-12 items-center bg-default-200 gap-25 p-25'>
    <div className='w-[30px] h-[24px] bg-gray-300 rounded-6'></div>
    <div className='w-full flex flex-col gap-10'>
      <div className='flex flex-col gap-5'>
        <div className='w-full h-[16px] bg-gray-300 rounded-6'></div>
        <div className='w-[80%] h-[16px] bg-gray-300 rounded-6'></div>
        <div className='w-[50%] h-[14px] bg-gray-300 rounded-6'></div>
      </div>
      <div className='w-[30%] h-[14px] bg-gray-300 rounded-6'></div>
    </div>
    <div className='w-[30px] h-[24px] bg-gray-300 rounded-6'></div>
  </div>
);
