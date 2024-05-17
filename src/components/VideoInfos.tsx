import React from 'react';
import { Link } from '@nextui-org/link';
import { VideoDescription } from './VideoDescription';

export const VideoInfos: React.FC = () => {
  return (
    <>
      <div className='w-full flex flex-col gap-xs'>
        <div className='font-semibold text-lg'>Théorie des Graphes et Optimisation Combinatoire</div>
        <Link
          className='text-secondary-400 text-md hover:opacity-100 text-secondary'
          isExternal
          href='https://youtu.be/56STvMBKYdw'
          showAnchorIcon>
          Hao Li, Université Paris Sud, Allemagne
        </Link>
        <div className='text-sm'>12 octobre 2023</div>
      </div>
      <VideoDescription text="Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur. Il est co-fondateur et PDG de Pinscreen, Inc, ainsi que professeur agrégé de vision par ordinateur à l'Université d'intelligence artificielle Mohamed Bin Zayed. Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur.Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur. Il est co-fondateur et PDG de Pinscreen, Inc, ainsi que professeur agrégé de vision par ordinateur à l'Université d'intelligence artificielle Mohamed Bin Zayed. Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur." />
    </>
  );
};
