import React, { useState } from 'react';
import { Link, Tooltip, Button } from '@nextui-org/react';
import { CreditIcon } from '@/components/icons';

export const VideoInfos: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
    console.log('click');
  };

  return (
    <>
      <div className='w-full flex flex-col gap-10'>
        <div className='font-semibold text-32'>Théorie des Graphes et Optimisation Combinatoire</div>
        <div className='w-full flex justify-between gap-10 items-center'>
          <div className='w-full flex justify-start gap-10 items-center'>
            <h3 className='text-default-400 font-regular text-24 gap-10 transition-all ease-in-out duration-200'>
              Hao Li, Université Paris Sud, Allemagne
            </h3>
            <Tooltip content='voir plus'>
              <Link className='cursor-pointer'>
                <CreditIcon
                  size={20}
                  className='relative text-default-500 hover:text-default-action transition-all ease-in-out duration-200'
                />
              </Link>
            </Tooltip>
          </div>
          <Button
            size='md'
            className='h-[32px] text-16 rounded-8 text-default-500 hover:text-default-500 bg-default-200 hover:bg-default-300 transition-all ease-in-out duration-200'>
            séance complète
          </Button>
        </div>
      </div>
      <div
        className='cursor-pointer flex flex-col bg-default-200 hover:bg-default-300 p-25 rounded-8 gap-10 transition-all ease-in-out duration-200'
        onClick={toggleExpansion}>
        <h3 className='text-16 text-default-500 font-semibold'>12 octobre 2023 - Edition Automne n° 4</h3>
        <p
          className='text-16 text-default-500 font-normal transition-all ease-in-out duration-200 gap-10'
          style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
          Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de
          l'infographie et de la vision par ordinateur. Il est co-fondateur et PDG de Pinscreen, Inc, ainsi que
          professeur agrégé de vision par ordinateur à l'Université d'intelligence artificielle Mohamed Bin Zayed. Hao
          Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de
          l'infographie et de la vision par ordinateur.Hao Li est un informaticien, un innovateur et un entrepreneur
          allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur. Il est co-fondateur
          et PDG de Pinscreen, Inc, ainsi que professeur agrégé de vision par ordinateur à l'Université d'intelligence
          artificielle Mohamed Bin Zayed. Hao Li est un informaticien, un innovateur et un entrepreneur allemand,
          travaillant dans les domaines de l'infographie et de la vision par ordinateur.
        </p>

        <div className='text-16 text-default-action font-bold transition-all ease-in-out duration-200'>
          {expanded ? 'moins' : '...affichez plus'}
        </div>
      </div>
    </>
  );
};
