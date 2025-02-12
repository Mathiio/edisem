import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@nextui-org/react';
import { Link } from '@nextui-org/react';


type ActantCardProps = {
  id: number;
  firstname: string;
  lastname: string;
  picture: string;
  interventions: number;
  universities: { name: string; logo: string }[];
};

export const ActantCard: React.FC<ActantCardProps> = ({ id, firstname, lastname, picture, interventions, universities }) => {
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
      className={`cursor-pointer border-2 h-full rounded-12 flex flex-col items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${
        isHovered ? 'border-c4' : 'border-c3'
      }`}>
      {picture ? (
        <img src={picture} alt={`${firstname} ${lastname}`} className="w-75 h-75 object-cover rounded-12" />
      ) : (
        <div className="w-75 h-75 rounded-12 object-cover flex items-center justify-center bg-c3">
          <svg width="26" height="38" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.999 0C10.397 0 5.8427 4.6862 5.8427 10.4504C5.8427 16.1047 10.1404 20.6809 15.7424 20.8789C15.9135 20.8569 16.0845 20.8569 16.2128 20.8789C16.2556 20.8789 16.2769 20.8789 16.3197 20.8789C16.3411 20.8789 16.3411 20.8789 16.3625 20.8789C21.8362 20.6809 26.1339 16.1047 26.1553 10.4504C26.1553 4.6862 21.601 0 15.999 0Z" fill="#A1A1AA"/>
            <path d="M26.8617 26.7293C20.8962 22.6371 11.1677 22.6371 5.15945 26.7293C2.44398 28.5993 0.947266 31.1295 0.947266 33.8356C0.947266 36.5417 2.44398 39.0498 5.13807 40.8979C8.1315 42.966 12.0656 44 15.9999 44C19.9341 44 23.8683 42.966 26.8617 40.8979C29.5558 39.0278 31.0525 36.5197 31.0525 33.7916C31.0311 31.0854 29.5558 28.5773 26.8617 26.7293Z" fill="#A1A1AA"/>
          </svg>
        </div>
      )}
      <div className='flex flex-col justify-center items-center'>
        <p className='text-16 text-center text-c6 font-medium'>{firstname} {lastname}</p>
        <p className='text-16 text-c5 font-extralight'>
        {interventions} intervention{interventions > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-col flex items-center justify-center gap-5">
        {universities.map((university, index) => (
          <div key={index} className='flex items-center justify-center gap-5'>
            <img
              src={university.logo}
              alt={(university.name).replace(/Université/g, 'U.').replace(/Vincennes-Saint-Denis/g, '')}
              className='w-auto h-15 object-cover rounded-full mb-5'
            />
            <p className='text-12 text-left text-c5 font-extralight'>{(university.name).replace(/Université/g, 'U.').replace(/Vincennes-Saint-Denis/g, '')}</p>
          </div>
        ))}
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
