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
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200 '>
          <div className='col-span-10'>
            <Navbar />
          </div>
          <div className='col-span-10 lg:col-span-6 flex flex-col gap-50'>
            <div className='w-full flex flex-col gap-25'>
              <NavKeyWords numberOfButtons={16} />
              <YouTubeVideo videoUrl='56STvMBKYdw?si=6TJjovmA3ezE4_3v' />
            </div>
            <div className='w-full flex flex-col gap-25'>
              <VideoInfos />
            </div>
          </div>
          <div className='col-span-10 lg:col-span-4 flex flex-col gap-50'>
            <ContentTab />
            <Carousel />
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
