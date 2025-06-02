import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, SoundIcon, ImageIcon, FileIcon } from '@/components/utils/icons';

export interface MediagraphyItem {
  id: number;
  title: string;
  creator: { first_name: string; last_name: string }[]; // tableau pour les créateurs
  director: { first_name: string; last_name: string }[];
  date: string;
  publisher?: string;
  uri?: string;
  class: string; // Utilisation de 'class' comme vous l'avez mentionné
  medium?: string;
  isPartOf?: string;
  format: string;
  type?: string;
  thumbnail?: string;
  location?: string;
  place?: string;
  resource_template_id: string;
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

const formatDirector = (director: { first_name: string; last_name: string }[] = []) => {
  if (!Array.isArray(director)) {
    console.error("creators n'est pas un tableau");
    return '';
  }

  return director
    .filter((director) => director.last_name) // Filtrer les créateurs avec un nom de famille non vide
    .map((director) => {
      const lastName = director.last_name;
      const firstInitial = director.first_name ? `${director.first_name[0]}.` : ''; // Prend la première lettre s'il y a un prénom
      return `${lastName}, ${firstInitial}`;
    })
    .join(', ');
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
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <i>{item.title}. </i>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.format && <span> [{item.format}] </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '85': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <i>{item.publisher}</i>}
    </>
  ),
  '29': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.isPartOf && <span>({item.isPartOf}) </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '38': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '977': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '56': (item) => (
    <>
      {item.creator && item.creator.length > 0 ? (
        <span>{formatAuthors(item.creator)} </span>
      ) : (
        item.director && item.director.length > 0 && <span>{formatDirector(item.director)} </span>
      )}

      {item.date && <span>({item.date}). </span>}
      {item.title && <i>{item.title}. </i>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),

  '37': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <i>{item.title} </i>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '45': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.isPartOf && <span> (part of: {item.isPartOf}) </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '46': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '59': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title} </span>}
      {item.isPartOf && <span> (part of: {item.isPartOf}) </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '32': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '90': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <i>{item.title}. </i>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '91': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher}</span>}
    </>
  ),
  '434': (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <i>{item.title}. </i>}
      {item.medium && <span> [{item.medium}]. </span>}
      {item.location && <span> {item.location}, </span>}
      {item.place && <span> {item.place}</span>}
    </>
  ),
  default: (item) => (
    <>
      {item.creator && item.creator.length > 0 && <span>{formatAuthors(item.creator)} </span>}
      {item.director && item.creator.length > 0 && <span>{formatDirector(item.director)} </span>}
      {item.date && <span>({item.date}). </span>}
      {item.title && <span>{item.title}. </span>}
      {item.medium && <span> [{item.medium}] </span>}
      {item.publisher && <span>{item.publisher} </span>}
      {item.isPartOf && <span> (part of: {item.isPartOf})</span>}
    </>
  ),
};

import ReactDOMServer from 'react-dom/server';
import { AnnotationDropdown } from './AnnotationDropdown';

const ensureEndsWithPeriod = (content: React.ReactNode): React.ReactNode => {
  if (React.isValidElement(content)) {
    // Convertir l'élément React en chaîne HTML
    const htmlString = ReactDOMServer.renderToStaticMarkup(content);

    // Utiliser une expression régulière pour extraire uniquement le texte
    const textContent = htmlString.replace(/<[^>]*>/g, '').trim(); // Enlever toutes les balises HTML

    // Vérifier si le texte se termine par un point
    if (textContent.endsWith('.')) {
      return content; // Si c'est le cas, on retourne l'élément inchangé
    } else {
      // Si ce n'est pas le cas, on ajoute un point
      const updatedHtml = htmlString.trim() + '.';
      return <span dangerouslySetInnerHTML={{ __html: updatedHtml }} />;
    }
  }

  // Si ce n'est pas un élément React, on retourne le contenu tel quel
  return content;
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
  thumbnail,
  location,
  place,
  resource_template_id,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const template = mediagraphyTemplates[mediaType] || mediagraphyTemplates['default'];

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25  transition-transform-colors-opacity ${
        isHovered ? 'border-c6' : 'border-c3'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={uri ?? '#'} target='_blank'>
        <div
          className={`flex flex-col justify-center transition-transform-colors-opacity ${
            isHovered ? 'text-c6' : 'text-c4'
          }`}>
          {thumbnail ? (
            <img src={thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
          ) : (
            getIcon(mediaType)
          )}
        </div>

        <div className='w-full text-16 text-c6 font-extralight'>
          {ensureEndsWithPeriod(
            template({
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
              resource_template_id,
              location,
              place,
            }),
          )}
        </div>
      </Link>
      <div className='flex flex-col h-full py-25 pr-25'>
        <AnnotationDropdown
          id={id}
          content={ensureEndsWithPeriod(
            template({
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
              resource_template_id,
              location,
              place,
            }),
          )}
          image={thumbnail ? thumbnail : getIcon(mediaType)}
          type='Medias'
        />
      </div>
    </div>
  );
};

export const Mediagraphies: React.FC<{ items: MediagraphyItem[]; loading: boolean }> = ({ items, loading }) => {
  // Fonction de tri pour comparer les noms de famille des créateurs ou réalisateurs
  const sortByLastName = (a: MediagraphyItem, b: MediagraphyItem) => {
    const getLastName = (item: MediagraphyItem) => {
      // Vérifier si 'creator' ou 'director' existent et retourner le nom de famille
      const creatorLastName = item.creator?.[0]?.last_name || ''; // Si 'creator' est défini et contient un nom de famille
      const directorLastName = item.director?.[0]?.last_name || ''; // Si 'director' est défini et contient un nom de famille

      // Si creator est défini, utiliser son nom de famille
      if (creatorLastName) return creatorLastName;
      // Sinon, si director est défini, utiliser son nom de famille
      if (directorLastName) return directorLastName;
      return ''; // Aucun nom de famille, pas de tri
    };

    const lastNameA = getLastName(a);
    const lastNameB = getLastName(b);

    // Tri alphabétique en comparant les noms de famille
    if (lastNameA < lastNameB) return -1;
    if (lastNameA > lastNameB) return 1;
    return 0;
  };

  // Séparer les items en deux groupes selon l'ID
  const conferenceMediagraphies = items.filter((item) => item.resource_template_id === '83');
  const complementaryMediagraphies = items.filter((item) => item.resource_template_id !== '83');

  // Trier les éléments par nom de famille si possible
  const sortedConferenceMediagraphies = conferenceMediagraphies.sort(sortByLastName);
  const sortedComplementaryMediagraphies = complementaryMediagraphies.sort(sortByLastName);

  return (
    <div className='w-full h-full overflow-hidden flex flex-col gap-20'>
      <div className='flex flex-col gap-20 overflow-y-auto scroll-container'>
        {loading ? (
          Array.from({ length: items.length }).map((_, index) => <MediagraphySkeleton key={index} />)
        ) : (
          <>
            {/* Mediagraphies de conférence */}
            {sortedConferenceMediagraphies.length > 0 && (
              <>
                <h2 className='text-16 text-c5 font-medium'>Médiagraphies de Conférence</h2>
                <div className='flex flex-col gap-10'>
                  {sortedConferenceMediagraphies.map((item, index) => (
                    <MediagraphyCard key={index} {...item} />
                  ))}
                </div>
              </>
            )}

            {/* Médiagraphies complémentaires */}
            {sortedComplementaryMediagraphies.length > 0 && (
              <>
                <h2 className='text-16 text-c5 font-medium'>Médiagraphies Complémentaires</h2>
                <div className='flex flex-col gap-10'>
                  {sortedComplementaryMediagraphies.map((item, index) => (
                    <MediagraphyCard key={index} {...item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Si aucune médiagraphie n'est disponible */}
        {items.length === 0 && !loading && <UnloadedCard />}
      </div>
    </div>
  );
};

export const UnloadedCard: React.FC = () => (
  <div className='w-full h-full flex flex-col justify-center items-center gap-20 mt-50'>
    <FileIcon size={42} className='text-c6' />
    <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
      <h2 className='text-c6 text-32 font-semibold'>Oups !</h2>
      <p className='text-c5 text-16 text-center'>
        Aucune médiagraphie n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres
        sections de notre site.
      </p>
    </div>
  </div>
);

export const MediagraphySkeleton: React.FC = () => (
  <div className='w-full flex justify-between rounded-12 items-center bg-c3 gap-25 p-25'>
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
