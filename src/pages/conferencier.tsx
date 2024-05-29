import React from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { useFetchData } from '../hooks/useFetchData';

export const Conferencier: React.FC = () => {
  const { data, loading, error } = useFetchData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Extraction de o:title
  const title = data ? data['o:title'] : 'Title not found';

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'>
          <div className='col-span-10'>
            <Navbar />
            <div>
              <h1>Data from API:</h1>
              <h2>{title}</h2>
            </div>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
