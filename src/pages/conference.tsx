import { Navbar } from '@/components/Navbar/Navbar';
import { VideoInfos } from '@/components/conference/VideoInfos';
import { ContentTab } from '@/components/conference/ContentTab';
import { Carousel } from '@/components/conference/Carousel';
import { Scrollbar } from '@/components/Utils/Scrollbar';

export const Conference = () => {
  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200 '>
          <div className='col-span-10'>
            <Navbar />
          </div>
          <div className='col-span-10 lg:col-span-6 flex flex-col gap-50'>
            <VideoInfos/>
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
