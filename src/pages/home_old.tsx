import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { FullCarrousel } from '../components/home/CarrouselsHome';
import { getSeminaires } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const handleClick = (id: number) => {
    navigate(`/edition/${id}`);
  };

  const [seminaires, setSeminaires] = useState<{ title: string; numConf: number }[]>([]);

  useEffect(() => {
    (async () => {
      const seminaires = await getSeminaires();
      setSeminaires(seminaires);
    })();
  }, []);

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200 pointer'>
          <div className='col-span-10'>
            <Navbar />
          </div>
          <div className='col-span-10 flex flex-col gap-75'>
            <FullCarrousel
              title='Derniers séminaires Arcanes'
              perPage={2}
              perMove={1}
              data={seminaires}
              renderSlide={(item) => (
                <div
                  onClick={() => handleClick(item.id)}
                  className='cursor-pointer p-50 rounded-[12px] justify-between flex flex-col gap-20 bg-gradient-to-br from-default-action500 to-default-action700'>
                  <p className='text-32 text-default-100 font-semibold'>{item.title}</p>
                  <p className='text-16 text-default-100 font-regular'>{item.numConf} conférences</p>
                </div>
              )}></FullCarrousel>
            <FullCarrousel
              title='Derniers séminaires Arcanes'
              perPage={3}
              perMove={1}
              data={seminaires}
              renderSlide={(item) => (
                <div className='cursor-pointer p-50 rounded-[12px] justify-between flex flex-col gap-20 bg-gradient-to-br from-default-action500 to-default-action700'>
                  <p className='text-32 text-default-100 font-semibold'>{item.title}</p>
                  <p className='text-16 text-default-100 font-regular'>{item.numConf} conférences</p>
                </div>
              )}></FullCarrousel>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
