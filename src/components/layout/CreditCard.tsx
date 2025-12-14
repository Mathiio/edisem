import React, { useState } from 'react';

interface CreditCardProps {
  name: string;
  job: string;
  description?: string[]; // Change de string à string[]
}

export const CreditCard: React.FC<CreditCardProps> = ({ name, job, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 pt-25 pb-25 transition-transform-colors-opacity ${
        isHovered ? 'border-c4' : 'border-c3'
      }`}>
      <div
        className={`transition-transform-colors-opacity ${
          isHovered ? 'text-action' : 'text-c4'
        }`}></div>

      <div className='w-full flex flex-col'>
        <div className='flex-col gap-5 flex'>
          <div className='text-c6 text-16 font-medium'>{name}</div>
          <div className='text-c5 text-16'>{job}</div>
          {/* Liste des descriptions avec puces */}
          {description && description.length > 0 && (
            <ul className='list-disc list-inside text-c5 text-16'>
              {description.map((descItem, index) => (
                <li key={index}>{descItem}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
