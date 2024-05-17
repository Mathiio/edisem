import React from 'react';
import { Link } from '@nextui-org/link';
import { VideoDescription } from './VideoDescription';
import { CreditIcon } from '@/components/icons';

export const VideoInfos: React.FC = () => {
  return (
    <>
      <div className='w-full flex flex-col gap-10'>
        <div className='font-semibold text-32'>Théorie des Graphes et Optimisation Combinatoire</div>
        <div className='w-full flex justify-start gap-10'>
          <h3 className='text-default-400 font-regular text-24 gap-10 transition-all ease-in-out duration-200'>Hao Li, Université Paris Sud, Allemagne</h3>
          <Link className='cursor-pointer'>
            <CreditIcon size={18} className='text-default-500 hover:text-default-600 transition-all ease-in-out duration-200'/>
          </Link>
        </div>
        <div className='text-16 font-thin text-default-400'>12 octobre 2023</div>
      </div>
      <VideoDescription text="Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur. Il est co-fondateur et PDG de Pinscreen, Inc, ainsi que professeur agrégé de vision par ordinateur à l'Université d'intelligence artificielle Mohamed Bin Zayed. Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur.Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur. Il est co-fondateur et PDG de Pinscreen, Inc, ainsi que professeur agrégé de vision par ordinateur à l'Université d'intelligence artificielle Mohamed Bin Zayed. Hao Li est un informaticien, un innovateur et un entrepreneur allemand, travaillant dans les domaines de l'infographie et de la vision par ordinateur." />
    </>
  );
};
