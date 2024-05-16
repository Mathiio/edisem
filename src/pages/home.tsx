import { Navbar } from '@/components/Navbar';
import { NavKeyWords } from '@/components/NavKeyWords';
import { YouTubeVideo } from '@/components/VideoEmbed';
import { VideoInfos } from '@/components/VideoInfos';
import { ContentTab } from '@/components/ContentTab';
import { Carousel } from '@/components/Carousel';

/*
const OPTIONS: EmblaOptionsType = { containScroll: false, align: 'start' }
const SLIDES = [
  'https://www.booska-p.com/wp-content/uploads/2023/06/Damso-Succes-Visu-News.jpg',
  'https://www.booska-p.com/wp-content/uploads/2023/06/Damso-Succes-Visu-News.jpg',
  // Add more image URLs as needed
]
*/

export const Home = () => {
  return (
    <main className='bg-default-50 flex flex-col items-start gap-md p-md font-["Inter"]'>
      <Navbar />
      <div className='w-full flex flex-row gap-lg'>
        <section className='w-[60%] flex flex-col gap-md'>
          <div className='w-full flex flex-col gap-sm'>
            <NavKeyWords numberOfButtons={50} />
            <YouTubeVideo videoUrl='56STvMBKYdw?si=6TJjovmA3ezE4_3v' />
          </div>
          <div className='w-full flex flex-col gap-sm'>
            <VideoInfos />
          </div>
        </section>
        <section className='w-full flex flex-col gap-md'>
          <ContentTab />
          <Carousel />
        </section>
      </div>
    </main>
  );
};
