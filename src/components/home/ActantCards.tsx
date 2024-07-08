import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@nextui-org/react";
import { UserIcon } from '../Utils/icons';
import { Link } from "@nextui-org/react";


type ActantCardProps = {
  id: number;
  name: string;
  interventions: number;
};


export const ActantCard: React.FC<ActantCardProps> = ({ id, name, interventions }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const openConf = () => {
    navigate(`/conferencier/${id}`);
  };

  return (
    <div onClick={openConf} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} 
    className={`cursor-pointer border-2 h-full rounded-12 flex flex-col items-center justify-center p-20 gap-20 transition-transform-colors-opacity ${ isHovered ? 'border-default-action' : 'border-default-300'}`}>
        <UserIcon className={`transition-transform-colors-opacity ${ isHovered ? 'text-default-action' : 'text-default-600'}`} size={40}/>
        <div className="flex flex-col justify-center items-center gap-5">
            <p className='text-16 text-center text-default-600 font-semibold'>{name}</p>
            <p className='text-16 text-default-500 font-regular'>{interventions} intervention{interventions > 1 ? 's' : ''}</p>
        </div>
    </div>
  );
};


export const ActantSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-12 items-center justify-center p-20 gap-20 bg-default-300">
        <Skeleton className="w-[40px] h-[40px] rounded-12 justify-center flex">
        </Skeleton>
        <div className="w-full flex flex-col justify-center items-center gap-5">
            <Skeleton className="w-[70%] rounded-8">
                <p className="text-16 text-default-600 font-semibold">_</p>
            </Skeleton>
            <Skeleton className="w-[40%] rounded-8">
                <p className="text-16 text-default-500 font-regular">_</p>
            </Skeleton>
        </div>
    </div>
  );
};







type InfoCardProps = {
  name: string;
  link:string;
};


export const InfoCard: React.FC<InfoCardProps> = ({ name, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-2 border-default-300 h-full w-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity 
        ${link ? `cursor-pointer ${isHovered ? 'border-default-action' : 'border-default-300'}` : ''}`}
    >
      <div className="flex flex-col justify-center items-start gap-5">
        <p className='text-14 text-default-500 font-regular'>{name}</p>
      </div>
    </div>
  );

  return (
    <>
      {link ? (
        <Link isExternal className='gap-10 text-default-600 w-full' href={link}>
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
    <div className="h-full w-full flex flex-col rounded-12 items-start justify-start p-20 gap-5 bg-default-300">
        <Skeleton className="w-[100%] rounded-8">
            <p className="text-14 text-default-500 font-regular">_</p>
        </Skeleton>
        <Skeleton className="w-[60%] rounded-8">
            <p className="text-14 text-default-500 font-regular">_</p>
        </Skeleton>
    </div>
  );
};