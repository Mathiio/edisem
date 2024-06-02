import React from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { useFetchData } from '../hooks/useFetchData';

export const Conferencier: React.FC = () => {
  const { data, loading, error } = useFetchData();
  console.log(data);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'>
          <div className='col-span-10'>
            <Navbar />
            <div>
              <h1>Data from API:</h1>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <h2 key={index}>
                    {item['o:title']} - {item['schema:addressCountry'][0]?.['display_title']}
                  </h2>
                ))
              ) : (
                <p>No data found</p>
              )}
            </div>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
