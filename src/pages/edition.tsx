import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { useParams } from 'react-router-dom';
import { Scrollbar } from '@/components/utils/Scrollbar';
import { getConfByEdition } from '../services/api';
import { LgConfCard, LgConfSkeleton } from '@/components/home/ConfCards';

export const Edition: React.FC = () => {
  const { id, title } = useParams<{ id: string; title?: string }>();
  const [conf, setConf] = useState<{ id: number; title: string; actant: string; date: string }[]>([]);
  const [loadingConf, setLoadingConf] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    const fetchConf = async () => {
      const conf = await getConfByEdition(Number(id));
      setConf(conf);
      setLoadingConf(false);
    };

    if (firstRender.current) {
      firstRender.current = false;
    } else {
      fetchConf();
    }
  }, []);

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'>
          <div className='col-span-10'>
            <Navbar />
          </div>
          <div className='col-span-10 flex flex-col gap-100'>
            <div className='gap-25 flex flex-col'>
              <h2 className='text-24 font-bold text-default-600'>Conférences de {title}</h2>
              <div className='grid grid-cols-4 grid-rows-3 gap-25'>
                {loadingConf
                  ? Array.from({ length: 12 }).map((_, index) => <LgConfSkeleton key={index} />)
                  : conf.map((item) => (
                      <LgConfCard key={item.id} id={item.id} title={item.title} actant={item.actant} date={item.date} />
                    ))}
              </div>
            </div>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
