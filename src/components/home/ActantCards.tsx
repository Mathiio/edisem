import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { Link } from '@heroui/react';
import { UserIcon } from '@/components/utils/icons';

type ActantCardProps = {
  id: number;
  firstname: string;
  lastname: string;
  picture: string;
  interventions: number;
  universities: { shortName: string; logo: string }[];
};

export const ActantCard: React.FC<ActantCardProps> = ({
  id,
  firstname,
  lastname,
  picture,
  interventions,
  universities,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const openConf = () => {
    navigate(`/conferencier/${id}`);
  };

  return (
    <div
      onClick={openConf}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer border-3 h-full rounded-12 flex flex-col items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${
        isHovered ? 'border-c4' : 'border-c3'
      }`}>
      {picture ? (
        <img src={picture} alt={`${firstname} ${lastname}`} className='w-75 h-75 object-cover rounded-20' />
      ) : (
        <div className='w-75 h-75 rounded-20 object-cover flex items-center justify-center bg-c3'>
          <UserIcon size={24} className='text-c6' />
        </div>
      )}
      <div className='flex-col flex items-center justify-center gap-5'>
        {universities.map((university, index) => (
          <div key={index} className='flex items-center justify-center gap-5'>
            <img
              src={university.logo}
              alt={university.shortName}
              className='w-auto h-15 object-cover rounded-full'
            />
            <p className='text-12 text-left text-c5 font-extralight'>
              {university.shortName}
            </p>
          </div>
        ))}
      </div>
      <div className='flex flex-col justify-center items-center'>
        <p className='text-16 text-center text-c6 font-medium'>
          {firstname} {lastname}
        </p>
        <p className='text-16 text-c5 font-extralight'>
          {interventions} intervention{interventions > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export const ActantSkeleton: React.FC = () => {
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

export const InfoCard: React.FC<InfoCardProps> = ({ name, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-2 border-c3 h-full w-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity 
        ${link ? `cursor-pointer ${isHovered ? 'border-c4' : 'border-c3'}` : ''}`}>
      <div className='flex flex-col justify-center items-start gap-5'>
        <p className='text-14 text-c6 font-regular'>{name}</p>
      </div>
    </div>
  );

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

export const InfoSkeleton: React.FC = () => {
  return (
    <div className='h-full w-full flex flex-col rounded-12 items-start justify-start p-20 gap-5 bg-c4'>
      <Skeleton className='w-[100%] rounded-8'>
        <p className='text-14 text-c6 font-regular'>_</p>
      </Skeleton>
      <Skeleton className='w-[60%] rounded-8'>
        <p className='text-14 text-c6 font-regular'>_</p>
      </Skeleton>
    </div>
  );
};
