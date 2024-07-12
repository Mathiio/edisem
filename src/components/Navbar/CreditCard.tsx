import React, { useState } from 'react';
import { LinkIcon } from '@/components/Utils/icons';
import { Link } from 'react-router-dom';

interface CreditCardProps {
  name: string;
  job: string;
}

export const CreditCard: React.FC<CreditCardProps> = ({ name, job }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to='https://github.com/nextui-org/nextui'
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 p-25 transition-transform-colors-opacity ${
        isHovered ? 'border-default-action' : 'border-default-300'
      }`}>
      <div
        className={`   transition-transform-colors-opacity ${isHovered ? 'text-default-action' : 'text-default-300'}`}>
        <img
          className=' max-w-[40px] max-h-[40px] rounded-xl'
          src='https://www.digicatapult.org.uk/wp-content/uploads/2021/11/DC_square_People_juergen-600x600-c-default.jpg'
          alt=''
        />
      </div>

      <div className='w-full flex flex-col'>
        <div className='flex-col gap-5 flex'>
          <div className='text-default-500 text-16 font-semibold'>{name}</div>
          <div className='text-default-400 text-16'>{job}</div>
        </div>
      </div>

      <div
        className={`flex min-w-[40px] min-h-[40px] border-2 rounded-12 justify-center items-center transition-transform-colors-opacity 
        ${isHovered ? 'border-default-action' : 'border-default-300'} 
        ${isHovered ? 'text-default-action' : 'text-default-300'}`}>
        <LinkIcon size={22} />
      </div>
    </Link>
  );
};
