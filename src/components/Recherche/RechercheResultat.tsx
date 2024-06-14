import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Link } from '@nextui-org/react';
import { UserIcon, LinkIcon } from '../Utils/icons';

interface Conferencier {
  name: string;
  universite: string;
  keyword: string[];
  intervention: string;
}

interface Seminaire {
  name: string;
  conferencier: string;
  date: string;
  keyword: string[];
  image: string; // Add image property here
}

interface RechercheResultatProps {
  conferenciers?: Conferencier[];
  seminaires?: Seminaire[];
  sortedResults?: (Conferencier | Seminaire)[];
}

export const RechercheResultat: React.FC<RechercheResultatProps> = ({ conferenciers, seminaires }) => {
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);

  const handleClick = (keyword: string) => {
    console.log(`Button clicked: ${keyword}`);
  };

  return (
    <div className='flex flex-col gap-25'>
      {conferenciers && (
        <div className='flex flex-col gap-25'>
          <h2 className='text-default-600 text-24 font-semibold'>Conférenciers</h2>
          <div className='flex flex-col gap-25'>
            {conferenciers.map((conferencier, index) => (
              <Link
                key={`conferencier-${index}`}
                onMouseEnter={() => setHoveredIndex(`conferencier-${index}`)}
                onMouseLeave={() => setHoveredIndex(null)}
                href='https://github.com/nextui-org/nextui'
                className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
                  hoveredIndex === `conferencier-${index}` ? 'border-default-action' : 'border-default-300'
                }`}>
                <div
                  className={`transition-transform-colors-opacity ${
                    hoveredIndex === `conferencier-${index}` ? 'text-default-action' : 'text-default-300'
                  }`}>
                  <UserIcon size={26} />
                </div>

                <div className='w-full flex flex-col gap-10'>
                  <div className='flex flex-col gap-5'>
                    <h3 className='text-default-500 text-16 font-semibold'>{conferencier.name}</h3>
                    <p className='text-default-400 text-16'>{conferencier.universite}</p>
                  </div>
                  <div className='flex gap-10'>
                    {conferencier.keyword.map((keyword, i) => (
                      <Button
                        key={i}
                        onClick={() => handleClick(keyword)}
                        radius='none'
                        className='px-2 text-16 h-[32px] rounded-8 font-regular bg-transparent border-2 border-default-300 hover:border-default-action hover:opacity-100 text-default-400 hover:text-default-action transition-all ease-in-out duration-200 navkeyword'>
                        {keyword}
                      </Button>
                    ))}
                  </div>
                  <p className='text-default-400 text-14'>{conferencier.intervention}</p>
                </div>

                <div
                  className={`flex min-w-[40px] min-h-[40px] border-2 rounded-12 justify-center items-center transition-transform-colors-opacity 
                    ${hoveredIndex === `conferencier-${index}` ? 'border-default-action' : 'border-default-300'} 
                    ${hoveredIndex === `conferencier-${index}` ? 'text-default-action' : 'text-default-300'}`}>
                  <LinkIcon size={22} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {seminaires && (
        <div className='flex flex-col gap-25'>
          <h2 className='text-default-600 text-24 font-semibold'>Séminaires</h2>
          <div className='flex flex-col gap-25'>
            {seminaires.map((seminaire, index) => (
              <Link
                key={`seminaire-${index}`}
                onMouseEnter={() => setHoveredIndex(`seminaire-${index}`)}
                onMouseLeave={() => setHoveredIndex(null)}
                href='https://github.com/nextui-org/nextui'
                className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
                  hoveredIndex === `seminaire-${index}` ? 'border-default-action' : 'border-default-300'
                }`}>
                <div
                  className={`transition-transform-colors-opacity ${
                    hoveredIndex === `seminaire-${index}` ? 'text-default-action' : 'text-default-300'
                  }`}>
                  <div
                    className=' w-[300px] h-[160px] rounded-8 bg-cover bg-center'
                    style={{
                      backgroundImage: `url(${seminaire.image})`,
                    }}></div>
                </div>

                <div className='w-full flex flex-col gap-10'>
                  <div className='flex-col gap-5 flex'>
                    <h3 className='text-default-500 text-16 font-semibold'>{seminaire.name}</h3>
                    <p className='text-default-400 text-16'>{seminaire.conferencier}</p>
                    <p className='text-default-400 text-14'>{seminaire.date}</p>
                  </div>

                  <div className='flex gap-2 mt-2'>
                    {seminaire.keyword.map((keyword, i) => (
                      <Button
                        key={i}
                        onClick={() => handleClick(keyword)}
                        radius='none'
                        className='px-2 text-16 h-[32px] rounded-8 font-regular bg-transparent border-2 border-default-300 hover:border-default-action hover:opacity-100 text-default-400 hover:text-default-action transition-all ease-in-out duration-200 navkeyword'>
                        {keyword}
                      </Button>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
