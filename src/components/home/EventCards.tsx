import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton} from "@nextui-org/react";

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
      className="cursor-pointer p-50 rounded-12 justify-between flex flex-col gap-20 bg-gradient-to-br from-action500 to-action700 h-full"
    >
      <p className='text-32 text-selected font-medium'>{title}</p>
      <p className='text-16 text-selected font-extralight'>{numConf} conférences</p>
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