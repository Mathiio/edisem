import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { Link } from '@heroui/react';
import { ParticipateIcon, UserIcon } from '@/components/ui/icons';
import { Actant } from '@/types/ui';

// Card displaying an intervenant with name, photo, university and intervention count
export const IntervenantCard: React.FC<Actant> = ({ id, firstname, lastname, picture, interventions, universities }) => {
  const navigate = useNavigate();

  // Navigate to intervenant's page
  const openIntervenantPage = () => {
    navigate(`/intervenant/${id}`);
  };

  return (
    <div
      onClick={openIntervenantPage}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] h-full border-c3 border-2 cursor-pointer p-20 rounded-30 flex flex-col items-center justify-center gap-20 hover:bg-c2 transition-all duration-200'>
      {/* Picture or fallback icon */}
      {picture ? (
        <img src={picture} alt={`${firstname} ${lastname}`} className='w-60 h-60 object-cover rounded-14' />
      ) : (
        <div className='w-60 h-60 rounded-14 object-cover flex items-center justify-center bg-c3'>
          <UserIcon size={24} className='text-c6' />
        </div>
      )}
      {/* Intervenant name and University logos and names */}
      <div className='flex flex-col justify-center items-center gap-5'>
        <p className='text-16 text-center text-c6 font-medium'>
          {firstname} {lastname}
        </p>
        <div className='flex-col flex items-center justify-center gap-5'>
          {universities.map((university, index) => (
            <div key={index} className='flex items-center justify-center gap-5'>
              <img src={university.logo} alt={university.shortName} className='w-auto h-15 object-cover rounded-full' />
              <p className='text-12 text-left text-c5 font-extralight'>{university.shortName}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Number of interventions */}
      <div className='flex gap-5 items-center'>
        <ParticipateIcon size={20} className='text-c5' />
        <p className='text-14 text-c5 font-regular'>
          {interventions} interv{interventions > 1 ? '.' : '.'}
        </p>
      </div>
    </div>
  );
};

// Skeleton loader for IntervenantCard
export const IntervenantSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col rounded-12 items-center justify-center p-20 gap-20 bg-c4'>
      <Skeleton className='w-75 h-75 rounded-12 justify-center flex'></Skeleton>
      <div className='w-full flex flex-col justify-center items-center gap-5'>
        <Skeleton className='w-[65%] rounded-8'>
          <p className='text-16 text-c6 font-semibold'>_</p>
        </Skeleton>
        <Skeleton className='w-[40%] rounded-8'>
          <p className='text-16 text-c6 font-regular'>_</p>
        </Skeleton>
      </div>
      <div className='w-full flex flex-col justify-center items-center'>
        <Skeleton className='w-[85%] rounded-8'>
          <p className='text-12 text-c6 font-semibold'>_</p>
        </Skeleton>
      </div>
    </div>
  );
};

type InfoCardProps = {
  name: string | undefined;
  link: string;
};

// Card displaying a simple piece of linked information
export const InfoCard: React.FC<InfoCardProps> = ({ name, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-2 border-c3 h-full w-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity 
        ${link ? `cursor-pointer ${isHovered ? 'border-c4' : 'border-c3'}` : ''}`}>
      <div className='flex flex-col justify-center items-start gap-5'>
        <p className='text-14 leading-[120%] text-c6 font-regular'>{name}</p>
      </div>
    </div>
  );
  // Render as link if provided
  return (
    <>
      {link ? (
        <Link isExternal className='gap-10 text-c6 w-full' href={link}>
          {content}
        </Link>
      ) : (
        content
      )}
    </>
  );
};

// Skeleton loader for InfoCard
export const InfoSkeleton: React.FC = () => {
  return (
    <div className='h-full w-full flex flex-col rounded-12 items-start justify-start p-20 gap-5 bg-c4'>
      <Skeleton className='w-[100%] rounded-8'>
        <p className='text-14 leading-[120%] text-c6 font-regular'>_</p>
      </Skeleton>
      <Skeleton className='w-[60%] rounded-8'>
        <p className='text-14 leading-[120%] text-c6 font-regular'>_</p>
      </Skeleton>
    </div>
  );
};

export const IntervenantLongCard: React.FC<Actant> = ({ id, firstname, lastname, picture, interventions, universities }) => {
  const navigate = useNavigate();

  // Navigate to intervenant's page
  const openIntervenantPage = () => {
    navigate(`/intervenant/${id}`);
  };

  return (
    <div
      onClick={openIntervenantPage}
      className='shadow-[inset_0_0px_25px_rgba(255,255,255,0.05)] border-c3 border-2 hover:bg-c3 cursor-pointer h-full rounded-24 flex items-center justify-between p-20 gap-20 transition-transform-all duration-200'>
      <div className='flex items-center justify-start gap-20'>
        {/* Picture or fallback icon */}
        {picture ? (
          <img src={picture} alt={`${firstname} ${lastname}`} className='w-75 h-75 object-cover rounded-14' />
        ) : (
          <div className='w-75 h-75 rounded-14 object-cover flex items-center justify-center bg-c3'>
            <UserIcon size={24} className='text-c6' />
          </div>
        )}
        <div className='flex flex-col justify-center items-start gap-10'>
          <p className='text-16 text-center text-c6 font-medium'>
            {firstname} {lastname}
          </p>
          <div className='flex-col flex items-start justify-center gap-5'>
            {universities.map((university, index) => (
              <div key={index} className='flex items-center justify-center gap-5'>
                <img src={university.logo} alt={university.shortName} className='w-auto h-15 object-cover rounded-full' />
                <p className='text-14 text-left text-c5 font-extralight'>{university.shortName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='flex gap-5 items-center'>
        <ParticipateIcon size={20} className='text-c5' />
        <p className='text-14 text-c5 font-regular'>
          {interventions} interv{interventions > 1 ? '.' : '.'}
        </p>
      </div>
    </div>
  );
};

export const IntervenantLongCardSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col rounded-12 items-center justify-center p-20 gap-20 bg-c4'>
      <Skeleton className='w-75 h-75 rounded-12 justify-center flex'></Skeleton>
      <div className='w-full flex flex-col justify-center items-center gap-5'>
        <Skeleton className='w-[65%] rounded-8'>
          <p className='text-16 text-c6 font-semibold'>_</p>
        </Skeleton>
        <Skeleton className='w-[40%] rounded-8'>
          <p className='text-16 text-c6 font-regular'>_</p>
        </Skeleton>
      </div>
      <div className='w-full flex flex-col justify-center items-center'>
        <Skeleton className='w-[85%] rounded-8'>
          <p className='text-12 text-c6 font-semibold'>_</p>
        </Skeleton>
      </div>
    </div>
  );
};
