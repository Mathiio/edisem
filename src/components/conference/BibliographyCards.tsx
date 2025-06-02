import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnnotationDropdown } from './AnnotationDropdown';
import { FileIcon } from '@/components/utils/icons';

export interface BibliographyItem {
  creator: { first_name: string; last_name: string }[];
  date: string;
  title: string;
  source?: string;
  type: string;
  class: number;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  publisher?: string;
  editor?: string;
  edition?: string;
  ispartof?: string;
  id: number;
  number: string;
  thumbnail?: string;
  resource_template_id: string;
}

const hasContent = (
  value: string | string[] | { first_name: string; last_name: string }[] | undefined | null,
): boolean => {
  // Si value est un tableau d'objets créateurs (avec first_name et last_name)
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    'first_name' in value[0] &&
    'last_name' in value[0]
  ) {
    return value.some(
      (creator) => typeof creator === 'object' && (creator.first_name.trim() !== '' || creator.last_name.trim() !== ''), // Vérifie que l'un des deux est non vide
    );
  }

  // Si value est un tableau de chaînes de caractères
  if (Array.isArray(value)) {
    return value.some((item) => typeof item === 'string' && item.trim() !== '');
  }

  // Si value est une chaîne de caractères
  return typeof value === 'string' && value.trim() !== '';
};

const formatAuthors = (creators: { first_name: string; last_name: string }[]) => {
  const formattedAuthors = creators
    .filter((creator) => creator.last_name) // Filtrer les créateurs avec un nom de famille non vide
    .map((creator) => {
      const lastName = creator.last_name;
      const firstInitial = creator.first_name ? `${creator.first_name[0]}.` : ''; // Utilise l'initiale s'il y a un prénom
      return firstInitial ? `${lastName}, ${firstInitial}` : lastName; // Si pas de prénom, affiche seulement le nom
    });

  return formattedAuthors.join(', ');
};

// Modèles de formatage
const bibliographyTemplates: { [key: number]: (item: BibliographyItem) => React.ReactNode } = {
  40: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}. </i>}
      {hasContent(item.publisher) && <span>{item.publisher}. </span>}
    </>
  ),
  41: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title}. </span>}

      {hasContent(item.editor) && (
        <span>
          Dans {item.editor} <i>(dir.)</i>,
        </span>
      )}

      {hasContent(item.ispartof) && <span> {item.ispartof}</span>}
      {hasContent(item.pages) && <span>, ({item.pages})</span>}

      {hasContent(item.publisher) && <span>. {item.publisher}</span>}
    </>
  ),
  81: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title}. </span>}
      {hasContent(item.editor) && <span>Dans {item.editor} (dir.), </span>}
      {hasContent(item.source) && <i>{item.source} </i>}
      {hasContent(item.pages) && <span>({item.pages}). </span>}
      {hasContent(item.publisher) && <span>{item.publisher}. </span>}
    </>
  ),
  // 88: (item) => (
  //   <>
  //     {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
  //     {hasContent(item.date) && <span>({item.date}). </span>}
  //     {hasContent(item.title) && <i>{item.title}</i>}
  //     {(hasContent(item.publisher) || hasContent(item.type)) && (
  //       <span>
  //         &nbsp;[{item.type && `${item.type}`}
  //         {item.type && item.publisher && ', '}
  //         {item.publisher && `${item.publisher}`}].
  //       </span>
  //     )}

  //     {hasContent(item.volume) && (
  //       <span>
  //         {' '}
  //         <i>{item.volume}</i>{' '}
  //       </span>
  //     )}
  //     {hasContent(item.issue) && <span>({item.issue})</span>}
  //     {hasContent(item.pages) && <span>, {item.pages}</span>}
  //   </>
  // ),

  88: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {(hasContent(item.publisher) || hasContent(item.type)) && (
        <span>
          &nbsp;[{item.type && `${item.type}`}
          {item.type && item.publisher && ', '}
          {item.publisher && `${item.publisher}`}].
        </span>
      )}
    </>
  ),

  90: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {(hasContent(item.publisher) || hasContent(item.type)) && (
        <span>
          &nbsp;[{item.type && `${item.type}`}
          {item.type && item.publisher && ', '}
          {item.publisher && `${item.publisher}`}].
        </span>
      )}
    </>
  ),

  49: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {hasContent(item.publisher) && <span>. {item.publisher}</span>}
    </>
  ),
  36: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {hasContent(item.publisher) && <span>{item.publisher}. </span>}
    </>
  ),
  35: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title}.</span>}
      {hasContent(item.publisher) && <i>&nbsp; {item.publisher} &nbsp;</i>}
      {hasContent(item.volume) && (
        <span>
          {' '}
          <i>{item.volume}</i>{' '}
        </span>
      )}
      {hasContent(item.issue) && <i>({item.issue}),</i>}
      {hasContent(item.pages) && <span>{item.pages}.</span>}
    </>
  ),
  82: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {hasContent(item.number) && <span>{item.number}. </span>}
      {hasContent(item.issue) && <span>({item.issue}). </span>}
      {hasContent(item.publisher) && <span>{item.publisher}. </span>}
    </>
  ),
  47: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {hasContent(item.publisher) && <span>{item.publisher}. </span>}
    </>
  ),
  83: (item) => <>{hasContent(item.title) && <span>{item.title}. </span>}</>,
  66: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title}. </span>}
      {hasContent(item.type) && <span> {item.type} </span>}
      {hasContent(item.source) && <i>{item.source}, </i>}
    </>
  ),
  54: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title}. </span>}
      {hasContent(item.editor) && <span>Dans {item.editor} (dir.), </span>}
      {hasContent(item.source) && <i>{item.source}, </i>}
    </>
  ),
};

// Composant BibliographyCard optimisé
export const BibliographyCard: React.FC<BibliographyItem & { uniqueKey?: number }> = (props) => {
  const { thumbnail, url } = props;
  const [isHovered, setIsHovered] = useState(false);

  const formatBibliography = (item: BibliographyItem) => {
    //console.log(item);
    const template = bibliographyTemplates[item.class];
    return template ? template(item) : item.title || 'Référence non formatée';
  };

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25  transition-transform-colors-opacity ${
        isHovered ? 'border-c6' : 'border-c3'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={url ?? '#'} target='_blank'>
        <div className={`flex  ${thumbnail ? 'flex-row' : 'flex-col'} gap-4 items-start`}>
          {thumbnail && (
            <div className='flex-shrink-0'>
              <img src={thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
            </div>
          )}
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16'>{formatBibliography(props)}</p>
          </div>
        </div>
      </Link>
      <div className='flex flex-col h-full py-25 pr-25'>
        <AnnotationDropdown id={props.id} content={formatBibliography(props)} image={thumbnail} type='Bibliographie' />
      </div>
    </div>
  );
};

export const BibliographySkeleton: React.FC = () => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 items-start bg-c3 p-10 gap-10'>
      <div className='w-full flex flex-col justify-start items-start gap-5'>
        <div className='w-[30%] rounded-6 bg-gray-300 h-6'></div>
        <div className='w-full rounded-6 bg-gray-300 h-4'></div>
        <div className='w-[80%] rounded-6 bg-gray-300 h-4'></div>
      </div>
      <div className='w-[30%] rounded-6 bg-gray-300 h-4'></div>
    </div>
  );
};

interface BibliographiesProps {
  bibliographies: BibliographyItem[];
  loading: boolean;
}

export const Bibliographies: React.FC<BibliographiesProps> = ({ bibliographies, loading }) => {
  // Séparation des bibliographies en fonction de l'ID
  const conferenceBibliographies = bibliographies.filter((bibliography) => bibliography.resource_template_id === '81');
  const complementaryBibliographies = bibliographies.filter(
    (bibliography) => bibliography.resource_template_id !== '81',
  );

  return (
    <div className='w-full h-full overflow-hidden flex flex-col gap-20'>
      <div className='flex flex-col gap-20 overflow-y-auto scroll-container'>
        {loading ? (
          Array.from({ length: bibliographies.length }).map((_, index) => <BibliographySkeleton key={index} />)
        ) : (
          <>
            {/* Bibliographies de conférence */}
            {conferenceBibliographies.length > 0 && (
              <>
                <h2 className='text-16 text-c5 font-medium'>Bibliographies de Conférence</h2>
                <div className='flex flex-col gap-10'>
                  {conferenceBibliographies.map((bibliography, index) => (
                    <BibliographyCard key={index} {...bibliography} uniqueKey={index} />
                  ))}
                </div>
              </>
            )}

            {/* Bibliographies complémentaires */}
            {complementaryBibliographies.length > 0 && (
              <>
                <h2 className='text-16 text-c5 font-medium'>Bibliographies Complémentaires</h2>
                <div className='flex flex-col gap-10'>
                  {complementaryBibliographies.map((bibliography, index) => (
                    <BibliographyCard key={index} {...bibliography} uniqueKey={index} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Si aucune bibliographie n'est disponible */}
        {bibliographies.length === 0 && !loading && <UnloadedCard />}
      </div>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center gap-20 mt-50'>
      <FileIcon size={42} className='text-c6' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-c6 text-32 font-semibold'>Oups !</h2>
        <p className='text-c5 text-16 text-center'>
          Aucune bibliographie n'est liée à cette conférence. Veuillez vérifier plus tard ou explorer d'autres sections.
        </p>
      </div>
    </div>
  );
};
