import React from 'react';
import { Scrollbar } from '../Utils/Scrollbar';

export interface BibliographyItem {
  creator: string[];
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
  id: number;
  thumbnail?: string;
}

const hasContent = (value: string | string[] | undefined | null) => {
  if (Array.isArray(value)) {
    return value.length > 0 && value.some((creator) => creator?.trim() !== '');
  }
  return typeof value === 'string' && value?.trim() !== '';
};

const formatAuthors = (creators: string[]) => {
  return creators.join(', '); // Gestion du tableau d'auteurs
};

// Modèles de formatage
const bibliographyTemplates: { [key: number]: (item: BibliographyItem) => React.ReactNode } = {
  40: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title}. </span>}
      {hasContent(item.source) && <i>{item.source}, </i>}
      {hasContent(item.volume) && <i>{item.volume}</i>}
      {hasContent(item.issue) && <span>({item.issue}), </span>}
      {hasContent(item.pages) && <span>{item.pages}. </span>}
      {hasContent(item.editor) && <span>{item.editor}. </span>}
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

      {hasContent(item.edition) && <span> {item.edition} éd.</span>}
      {hasContent(item.volume) && <span>, vol. {item.volume}</span>}
      {hasContent(item.pages) && <span>, p. {item.pages}</span>}

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
  88: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <span>{item.title} </span>}
      {hasContent(item.type) && <span> [{item.type}</span>}
      {hasContent(item.publisher) && <span>. {item.publisher + ']'}</span>}
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
      {hasContent(item.title) && <i>{item.title}</i>}
      {hasContent(item.publisher) && (
        <span>
          [{item.type}, {item.publisher}].{' '}
        </span>
      )}
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}. </i>}
      {hasContent(item.publisher) && (
        <span>
          [{item.type}, {item.publisher}]
        </span>
      )}

      {hasContent(item.volume) && (
        <span>
          {' '}
          <i>{item.volume}</i>{' '}
        </span>
      )}
      {hasContent(item.issue) && <span>({item.issue})</span>}
      {hasContent(item.pages) && <span>, {item.pages}</span>}
    </>
  ),
  82: (item) => (
    <>
      {hasContent(item.creator) && <span>{formatAuthors(item.creator)} </span>}
      {hasContent(item.date) && <span>({item.date}). </span>}
      {hasContent(item.title) && <i>{item.title}</i>}
      {hasContent(item.publisher) && <span>{item.publisher}. </span>}
    </>
  ),

  83: (item) => <>{hasContent(item.title) && <span>{item.title}. </span>}</>,
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

  const formatBibliography = (item: BibliographyItem) => {
    //console.log(item);
    const template = bibliographyTemplates[item.class];
    return template ? template(item) : item.title || 'Référence non formatée';
  };

  return (
    <div className='w-full flex flex-col justify-start items-start gap-10'>
      <div className={`flex ${thumbnail ? 'flex-row' : 'flex-col'} gap-4 items-start`}>
        {thumbnail && (
          <div className='flex-shrink-0'>
            <img src={thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
          </div>
        )}
        <div className='w-full flex flex-col gap-10'>
          <p className='text-default-600 text-16'>{formatBibliography(props)}</p>
          {url && (
            <a href={url} className='text-default-500 underline'>
              Voir la source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export const BibliographySkeleton: React.FC = () => {
  return (
    <div className='w-full flex flex-col justify-start rounded-12 items-start bg-default-200 p-10 gap-10'>
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
  return (
    <div className='w-full lg:h-[700px] xl:h-[750px]  flex flex-col gap-20'>
      <Scrollbar withGap>
        <div className='flex flex-col gap-50'>
          {loading ? (
            Array.from({ length: bibliographies.length }).map((_, index) => <BibliographySkeleton key={index} />)
          ) : bibliographies.length === 0 ? (
            <UnloadedCard />
          ) : (
            bibliographies.map((bibliography, index) => (
              <BibliographyCard key={index} {...bibliography} uniqueKey={index} />
            ))
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='w-full lg:h-[400px] xl:h-[450px] flex flex-col justify-center items-center gap-20'>
      <div className='text-default-200 text-6xl'>📄</div>
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-default-400 text-32 font-semibold'>Oups !</h2>
        <p className='text-default-400 text-16 text-center'>
          Aucune bibliographie n'est liée à cette conférence. Veuillez vérifier plus tard ou explorer d'autres sections.
        </p>
      </div>
    </div>
  );
};
