import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton} from "@nextui-org/react";



type LgConfCardProps = {
  id: number;
  title: string;
  actant: string;
  date: string;
};

const truncateTitle = (title: string, maxLength: number) => {
  if (title.length > maxLength) {
    return title.slice(0, maxLength) + "...";
  }
  return title;
};

function formatDate(dateString: string) {
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const dateParts = dateString.split("-");
  const year = dateParts[0];
  const monthIndex = parseInt(dateParts[1], 10) - 1; 
  const day = parseInt(dateParts[2], 10);
  const formattedDate = `${day} ${mois[monthIndex]} ${year}`;
  
  return formattedDate;
}


export const LgConfCard: React.FC<LgConfCardProps> = ({ id, title, actant, date }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const openConf = () => {
    navigate(`/conference/${id}`);
  };

  return (
    <div onClick={openConf} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
    className="cursor-pointer flex flex-col gap-10 transition-all ease-in-out duration-200 relative">
      <div className={`absolute w-full h-full -z-10  rounded-12 transition-all ease-in-out duration-200 
        ${ isHovered ? 'bg-default-200 scale-105' : 'scale-100'}`}></div>
        <div className="p-50 w-full rounded-12 justify-center flex bg-gradient-to-br from-default-action200 to-default-action400">
            <h3 className="text-16 opacity-50 font-semibold text-default-selected" >CONFÉRENCE</h3>
        </div>
        <div className="flex flex-col gap-5">
            <p className='text-16 text-default-600 font-semibold'>{truncateTitle(title, 56)}</p>
            <p className='text-16 text-default-500 font-regular'>{actant}</p>
            <p className='text-14 text-default-500 font-regular'>{formatDate(date)}</p>
        </div>
    </div>
  );
};



export const LgConfSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-10">
        <Skeleton className="p-50 w-full rounded-12 justify-center flex">
            <p className="text-16">_</p>
        </Skeleton>
        <div className="flex flex-col gap-5">
            <Skeleton className="w-[90%] rounded-8">
                <p className="text-16 text-default-600 font-semibold">_</p>
                <p className="text-16 text-default-600 font-semibold">_</p>
            </Skeleton>
            <Skeleton className="w-[60%] rounded-8">
                <p className="text-16 text-default-500 font-regular">_</p>
            </Skeleton>
            <Skeleton className="w-[40%] rounded-8">
                <p className="text-14 text-default-500 font-regular">_</p>
            </Skeleton>
        </div>
    </div>
  );
};