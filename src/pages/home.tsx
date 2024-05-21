import React from 'react';
import { Navbar } from '@/components/Navbar';
import { NavKeyWords } from '@/components/NavKeyWords';
import { YouTubeVideo } from '@/components/VideoEmbed';
import { VideoInfos } from '@/components/VideoInfos';
import { ContentTab } from '@/components/ContentTab';
import { Carousel } from '@/components/Carousel';


export const Home = () => {
  return (
    <main className='w-full bg-default-100 flex flex-col items-start gap-75 p-50 transition-all ease-in-out duration-200'>
      <Navbar />
      <div className='w-full flex flex-row gap-75'>
        <section className='w-[60%] flex flex-col gap-50'>
          <div className='w-full flex flex-col gap-25'>
            <NavKeyWords numberOfButtons={16} />
            <YouTubeVideo videoUrl='56STvMBKYdw?si=6TJjovmA3ezE4_3v' />
          </div>
          <div className='w-full flex flex-col gap-25'>
            <VideoInfos />
          </div>
        </section>
        <section className='w-[40%] flex flex-col gap-50'>
          <ContentTab />
          <Carousel />
        </section>
      </div>
    </main>
  );
};
