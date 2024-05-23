import { Navbar } from '@/components/Navbar';
import { NavKeyWords } from '@/components/NavKeyWords';
import { YouTubeVideo } from '@/components/VideoEmbed';
import { VideoInfos } from '@/components/VideoInfos';
import { ContentTab } from '@/components/ContentTab';
import { Carousel } from '@/components/Carousel';
import { Scrollbar } from '@/components/Scrollbar';

export const Home = () => {
  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='w-full max-w-xl grid grid-cols-12 gap-75 p-50 transition-all ease-in-out duration-200 '>
          <div className='col-span-9 md:col-span-12'>
            <Navbar />
          </div>
          <div className='col-span-9 md:col-span-7 flex flex-col gap-50'>
            <div className='w-full flex flex-col gap-25'>
              <NavKeyWords numberOfButtons={16} />
              <YouTubeVideo videoUrl='56STvMBKYdw?si=6TJjovmA3ezE4_3v' />
            </div>
            <div className='w-full flex flex-col gap-25'>
              <VideoInfos />
            </div>
          </div>
          <div className='col-span-9 md:col-span-5 flex flex-col gap-50'>
            <ContentTab />
            <Carousel />
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
