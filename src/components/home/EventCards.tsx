import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton} from "@heroui/react";

type EventCardProps = {
  id: number;
  title: string;
  numConf: number;
};

export const EventCard: React.FC<EventCardProps> = ({ id, title, numConf }) => {
  const navigate = useNavigate();

  const openEdition = () => {
    navigate(`/edition/${id}/${encodeURIComponent(title)}`);
  };

  return (
    <div
      onClick={openEdition}
      className="shadow-[inset_0_0px_50px_rgba(255,255,255,0.04)] border-c3 border-2 hover:bg-c3 cursor-pointer p-50 rounded-12 justify-between flex flex-col gap-20 bg-c2 hover:bg-c3 h-full transition-all ease-in-out duration-200"
    >
      <p className='text-32 font-semibold transition-all ease-in-out duration-200 bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left'>{title}</p>
      <p className='text-16 text-c5 font-extralight transition-all ease-in-out duration-200'>{numConf} conférences</p>
    </div>
  );
};



export const EventSkeleton: React.FC = () => {
  return (
    <div className="p-50 rounded-12 justify-between flex flex-col gap-20 bg-c4">
      <Skeleton className="rounded-8">
        <div className="rounded-8 bg-c4">
          <p className="text-32">_</p>
        </div>
      </Skeleton>
      <Skeleton className="w-3/5 rounded-8">
        <div className="rounded-8 bg-c4">
          <p className="text-16">_</p>
        </div>
      </Skeleton>
    </div>
  );
};